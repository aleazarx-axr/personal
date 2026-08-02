const fs = require('fs');

// 1. Update memoController.js
let memoCtrl = fs.readFileSync('backend/controllers/memoController.js', 'utf8');

if (!memoCtrl.includes('exports.editRequest')) {
  const newFunctions = `
exports.editRequest = async (req, res) => {
    if (!drive) return res.status(500).json({ message: "Google Drive API not configured." });
    try {
        const { targetUrl } = req.body;
        const [rows] = await db.execute('SELECT attachment, subject FROM Memoranda WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ message: "Record not found" });

        const fileUrl = targetUrl || rows[0].attachment;
        if (!fileUrl) return res.status(404).json({ message: "File not found" });

        const filePath = path.join(__dirname, '../', fileUrl);
        const fileMetadata = { name: \`Editing: \${rows[0].subject}\`, mimeType: 'application/vnd.google-apps.document' };
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
`;
  fs.writeFileSync('backend/controllers/memoController.js', memoCtrl + '\n' + newFunctions);
}

// 2. Update apiRoutes.js
let apiRoutes = fs.readFileSync('backend/routes/apiRoutes.js', 'utf8');

if (!apiRoutes.includes('/memoranda/:id/edit-request')) {
  apiRoutes = apiRoutes.replace(
    "router.put('/memoranda/:id/restore', memoController.restoreMemo);",
    "router.put('/memoranda/:id/restore', memoController.restoreMemo);\nrouter.post('/memoranda/:id/edit-request', memoController.editRequest);\nrouter.post('/memoranda/:id/sync-request', memoController.syncRequest);"
  );
  fs.writeFileSync('backend/routes/apiRoutes.js', apiRoutes);
}

console.log('Fixed backend routes for Memoranda Docs bridge');
