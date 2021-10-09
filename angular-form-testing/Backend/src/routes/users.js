const { Router } = require('express');
const UserController = require('../controllers/UserController');
const router = Router();

// Validation routes
router.post('/username-taken', UserController.username_taken);
router.post('/email-taken', UserController.email_taken);
router.post('/password-strength', UserController.password_strength);

// Main routes
router.post('/signup', UserController.store_user);

module.exports = router;