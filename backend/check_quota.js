const { google } = require('googleapis');
const path = require('path');
async function checkQuota() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: path.join(__dirname, 'google-credentials.json'),
            scopes: ['https://www.googleapis.com/auth/drive'],
        });
        const drive = google.drive({ version: 'v3', auth });
        const res = await drive.about.get({ fields: 'storageQuota' });
        console.log(res.data.storageQuota);
    } catch(e) {
        console.error(e);
    }
}
checkQuota();
