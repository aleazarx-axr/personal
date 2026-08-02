const { google } = require('googleapis');
const path = require('path');

async function emptyTrash() {
    try {
        const keyFilePath = path.join(__dirname, 'google-credentials.json');
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });

        console.log("Emptying trash...");
        await drive.files.emptyTrash();
        console.log(`Drive trash emptied successfully!`);
    } catch (error) {
        console.error("Cleanup Error:", error);
    }
}

emptyTrash();
