const { google } = require('googleapis');
require('dotenv').config();

let drive = null;

try {
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET && process.env.GOOGLE_REFRESH_TOKEN) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            "https://developers.google.com/oauthplayground"
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        drive = google.drive({ version: 'v3', auth: oauth2Client });
        console.log("Google Drive API initialized successfully via OAuth2.");
    } else {
        console.log("WARNING: Google OAuth2 variables missing in .env. Docs editing disabled.");
    }
} catch (error) {
    console.error("Google Drive Initialization Error:", error);
}

module.exports = drive;