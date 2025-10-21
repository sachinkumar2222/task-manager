const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Public route for a new user to create an account
router.post('/signup', authController.signup);

// Public route for an existing user to log in
router.post('/login', authController.login);

// --- YEH NAYA ROUTE HAI ---
// Public route for a new user to accept a workspace invitation
// Yeh route user se invitation token, naam aur password lega
router.post('/accept-invite', authController.acceptInvite);

module.exports = router;

