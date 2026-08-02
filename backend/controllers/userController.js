// backend/controllers/userController.js
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const db = require('../config/db'); // Ensure this path points correctly to your db config
const { logActivity } = require('../utils/logger');

// --- NODEMAILER SETUP ---
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER, // e.g. wmsu.portal@gmail.com
        pass: process.env.SMTP_PASS  // Gmail App Password
    }
});

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    console.log(`[LOGIN ATTEMPT] IP: ${req.ip} | Email/Username: "${email}" | Password length: ${password ? password.length : 'N/A'}`);
    if (!email || !password) return res.status(400).json({ message: 'Username/Email and password are required.' });

    try {
        const [users] = await db.execute(
            `SELECT u.id, u.first_name, u.last_name, u.email, u.username, u.password_hash, r.role_name 
             FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.email = ? OR u.username = ?`, 
            [email, email]
        );

        if (users.length === 0) return res.status(401).json({ message: 'Invalid credentials.' });

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials.' });

        await logActivity(user.id, null, 'User Login', `${user.first_name} logged in successfully`);

        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, firstName: user.first_name, lastName: user.last_name, email: user.email, username: user.username, role: user.role_name }
        });
    } catch (error) { res.status(500).json({ message: 'Internal server error.' }); }
};

exports.createUser = async (req, res) => {
    const { role_id, first_name, last_name, email, password } = req.body;
    if (!email || !role_id || !first_name || !last_name) return res.status(400).json({ message: 'Missing required fields.' });

    try {
        // Generate Username
        const firstNames = first_name.trim().split(/\s+/);
        const cleanLastName = last_name.toLowerCase().replace(/\s+/g, '');
        
        let finalUsername = '';
        
        // Attempt 1: First word of first name . last name
        const attempt1 = `${firstNames[0].toLowerCase()}.${cleanLastName}`;
        const [existing1] = await db.execute('SELECT username FROM Users WHERE username = ?', [attempt1]);
        
        if (existing1.length === 0) {
            finalUsername = attempt1;
        } else {
            // Attempt 2: First two words of first name . last name (if available)
            const attempt2Base = firstNames.length > 1 
                ? `${firstNames[0].toLowerCase()}${firstNames[1].toLowerCase()}`
                : firstNames[0].toLowerCase();
            const attempt2 = `${attempt2Base}.${cleanLastName}`;
            
            const [existing2] = await db.execute('SELECT username FROM Users WHERE username = ?', [attempt2]);
            if (existing2.length === 0 && firstNames.length > 1) {
                finalUsername = attempt2;
            } else {
                // Fallback: Append number to the base
                const [existingAll] = await db.execute('SELECT username FROM Users WHERE username LIKE ?', [`${attempt2Base}.${cleanLastName}%`]);
                finalUsername = `${attempt2Base}.${cleanLastName}${existingAll.length || 1}`;
            }
        }

        // Handle Password (use provided, or generate a random fallback since column is NOT NULL)
        const tempPassword = password || crypto.randomBytes(8).toString('hex');
        const hashedPassword = await bcrypt.hash(tempPassword, 10);
        
        // Generate Setup Token & Expiry (24 hours)
        const setupToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const [result] = await db.execute(
            `INSERT INTO Users (role_id, first_name, last_name, email, username, password_hash, setup_token, token_expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [role_id, first_name, last_name, email, finalUsername, hashedPassword, setupToken, expiresAt]
        );

        const setupLink = `${req.headers.origin || 'http://localhost:5173'}/setup-password?token=${setupToken}`;
        const mailOptions = {
            from: process.env.SMTP_USER || 'no-reply@wmsu.edu.ph',
            to: email,
            subject: 'WMSU Portal - Account Setup',
            html: `
                <div style="font-family: Arial, sans-serif; max-w-md; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #9B1C1C;">Welcome to WMSU Portal</h2>
                    <p>Hello ${first_name},</p>
                    <p>Your administrative account has been created successfully.</p>
                    <div style="background-color: #f9fafb; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        <p style="margin: 0;"><strong>Username:</strong> ${finalUsername}</p>
                        ${password ? `<p style="margin: 5px 0 0 0;"><strong>Temporary Password:</strong> ${password}</p>` : ''}
                    </div>
                    <p>Please set up your permanent password by clicking the secure link below:</p>
                    <a href="${setupLink}" style="display: inline-block; padding: 10px 20px; background-color: #9B1C1C; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 10px;">Set Up Password</a>
                    <p style="margin-top: 20px; font-size: 12px; color: #666;">If you did not expect this email, please ignore it.</p>
                </div>
            `
        };

        // Try sending email, log it if SMTP isn't configured yet
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter.sendMail(mailOptions).catch(err => console.error("Email error:", err));
        } else {
            console.log("\n=================================");
            console.log("MOCK EMAIL SENT TO:", email);
            console.log("SETUP LINK:", setupLink);
            console.log("=================================\n");
        }

        await logActivity(null, null, 'User Created', `Created account for ${finalUsername} (${email})`);

        res.status(201).json({ message: 'User created securely.', userId: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email or Username already exists.' });
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.setupPassword = async (req, res) => {
    const { token, new_password } = req.body;
    if (!token || !new_password) return res.status(400).json({ message: 'Token and new password are required.' });

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(new_password)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.' });
    }

    try {
        const [users] = await db.execute('SELECT id, token_expires_at FROM Users WHERE setup_token = ?', [token]);
        if (users.length === 0) return res.status(400).json({ message: 'Invalid or expired setup token.' });

        if (users[0].token_expires_at && new Date() > new Date(users[0].token_expires_at)) {
            return res.status(400).json({ message: 'This setup link has expired after 24 hours. Please request a new one.' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        await db.execute('UPDATE Users SET password_hash = ?, setup_token = NULL, token_expires_at = NULL WHERE id = ?', [hashedPassword, users[0].id]);

        await logActivity(users[0].id, null, 'Password Setup', `User successfully set their initial password`);

        res.status(200).json({ message: 'Password set successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.validateToken = async (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).json({ valid: false, message: 'No token provided' });

    try {
        const [users] = await db.execute('SELECT id, token_expires_at FROM Users WHERE setup_token = ?', [token]);
        if (users.length === 0) return res.status(200).json({ valid: false, message: 'This link has already been used or is invalid.' });

        if (users[0].token_expires_at && new Date() > new Date(users[0].token_expires_at)) {
            return res.status(200).json({ valid: false, message: 'This link has expired after 24 hours. Please request a new one.' });
        }

        res.status(200).json({ valid: true });
    } catch (error) {
        res.status(500).json({ valid: false, message: 'Server error' });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await db.execute(`
            SELECT u.id, u.first_name, u.last_name, u.username, CONCAT(u.first_name, ' ', u.last_name) AS name, 
            u.email, u.role_id, r.role_name AS role, u.status, u.setup_token 
            FROM Users u JOIN Roles r ON u.role_id = r.id ORDER BY u.id DESC
        `);
        res.status(200).json(users);
    } catch (error) { res.status(500).json({ message: 'Internal server error.' }); }
};

exports.updateUser = async (req, res) => {
    const { first_name, last_name, email, role_id } = req.body;
    try {
        await db.execute('UPDATE Users SET first_name = ?, last_name = ?, email = ?, role_id = ? WHERE id = ?', [first_name, last_name, email, role_id, req.params.id]);
        
        await logActivity(null, null, 'User Updated', `Updated profile/role for user ID: ${req.params.id}`);

        res.status(200).json({ message: 'User updated successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to update user.' }); }
};

exports.archiveUser = async (req, res) => {
    try {
        await db.execute('UPDATE Users SET status = "Archived" WHERE id = ?', [req.params.id]);
        await logActivity(null, null, 'Account Suspended', `Suspended user ID: ${req.params.id}`);
        res.status(200).json({ message: 'User archived successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to archive user.' }); }
};

exports.restoreUser = async (req, res) => {
    try {
        await db.execute('UPDATE Users SET status = "Active" WHERE id = ?', [req.params.id]);
        await logActivity(null, null, 'Account Restored', `Restored access for user ID: ${req.params.id}`);
        res.status(200).json({ message: 'User restored successfully' });
    } catch (error) { res.status(500).json({ message: 'Failed to restore user.' }); }
};

exports.forgotPassword = async (req, res) => {
    const { identifier } = req.body;
    if (!identifier) return res.status(400).json({ message: 'Username or Email is required.' });

    try {
        const [users] = await db.execute('SELECT id, first_name, email FROM Users WHERE email = ? OR username = ?', [identifier, identifier]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'No account found with that username or email.' });
        }

        const user = users[0];
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await db.execute('UPDATE Users SET setup_token = ?, token_expires_at = ? WHERE id = ?', [token, expiresAt, user.id]);

        const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: user.email,
            subject: 'WMSU Portal - Password Reset',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                    <h2 style="color: #9B1C1C; border-bottom: 2px solid #9B1C1C; padding-bottom: 10px;">Password Reset Request</h2>
                    <p>Hello <b>${user.first_name}</b>,</p>
                    <p>We received a request to reset the password for your account.</p>
                    <p>Please click the button below to set a new password:</p>
                    <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; margin: 15px 0; background-color: #9B1C1C; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                    <p style="color: #555; font-size: 12px; margin-top: 20px;">If you did not request this, you can safely ignore this email.</p>
                </div>
            `
        };

        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            await transporter.sendMail(mailOptions);
        } else {
            console.log("-----------------------------------------");
            console.log(`MOCK EMAIL SENT TO: ${user.email}`);
            console.log(`SUBJECT: Password Reset`);
            console.log(`RESET LINK: ${resetLink}`);
            console.log("-----------------------------------------");
        }

        await logActivity(null, null, 'Password Reset Requested', `Sent reset link to ${user.email}`);

        res.status(200).json({ message: 'Password reset link sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

exports.updateProfile = async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email) return res.status(400).json({ message: 'First Name, Last Name, and Email are required.' });

    try {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await db.execute(
                'UPDATE Users SET first_name = ?, last_name = ?, email = ?, password_hash = ? WHERE id = ?',
                [first_name, last_name, email, hashedPassword, req.params.id]
            );
        } else {
            await db.execute(
                'UPDATE Users SET first_name = ?, last_name = ?, email = ? WHERE id = ?',
                [first_name, last_name, email, req.params.id]
            );
        }
        
        await logActivity(req.params.id, null, 'Profile Updated', `User ${first_name} ${last_name} updated their profile`);

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
};