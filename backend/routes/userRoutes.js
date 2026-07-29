// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ==========================================
// AUTHENTICATION ROUTES
// ==========================================
router.post('/auth/login', userController.loginUser);

// ==========================================
// USER MANAGEMENT ROUTES
// ==========================================
router.post('/users/create', userController.createUser);
router.get('/users', userController.getUsers);
router.put('/users/:id', userController.updateUser);
router.put('/users/:id/archive', userController.archiveUser);
router.put('/users/:id/restore', userController.restoreUser);

module.exports = router;