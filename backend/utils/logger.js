const db = require('../config/db');

/**
 * Logs an activity to the activitylogs table
 * @param {number|null} userId - The ID of the user performing the action
 * @param {number|null} roleId - The Role ID of the user
 * @param {string} action - Short description of the action (e.g. "User Login")
 * @param {string} details - Detailed description or context
 */
exports.logActivity = async (userId, roleId, action, details) => {
    try {
        await db.execute(
            'INSERT INTO activitylogs (user_id, role_id, action, details) VALUES (?, ?, ?, ?)',
            [userId || null, roleId || null, action, details || '']
        );
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
};
