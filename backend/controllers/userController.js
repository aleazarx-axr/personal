// backend/controllers/userController.js
const bcrypt = require('bcrypt');
const db = require('../config/db'); // Ensure this path points correctly to your db config

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required.' });

    try {
        const [users] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.password_hash, r.role_name 
             FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.email = ?`, [email]
        );

        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, role: user.role_name }
        });
    } catch (error) { res.status(500).json({ message: 'Internal server error.' }); }
};

exports.createUser = async (req, res) => {
    const { role_id, first_name, last_name, email, password } = req.body;
    if (!email || !password || !role_id) return res.status(400).json({ message: 'Missing required fields.' });

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await db.execute(
            `INSERT INTO Users (role_id, first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?, ?)`,
            [role_id, first_name, last_name, email, hashedPassword]
        );
        res.status(201).json({ message: 'User created securely.', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists.' });
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.id, u.first_name, u.last_name, CONCAT(u.first_name, ' ', u.last_name) AS name, 
            u.email, u.role_id, r.role_name AS role, u.status 
            FROM Users u JOIN Roles r ON u.role_id = r.id ORDER BY u.id DESC
        `);
        res.status(200).json(users);
    } catch (error) { res.status(500).json({ message: 'Internal server error.' }); }
};

exports.updateUser = async (req, res) => {
    const { first_name, last_name, email, role_id } = req.body;
    try {
        await db.execute('UPDATE Users SET first_name = ?, last_name = ?, email = ?, role_id = ? WHERE id = ?', [first_name, last_name, email, role_id, req.params.id]);
        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to update user.' }); }
};

exports.archiveUser = async (req, res) => {
    try {
        await db.execute('UPDATE Users SET status = "Archived" WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'User archived successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to archive user.' }); }
};

exports.restoreUser = async (req, res) => {
    try {
        await db.execute('UPDATE Users SET status = "Active" WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'User restored successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to restore user.' }); }
};