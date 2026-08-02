const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { uploadDoc, uploadMemo, uploadTemplate, uploadNews, uploadAdmin } = require('../middlewares/uploadMiddleware');

// --- SECURITY MIDDLEWARES ---
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per `window` (here, per 15 minutes)
    message: { message: "Too many login attempts from this IP, please try again after 15 minutes" },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Import Controllers
const userController = require('../controllers/userController');
const documentController = require('../controllers/documentController');
const memoController = require('../controllers/memoController');
const systemController = require('../controllers/systemDataController');
const schedulerController = require('../controllers/schedulerController');
const assessmentController = require('../controllers/assessmentController');

// --- USERS ---
router.post('/auth/login', loginLimiter, userController.loginUser);
router.post('/auth/forgot-password', loginLimiter, userController.forgotPassword);
router.get('/users', userController.getUsers);
router.post('/users/create', userController.createUser);
router.post('/users/setup-password', userController.setupPassword);
router.get('/users/validate-token', userController.validateToken);
router.put('/users/profile/:id', userController.updateProfile);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/archive', userController.archiveUser);
router.put('/users/:id/restore', userController.restoreUser);

// --- DOCUMENTS ---
router.get('/document-tracking', documentController.getLogs);
router.post('/document-tracking', uploadDoc.single('attachment'), documentController.createLog);
router.put('/document-tracking/:id', uploadDoc.fields([{ name: 'attachment', maxCount: 1 }, { name: 'extraFiles', maxCount: 3 }]), documentController.updateLog);
router.put('/document-tracking/:id/status', documentController.updateStatus);
router.delete('/document-tracking/:id', documentController.archiveLog);
router.put('/document-tracking/:id/restore', documentController.restoreLog);
router.post('/document-tracking/:id/edit-request', documentController.editRequest);
router.post('/document-tracking/:id/sync-request', documentController.syncRequest);

// --- MEMOS & TEMPLATES ---
router.get('/templates', memoController.getTemplates);
router.post('/templates', uploadTemplate.single('templateFile'), memoController.uploadTemplate);
router.delete('/templates/:name', memoController.deleteTemplate);
router.get('/memoranda', memoController.getMemos);
router.post('/memoranda/create-from-template', memoController.createFromTemplate);
router.put('/memoranda/:id', uploadMemo.fields([{ name: 'attachment', maxCount: 1 }, { name: 'extraFiles', maxCount: 3 }]), memoController.updateMemo);
router.put('/memoranda/:id/status', memoController.updateStatus);
router.delete('/memoranda/:id', memoController.archiveMemo);
router.put('/memoranda/:id/restore', memoController.restoreMemo);
router.post('/memoranda/:id/edit-request', memoController.editRequest);
router.post('/memoranda/:id/sync-request', memoController.syncRequest);

// --- SYSTEM DATA (News, Dates, Admins, Classrooms, Loads) ---
router.get('/logs', systemController.getLogs);
router.get('/news', systemController.getNews);
router.post('/news', uploadNews.single('image'), systemController.createNews);
router.delete('/news/:id', systemController.deleteNews);
router.get('/academic-dates', systemController.getDates);
router.post('/academic-dates', systemController.createDate);
router.delete('/academic-dates/:id', systemController.deleteDate);
router.get('/administrators', systemController.getAdmins);
router.post('/administrators', uploadAdmin.single('image'), systemController.createAdmin);
router.get('/classrooms', systemController.getClassrooms);
router.post('/classrooms', systemController.createClassroom);
router.get('/teaching-loads', systemController.getTeachingLoads);
router.post('/teaching-loads', systemController.createTeachingLoad);
router.get('/system/network-info', systemController.getNetworkInfo);
router.get('/settings', systemController.getSettings);
router.post('/settings', systemController.saveSettings);

// --- SCHEDULER ---
router.post('/generate-schedule', schedulerController.generateSchedule);

// --- ASSESSMENT OF FEES ---
router.get('/assessment/data', assessmentController.getInitData);
router.post('/assessment/evaluate-fees', assessmentController.evaluateFees);
router.post('/assessment/record', assessmentController.saveRecord);
router.get('/assessment/records', assessmentController.getRecords);
router.get('/assessment/students', assessmentController.getStudentsList);
router.post('/assessment/import-students', assessmentController.importStudents);
router.post('/assessment/settings/campus', assessmentController.updateCampusSettings);
router.post('/assessment/settings/program', assessmentController.addProgram);
router.delete('/assessment/settings/program/:id', assessmentController.deleteProgram);
router.post('/assessment/settings/fee', assessmentController.addFee);
router.delete('/assessment/settings/fee/:id', assessmentController.deleteFee);
router.post('/assessment/settings/status', assessmentController.addStatus);
router.delete('/assessment/settings/status/:id', assessmentController.deleteStatus);

module.exports = router;