const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- ACTIVITY LOGS ---
exports.getLogs = async (req, res) => {
    try {
        const [logs] = await db.execute(`SELECT l.id, l.action, l.details, l.created_at, CONCAT(u.first_name, ' ', u.last_name) AS user_name, r.role_name AS role FROM ActivityLogs l JOIN Users u ON l.user_id = u.id JOIN Roles r ON l.role_id = r.id ORDER BY l.created_at DESC LIMIT 100`);
        res.status(200).json(logs);
    } catch (error) { res.status(500).json({ message: 'Error fetching logs' }); }
};

// --- NEWS ---
exports.getNews = async (req, res) => {
    try {
        const [news] = await db.execute('SELECT * FROM News ORDER BY created_at DESC');
        res.status(200).json(news);
    } catch (error) { res.status(500).json({ message: 'Error fetching news' }); }
};

exports.createNews = async (req, res) => {
    const { title, category, content } = req.body;
    const imageUrl = req.file ? `/uploads/news/${req.file.filename}` : null;
    try {
        await db.execute('INSERT INTO News (title, category, content, image_url) VALUES (?, ?, ?, ?)', [title, category, content, imageUrl]);
        res.status(201).json({ message: 'News published' });
    } catch (error) { res.status(500).json({ message: 'Error creating news' }); }
};

exports.deleteNews = async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT image_url FROM News WHERE id = ?', [req.params.id]);
        if (rows.length > 0 && rows[0].image_url) {
            const imgPath = path.join(__dirname, '../', rows[0].image_url);
            if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
        await db.execute('DELETE FROM News WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Deleted successfully' });
    } catch (error) { res.status(500).json({ message: 'Error deleting' }); }
};

// --- ACADEMIC DATES ---
exports.getDates = async (req, res) => {
    try {
        const [dates] = await db.execute('SELECT * FROM AcademicDates ORDER BY event_date ASC');
        res.status(200).json(dates);
    } catch (error) { res.status(500).json({ message: 'Error fetching dates' }); }
};

exports.createDate = async (req, res) => {
    try {
        await db.execute('INSERT INTO AcademicDates (title, target_audience, event_date, end_date) VALUES (?, ?, ?, ?)', [req.body.title, req.body.target_audience, req.body.event_date, req.body.end_date || null]);
        res.status(201).json({ message: 'Date added' });
    } catch (error) { res.status(500).json({ message: 'Error adding date' }); }
};

exports.deleteDate = async (req, res) => {
    try {
        await db.execute('DELETE FROM AcademicDates WHERE id = ?', [req.params.id]);
        res.status(200).json({ message: 'Date deleted' });
    } catch (error) { res.status(500).json({ message: 'Error deleting' }); }
};

// --- ADMINISTRATORS ---
exports.getAdmins = async (req, res) => {
    try {
        const [admins] = await db.execute('SELECT * FROM Administrators ORDER BY rank_order ASC');
        res.status(200).json(admins);
    } catch (error) { res.status(500).json({ message: 'Error fetching admins' }); }
};

exports.createAdmin = async (req, res) => {
    const imageUrl = req.file ? `/uploads/admins/${req.file.filename}` : '/wmsu-logo.png';
    try {
        await db.execute('INSERT INTO Administrators (name, title, image_url, rank_order) VALUES (?, ?, ?, ?)', [req.body.name, req.body.title, imageUrl, req.body.rank_order || 0]);
        res.status(201).json({ message: 'Admin added' });
    } catch (error) { res.status(500).json({ message: 'Error adding admin' }); }
};

// --- CLASSROOMS ---
exports.getClassrooms = async (req, res) => {
    try {
        const [rooms] = await db.execute('SELECT * FROM Classrooms ORDER BY building ASC, room_number ASC');
        res.status(200).json(rooms);
    } catch (error) { res.status(500).json({ message: 'Error fetching classrooms' }); }
};

exports.createClassroom = async (req, res) => {
    try {
        await db.execute('INSERT INTO Classrooms (room_number, building, capacity, status, remarks) VALUES (?, ?, ?, ?, ?)', [req.body.room_number, req.body.building, req.body.capacity || 0, req.body.status || 'Available', req.body.remarks || '']);
        res.status(201).json({ message: 'Classroom added' });
    } catch (error) { res.status(500).json({ message: 'Error adding classroom' }); }
};

// --- TEACHING LOADS ---
exports.getTeachingLoads = async (req, res) => {
    try {
        const [loads] = await db.execute('SELECT * FROM TeachingLoads ORDER BY instructor_name ASC, subject_code ASC');
        res.status(200).json(loads);
    } catch (error) { res.status(500).json({ message: 'Error fetching loads' }); }
};

exports.createTeachingLoad = async (req, res) => {
    try {
        await db.execute('INSERT INTO TeachingLoads (instructor_name, subject_code, subject_title, units, schedule, room, semester) VALUES (?, ?, ?, ?, ?, ?, ?)', [req.body.instructor_name, req.body.subject_code, req.body.subject_title, req.body.units || 3, req.body.schedule, req.body.room, req.body.semester || '1st Semester']);
        res.status(201).json({ message: 'Load added' });
    } catch (error) { res.status(500).json({ message: 'Error adding load' }); }
};