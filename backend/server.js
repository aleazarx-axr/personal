// backend/server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

// --- NEW FILE UPLOAD IMPORTS ---
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Import your MySQL connection pool
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// --- FILE UPLOAD CONFIGURATION ---
// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads/documents');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Name the file: timestamp-originalname
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
    }
});
const upload = multer({ storage: storage });

// Middleware
app.use(cors()); // Allows your React frontend to communicate with this API
app.use(express.json()); // Parses incoming JSON data from frontend requests

// Make the uploads folder publicly accessible so the frontend can download them
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// ==========================================
// AUTHENTICATION & USERS ROUTES
// ==========================================

// --- SECURE LOGIN ROUTE (WITH SPY LOGS) ---
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log("-----------------------------------------");
    console.log("👀 1. FRONTEND SENT -> Email:", email, "| Password:", password);

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const [users] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, r.role_name 
             FROM Users u
             JOIN Roles r ON u.role_id = r.id
             WHERE u.email = ?`,
            [email]
        );

        console.log("👀 2. DATABASE FOUND ->", users.length, "user(s) matching that email.");

        if (users.length === 0) {
            console.log("❌ REASON: No user found, or the JOIN with Roles table failed.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        const user = users[0];
        console.log("👀 3. DATABASE HASH ->", user.password_hash);

        const isMatch = await bcrypt.compare(password, user.password_hash);
        console.log("👀 4. BCRYPT MATCH RESULT ->", isMatch);
        
        if (!isMatch) {
            console.log("❌ REASON: Passwords did not match.");
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        console.log("✅ SUCCESS: User authenticated!");
        res.status(200).json({
            message: 'Login successful',
            user: {
                id: user.id,
                firstName: user.first_name,
                lastName: user.last_name,
                email: user.email,
                role: user.role_name
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- SECURE CREATE USER ROUTE ---
app.post('/api/users/create', async (req, res) => {
    const { role_id, first_name, last_name, email, password } = req.body;

    if (!email || !password || !role_id) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    try {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const [result] = await db.execute(
            `INSERT INTO Users (role_id, first_name, last_name, email, password_hash) 
             VALUES (?, ?, ?, ?, ?)`,
            [role_id, first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({ message: 'User created securely.', userId: result.insertId });

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'Email already exists.' });
        }
        console.error("Creation Error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- GET ALL USERS ROUTE ---
app.get('/api/users', async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT 
                u.id, 
                u.first_name,
                u.last_name,
                CONCAT(u.first_name, ' ', u.last_name) AS name, 
                u.email, 
                u.role_id,
                r.role_name AS role,
                u.status 
            FROM Users u
            JOIN Roles r ON u.role_id = r.id
            ORDER BY u.id DESC
        `);
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- EDIT USER ROUTE ---
app.put('/api/users/:id', async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, role_id } = req.body;
    
    try {
        await db.execute(
            'UPDATE Users SET first_name = ?, last_name = ?, email = ?, role_id = ? WHERE id = ?',
            [first_name, last_name, email, role_id, userId]
        );
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) {
        console.error("Edit Error:", error);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// --- ARCHIVE USER ROUTE ---
app.put('/api/users/:id/archive', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute('UPDATE Users SET status = "Archived" WHERE id = ?', [userId]);
        res.status(200).json({ message: 'User archived successfully' });
    } catch (error) {
        console.error("Archive Error:", error);
        res.status(500).json({ message: 'Failed to archive user.' });
    }
});

// --- RESTORE USER ROUTE ---
app.put('/api/users/:id/restore', async (req, res) => {
    const userId = req.params.id;
    try {
        await db.execute('UPDATE Users SET status = "Active" WHERE id = ?', [userId]);
        res.status(200).json({ message: 'User restored successfully' });
    } catch (error) {
        console.error("Restore Error:", error);
        res.status(500).json({ message: 'Failed to restore user.' });
    }
});

const logActivity = async (userId, action, details = "") => {
    try {
        await db.execute(
            'INSERT INTO ActivityLogs (user_id, action, details) VALUES (?, ?, ?)',
            [userId, action, details]
        );
    } catch (error) {
        console.error("Failed to write to Activity Log:", error);
    }
};

// --- GET ACTIVITY LOGS ROUTE ---
app.get('/api/logs', async (req, res) => {
    try {
        const [logs] = await db.execute(`
            SELECT 
                l.id, 
                l.action, 
                l.details, 
                l.created_at, 
                CONCAT(u.first_name, ' ', u.last_name) AS user_name,
                r.role_name AS role
            FROM ActivityLogs l
            JOIN Users u ON l.user_id = u.id
            JOIN Roles r ON u.role_id = r.id
            ORDER BY l.created_at DESC
            LIMIT 100
        `);
        res.status(200).json(logs);
    } catch (error) {
        console.error("Error fetching logs:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});


// ==========================================
// MEMORANDA GENERATOR ROUTES
// ==========================================

// --- GET ALL MEMORANDA ---
app.get('/api/memoranda', async (req, res) => {
    try {
        const [memos] = await db.execute(`
            SELECT 
                m.id, m.memo_number AS memoNumber, m.subject, m.content, m.created_at AS date, 
                m.for_name, m.for_designation, m.thru_name, m.thru_designation,
                m.from_name, m.from_designation, m.table_data,
                r.role_name AS issuer 
            FROM Memoranda m
            JOIN Users u ON m.issuer_id = u.id
            JOIN Roles r ON u.role_id = r.id
            ORDER BY m.created_at DESC
        `);

        const [sigs] = await db.execute('SELECT memo_id, name, designation, status FROM MemoSignatories');

        const memosWithSigs = memos.map(memo => {
            memo.signatories = sigs.filter(s => s.memo_id === memo.id);
            return memo;
        });

        res.status(200).json(memosWithSigs);
    } catch (error) {
        console.error("🚨 GET Memos Error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
});

// --- PUBLISH NEW MEMO ---
app.post('/api/memoranda/create', async (req, res) => {
    const { subject, content, issuer_id, for_name, for_designation, thru_name, thru_designation, from_name, from_designation, table_data, signatories } = req.body;
    try {
        const currentYear = new Date().getFullYear();
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM Memoranda WHERE YEAR(created_at) = ?', [currentYear]);
        const nextNum = (rows[0].count + 1).toString().padStart(3, '0');
        const autoMemoNumber = `Memo No. ${nextNum}, s. ${currentYear}`;

        const [result] = await db.execute(
            `INSERT INTO Memoranda 
            (memo_number, subject, content, issuer_id, for_name, for_designation, thru_name, thru_designation, from_name, from_designation, table_data) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [autoMemoNumber, subject, content, issuer_id, for_name, for_designation, thru_name || '', thru_designation || '', from_name, from_designation, table_data || null]
        );

        if (signatories && signatories.length > 0) {
            for (let sig of signatories) {
                await db.execute('INSERT INTO MemoSignatories (memo_id, name, designation) VALUES (?, ?, ?)', [result.insertId, sig.name, sig.designation]);
            }
        }
        res.status(201).json({ message: 'Memo published successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to publish memo.' }); }
});

// --- UPDATE EXISTING MEMO ---
app.put('/api/memoranda/:id', async (req, res) => {
    const { subject, content, for_name, for_designation, thru_name, thru_designation, from_name, from_designation, table_data, signatories } = req.body;
    try {
        await db.execute(
            `UPDATE Memoranda SET subject=?, content=?, for_name=?, for_designation=?, thru_name=?, thru_designation=?, from_name=?, from_designation=?, table_data=? WHERE id=?`,
            [subject, content, for_name, for_designation, thru_name || '', thru_designation || '', from_name, from_designation, table_data || null, req.params.id]
        );
        await db.execute('DELETE FROM MemoSignatories WHERE memo_id=?', [req.params.id]);
        if (signatories && signatories.length > 0) {
            for (let sig of signatories) {
                await db.execute('INSERT INTO MemoSignatories (memo_id, name, designation) VALUES (?, ?, ?)', [req.params.id, sig.name, sig.designation]);
            }
        }
        res.status(200).json({ message: 'Memo updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to update memo.' }); }
});


// ==========================================
// DOCUMENT TRACKING / LOGGING ROUTES
// ==========================================

// GET all tracked documents
app.get('/api/document-tracking', async (req, res) => {
    try {
        const [logs] = await db.execute('SELECT * FROM DocumentTracking ORDER BY date_received DESC');
        res.status(200).json(logs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching document logs' });
    }
});

// POST new document log (WITH UPLOAD SUPPORT)
app.post('/api/document-tracking', upload.single('attachment'), async (req, res) => {
    const { date_received, category, document_type, subject, sender, receiver, status, remarks } = req.body;
    const attachmentPath = req.file ? `/uploads/documents/${req.file.filename}` : null;

    try {
        const currentYear = new Date().getFullYear();
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM DocumentTracking WHERE YEAR(created_at) = ?', [currentYear]);
        const nextNum = (rows[0].count + 1).toString().padStart(4, '0');
        const tracking_number = `TRK-${currentYear}-${nextNum}`;

        await db.execute(
            `INSERT INTO DocumentTracking (tracking_number, category, date_received, document_type, subject, sender, receiver, status, remarks, attachment) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [tracking_number, category || 'Incoming', date_received, document_type, subject, sender, receiver, status, remarks || '', attachmentPath]
        );
        res.status(201).json({ message: 'Document logged successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating document log' });
    }
});

// PUT update document log (WITH UPLOAD SUPPORT)
app.put('/api/document-tracking/:id', upload.single('attachment'), async (req, res) => {
    const { date_received, category, document_type, subject, sender, receiver, status, remarks } = req.body;
    
    try {
        let query = `UPDATE DocumentTracking SET date_received=?, category=?, document_type=?, subject=?, sender=?, receiver=?, status=?, remarks=?`;
        let params = [date_received, category || 'Incoming', document_type, subject, sender, receiver, status, remarks || ''];

        // If a new file was uploaded, update the attachment column too
        if (req.file) {
            query += `, attachment=?`;
            params.push(`/uploads/documents/${req.file.filename}`);
        }

        query += ` WHERE id=?`;
        params.push(req.params.id);

        await db.execute(query, params);
        res.status(200).json({ message: 'Document log updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating document log' });
    }
});

// DELETE document log
app.delete('/api/document-tracking/:id', async (req, res) => {
    try {
        await db.execute('DELETE FROM DocumentTracking WHERE id=?', [req.params.id]);
        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document log' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});