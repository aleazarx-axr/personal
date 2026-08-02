const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const https = require('https');
const fs = require('fs');
const selfsigned = require('selfsigned');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
// Disable CSP in dev to avoid breaking local React scripts, but enable other protections
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));
app.use(cors());
app.use(express.json());

// Serve static upload files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// --- SERVE FRONTEND ---
// The frontend React app is now built directly into the backend's 'public' folder.
const frontendDist = path.join(__dirname, 'public');

app.use(express.static(frontendDist));

// Any route that doesn't match an API route will send back the React index.html
app.use((req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// --- START SERVER (HTTPS) ---
async function startServer() {
    let key, cert;
    const keyPath = path.join(__dirname, 'key.pem');
    const certPath = path.join(__dirname, 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
        key = fs.readFileSync(keyPath, 'utf8');
        cert = fs.readFileSync(certPath, 'utf8');
    } else {
        console.log("Generating self-signed certificate for local HTTPS...");
        const attrs = [{ name: 'commonName', value: 'localhost' }];
        const pems = await selfsigned.generate(attrs, { days: 365 });
        key = pems.private;
        cert = pems.cert;
        fs.writeFileSync(keyPath, key);
        fs.writeFileSync(certPath, cert);
    }

    const server = https.createServer({ key, cert }, app);

    server.listen(PORT, '0.0.0.0', () => {
        console.log(`Secure HTTPS server running on port ${PORT}`);
    });
}

startServer();