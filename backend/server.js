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
// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Any route that doesn't match an API route will send back the React index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// --- START SERVER ---
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});