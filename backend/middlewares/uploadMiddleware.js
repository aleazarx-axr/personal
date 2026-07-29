const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure directories exist
const dirs = ['uploads/documents', 'uploads/memoranda', 'templates', 'uploads/news', 'uploads/admins'];
dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '../', dir);
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
});

// Common file naming convention
const generateFilename = (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'));
};

// Document Uploads
const docStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/documents')),
    filename: generateFilename
});

// Memo Uploads
const memoStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/memoranda')),
    filename: generateFilename
});

// Template Uploads
const templateStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../templates')),
    filename: (req, file, cb) => {
        const typeName = req.body.typeName ? req.body.typeName.replace(/\s+/g, '_').toLowerCase() : 'custom';
        cb(null, `${typeName}_template.docx`);
    }
});

// News & Admin Uploads
const newsStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/news')),
    filename: (req, file, cb) => cb(null, 'news-' + Date.now() + path.extname(file.originalname))
});

const adminStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/admins')),
    filename: (req, file, cb) => cb(null, 'admin-' + Date.now() + path.extname(file.originalname))
});

module.exports = {
    uploadDoc: multer({ storage: docStorage }),
    uploadMemo: multer({ storage: memoStorage }),
    uploadTemplate: multer({ storage: templateStorage }),
    uploadNews: multer({ storage: newsStorage }),
    uploadAdmin: multer({ storage: adminStorage })
};