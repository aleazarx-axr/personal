const db = require('../config/db');
const drive = require('../services/driveService');
const fs = require('fs');
const path = require('path');
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');

exports.getTemplates = (req, res) => {
    try {
        const templatesDir = path.join(__dirname, '../templates');
        if (!fs.existsSync(templatesDir)) return res.status(200).json([]);
        const files = fs.readdirSync(templatesDir);
        const templates = files.filter(f => f.endsWith('_template.docx')).map(f => {
            return f.replace('_template.docx', '').split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        });
        res.status(200).json(templates);
    } catch (error) { res.status(500).json({ message: 'Error reading templates.' }); }
};

exports.uploadTemplate = (req, res) => res.status(201).json({ message: 'Template uploaded successfully.' });

exports.deleteTemplate = (req, res) => {
    try {
        const fileName = `${req.params.name.replace(/\s+/g, '_').toLowerCase()}_template.docx`;
        const filePath = path.join(__dirname, '../templates', fileName);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(200).json({ message: 'Template deleted.' });
    } catch (error) { res.status(500).json({ message: 'Error deleting template.' }); }
};

exports.getMemos = async (req, res) => {
    try {
        const isArchivedView = req.query.archived === 'true';
        const [memos] = await db.execute(`
            SELECT m.id, m.memo_number AS memoNumber, m.subject, m.created_at AS date, 
                   m.attachment, m.additional_attachments, 
                   COALESCE((SELECT dt.status FROM DocumentTracking dt WHERE dt.attachment = m.attachment ORDER BY dt.id DESC LIMIT 1), m.status) AS status, 
                   m.content AS remarks, r.role_name AS issuer 
            FROM Memoranda m LEFT JOIN Users u ON m.issuer_id = u.id LEFT JOIN Roles r ON u.role_id = r.id 
            WHERE COALESCE(m.is_archived, 0) = ? ORDER BY m.created_at DESC`, [isArchivedView ? 1 : 0]);
        res.status(200).json(memos);
    } catch (error) { 
        console.error("🔥 ERROR IN GET MEMOS:", error); 
        res.status(500).json({ message: 'Internal server error.', error: error.message }); 
    }
};

exports.createFromTemplate = async (req, res) => {
    const { subject, issuer_id, documentType } = req.body;
    const docType = documentType || 'Memo'; 

    try {
        let activeSeries = new Date().getFullYear().toString();
        const [settingRows] = await db.execute("SELECT setting_value FROM SystemSettings WHERE setting_key = 'academic_year_start'");
        if (settingRows.length > 0 && settingRows[0].setting_value) {
            activeSeries = new Date(settingRows[0].setting_value).getFullYear().toString();
        }

        const [countRows] = await db.execute('SELECT COUNT(*) as count FROM Memoranda WHERE memo_number LIKE ?', [`${docType}% s. ${activeSeries}`]);
        const nextNum = (countRows[0].count + 1).toString().padStart(3, '0');
        const docNumberString = `${docType} No. ${nextNum}, s. ${activeSeries}`;
        
        const templateFile = `${docType.replace(/\s+/g, '_').toLowerCase()}_template.docx`;
        const templatePath = path.join(__dirname, '../templates', templateFile);
        if (!fs.existsSync(templatePath)) return res.status(400).json({ message: 'Template file missing.' });
        
        const content = fs.readFileSync(templatePath, 'binary');
        const zip = new PizZip(content);
        const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });

        doc.render({ 
            memoNumber: nextNum, letterNumber: nextNum, docNumber: nextNum, year: activeSeries, 
            subject: subject.toUpperCase(), date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) 
        });

        const buf = doc.getZip().generate({ type: 'nodebuffer' });
        const fileName = `${docType.replace(/\s+/g, '_')}_${nextNum}_${activeSeries}_${Date.now()}.docx`.replace(/[^a-zA-Z0-9_.-]/g, '_');
        fs.writeFileSync(path.join(__dirname, '../uploads/memoranda', fileName), buf);
        const attachmentPath = `/uploads/memoranda/${fileName}`;

        const [docResult] = await db.execute(`INSERT INTO Memoranda (memo_number, subject, issuer_id, attachment) VALUES (?, ?, ?, ?)`, [docNumberString, subject, issuer_id, attachmentPath]);
        
        // Auto-log to Document Tracking
        const [docRows] = await db.execute('SELECT COUNT(*) as count FROM DocumentTracking WHERE tracking_number LIKE ?', [`TRK-${activeSeries}-%`]);
        const tracking_number = `TRK-${activeSeries}-${(docRows[0].count + 1).toString().padStart(4, '0')}`;
        await db.execute(`INSERT INTO DocumentTracking (tracking_number, category, date_received, document_type, subject, sender, receiver, status, remarks, attachment) VALUES (?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)`,
            [ tracking_number, 'Outgoing', docType, `${docNumberString.replace(',', '')}, ${subject}`, 'System User', 'To Be Routed', 'Pending', `Auto-logged.`, attachmentPath ]);

        res.status(201).json({ message: 'Document drafted', id: docResult.insertId, memoNumber: docNumberString, attachment: attachmentPath });
    } catch (error) { res.status(500).json({ message: 'Failed to create document.' }); }
};

exports.updateMemo = async (req, res) => {
    const { subject, remarks, existingExtraFiles, extraRemarks } = req.body;
    try {
        let finalExtraFiles = existingExtraFiles ? JSON.parse(existingExtraFiles) : [];
        if (req.files && req.files['extraFiles']) {
            const newFiles = req.files['extraFiles'];
            let rems = Array.isArray(extraRemarks) ? extraRemarks : (extraRemarks ? [extraRemarks] : newFiles.map(() => ''));
            newFiles.forEach((file, index) => { finalExtraFiles.push({ url: `/uploads/memoranda/${file.filename}`, remark: rems[index] || '' }); });
        }
        
        let query = `UPDATE Memoranda SET subject=?, content=?, additional_attachments=?`;
        let params = [subject, remarks || '', JSON.stringify(finalExtraFiles.slice(0, 3))];

        if (req.files && req.files['attachment']) { 
            query += `, attachment=?`; params.push(`/uploads/memoranda/${req.files['attachment'][0].filename}`); 
        }
        query += ` WHERE id=?`; params.push(req.params.id);

        await db.execute(query, params);
        res.status(200).json({ message: 'Updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Error updating' }); }
};

exports.updateStatus = async (req, res) => {
    try {
        await db.execute(`UPDATE Memoranda SET status=? WHERE id=?`, [req.body.status, req.params.id]);
        res.status(200).json({ message: 'Status updated' });
    } catch (error) { res.status(500).json({ message: 'Error updating status' }); }
};

exports.archiveMemo = async (req, res) => {
    try {
        await db.execute('UPDATE Memoranda SET is_archived = TRUE WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Archived successfully' });
    } catch (error) { res.status(500).json({ message: 'Error archiving' }); }
};

exports.restoreMemo = async (req, res) => {
    try {
        await db.execute('UPDATE Memoranda SET is_archived = FALSE WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Restored successfully' });
    } catch (error) { res.status(500).json({ message: 'Error restoring' }); }
};

exports.editRequest = async (req, res) => {
    if (!drive) return res.status(500).json({ message: "Google Drive API not configured." });
    try {
        const { targetUrl } = req.body;
        const [rows] = await db.execute('SELECT attachment, subject FROM Memoranda WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Record not found" });

        const fileUrl = targetUrl || rows[0].attachment;
        if (!fileUrl) return res.status(404).json({ message: "File not found" });

        const filePath = path.join(__dirname, '../', fileUrl);
        const fileMetadata = { name: `Editing: ${rows[0].subject}`, mimeType: 'application/vnd.google-apps.document' };
        const media = { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', body: fs.createReadStream(filePath) };

        const driveFile = await drive.files.create({ resource: fileMetadata, media: media, fields: 'id, webViewLink' });
        await drive.permissions.create({ fileId: driveFile.data.id, requestBody: { role: 'writer', type: 'anyone' }});
        res.status(200).json({ link: driveFile.data.webViewLink, driveId: driveFile.data.id });
    } catch (error) { 
        console.error("DRIVE API ERROR:", error);
        res.status(500).json({ message: 'Failed to push to Google Drive.', error: error.message }); 
    }
};

exports.syncRequest = async (req, res) => {
    if (!drive) return res.status(500).json({ message: "Google Drive API not configured." });
    try {
        const { driveId, targetUrl } = req.body;
        const [rows] = await db.execute('SELECT attachment FROM Memoranda WHERE id = ?', [req.params.id]);
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