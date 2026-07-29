const db = require('../config/db');
const drive = require('../services/driveService');
const path = require('path');
const fs = require('fs');

exports.getLogs = async (req, res) => {
    try {
        const [logs] = await db.execute('SELECT * FROM DocumentTracking WHERE is_archived = 0 OR is_archived IS NULL ORDER BY date_received DESC');
        res.status(200).json(logs);
    } catch (error) { res.status(500).json({ message: 'Error fetching document logs' }); }
};

exports.createLog = async (req, res) => {
    const { date_received, category, document_type, subject, sender, receiver, status, remarks } = req.body;
    const attachmentPath = req.file ? `/uploads/documents/${req.file.filename}` : null;

    try {
        const currentYear = new Date().getFullYear();
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM DocumentTracking WHERE YEAR(created_at) = ?', [currentYear]);
        const tracking_number = `TRK-${currentYear}-${(rows[0].count + 1).toString().padStart(4, '0')}`;

        await db.execute(
            `INSERT INTO DocumentTracking (tracking_number, category, date_received, document_type, subject, sender, receiver, status, remarks, attachment) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tracking_number, category || 'Incoming', date_received, document_type, subject, sender, receiver, status, remarks || '', attachmentPath]
        );
        res.status(201).json({ message: 'Document logged successfully' });
    } catch (error) { res.status(500).json({ message: 'Error creating document log' }); }
};

exports.updateLog = async (req, res) => {
    const { date_received, category, document_type, subject, sender, receiver, status, remarks, existingExtraFiles, extraRemarks } = req.body;
    try {
        let finalExtraFiles = existingExtraFiles ? JSON.parse(existingExtraFiles) : [];
        if (req.files && req.files['extraFiles']) {
            const newFiles = req.files['extraFiles'];
            let rems = Array.isArray(extraRemarks) ? extraRemarks : (extraRemarks ? [extraRemarks] : newFiles.map(() => ''));
            newFiles.forEach((file, index) => { finalExtraFiles.push({ url: `/uploads/documents/${file.filename}`, remark: rems[index] || '' }); });
        }
        finalExtraFiles = finalExtraFiles.slice(0, 3);

        let query = `UPDATE DocumentTracking SET date_received=?, category=?, document_type=?, subject=?, sender=?, receiver=?, status=?, remarks=?, additional_attachments=?`;
        let params = [date_received, category || 'Incoming', document_type, subject, sender, receiver, status, remarks || '', JSON.stringify(finalExtraFiles)];

        if (req.files && req.files['attachment']) { 
            query += `, attachment=?`; params.push(`/uploads/documents/${req.files['attachment'][0].filename}`); 
        }
        query += ` WHERE id=?`; params.push(req.params.id);

        await db.execute(query, params);
        res.status(200).json({ message: 'Document log updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Error updating document log' }); }
};

exports.updateStatus = async (req, res) => {
    try {
        await db.execute(`UPDATE DocumentTracking SET status=? WHERE id=?`, [req.body.status, req.params.id]);
        res.status(200).json({ message: 'Status updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Error updating status' }); }
};

exports.archiveLog = async (req, res) => {
    try {
        const [result] = await db.execute('UPDATE DocumentTracking SET is_archived = 1 WHERE id=?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Document not found' });
        res.status(200).json({ message: 'Document archived successfully' });
    } catch (error) { res.status(500).json({ message: 'Error archiving document log' }); }
};

exports.restoreLog = async (req, res) => {
    try {
        const [result] = await db.execute('UPDATE DocumentTracking SET is_archived = 0 WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Document not found' });
        res.status(200).json({ message: 'Document restored successfully' });
    } catch (error) { res.status(500).json({ message: 'Error restoring document log' }); }
};

exports.editRequest = async (req, res) => {
    if (!drive) return res.status(500).json({ message: "Google Drive API not configured." });
    try {
        const { targetUrl } = req.body;
        const [rows] = await db.execute('SELECT attachment, subject FROM DocumentTracking WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Record not found" });

        const fileUrl = targetUrl || rows[0].attachment;
        if (!fileUrl) return res.status(404).json({ message: "File not found" });

        const filePath = path.join(__dirname, '../', fileUrl);
        const fileMetadata = { name: `Editing: ${rows[0].subject}`, mimeType: 'application/vnd.google-apps.document' };
        const media = { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', body: fs.createReadStream(filePath) };

        const driveFile = await drive.files.create({ resource: fileMetadata, media: media, fields: 'id, webViewLink' });
        await drive.permissions.create({ fileId: driveFile.data.id, requestBody: { role: 'writer', type: 'anyone' }});
        res.status(200).json({ link: driveFile.data.webViewLink, driveId: driveFile.data.id });
    } catch (error) { res.status(500).json({ message: 'Failed to push to Google Drive.', error: error.message }); }
};

exports.syncRequest = async (req, res) => {
    if (!drive) return res.status(500).json({ message: "Google Drive API not configured." });
    try {
        const { driveId, targetUrl } = req.body;
        const [rows] = await db.execute('SELECT attachment FROM DocumentTracking WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Record not found" });

        const fileUrl = targetUrl || rows[0].attachment;
        if (!fileUrl) return res.status(404).json({ message: "File not found" });

        const dest = fs.createWriteStream(path.join(__dirname, '../', fileUrl));
        await drive.files.export({ fileId: driveId, mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' }, { responseType: 'stream' })
            .then(response => new Promise((resolve, reject) => { response.data.pipe(dest).on('finish', resolve).on('error', reject); }));

        await drive.files.delete({ fileId: driveId }).catch(e => console.log("Drive Cleanup skipped"));
        res.status(200).json({ message: "Document synced successfully!" });
    } catch (error) { res.status(500).json({ message: 'Failed to sync from Google Drive.', error: error.message }); }
};