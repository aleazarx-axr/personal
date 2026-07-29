const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// Serve static upload files publicly
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
const apiRoutes = require('./routes/apiRoutes');
app.use('/api', apiRoutes);

// --- SERVE FRONTEND ---
// Since Hostinger's folder structure can vary based on how Git was deployed,
// we will dynamically find the dist folder.
const fs = require('fs');
const possiblePaths = [
    path.join(__dirname, '../frontend/dist'), // Standard Git repo structure
    path.join(__dirname, 'frontend/dist'),    // Repo deployed into this folder
    path.join(__dirname, 'dist'),             // Just the dist folder was copied here
    path.join(__dirname, '../dist')
];

let frontendDist = possiblePaths.find(p => fs.existsSync(p));
if (!frontendDist) {
    frontendDist = possiblePaths[0]; // Fallback so it throws a clear ENOENT error
}

app.use(express.static(frontendDist));

// Any route that doesn't match an API route will send back the React index.html
app.use((req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});