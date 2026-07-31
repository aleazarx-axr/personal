const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

let drive = null;

try {
    const keyFilePath = path.join(__dirname, '../google-credentials.json');
    
    // Check if the service account file exists
    if (fs.existsSync(keyFilePath)) {
        const auth = new google.auth.GoogleAuth({
            keyFile: keyFilePath,
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        
        drive = google.drive({ version: 'v3', auth });
        console.log("Google Drive API initialized successfully via Service Account.");
    } else {
        console.log("WARNING: google-credentials.json is missing in the backend folder. Docs editing disabled.");
    }
} catch (error) {
    console.error("Google Drive Initialization Error:", error);
}

module.exports = drive;