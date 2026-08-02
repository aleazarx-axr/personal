const { google } = require('googleapis');
const path = require('path');

async function cleanDrive() {
    try {
        const keyFilePath = path.join(__dirname, 'google-credentials.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        console.log("Fetching files from Service Account Drive to free up space...");
        let pageToken = null;
        let totalDeleted = 0;
        
        do {
            const res = await drive.files.list({
                q: "'me' in owners", // Only files owned by this service account
                fields: 'nextPageToken, files(id, name)',
                pageToken: pageToken
            });
            const files = res.data.files;
            
            if (files && files.length > 0) {
                for (const file of files) {
                    try {
                        await drive.files.delete({ fileId: file.id });
                        console.log(`Deleted orphan file: ${file.name}`);
                        totalDeleted++;
                    } catch(err) {
                        console.log(`Failed to delete ${file.name}: ${err.message}`);
                    }
                }
            }
            pageToken = res.data.nextPageToken;
        } while (pageToken);

        console.log(`Drive cleanup complete. Freed up space by deleting ${totalDeleted} orphaned files!`);
    } catch (error) {
        console.error("Cleanup Error:", error);
    }
}

cleanDrive();
