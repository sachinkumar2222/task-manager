const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const checkAuth = require('../middleware/checkAuth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Temporary storage before Cloudinary


// Public route for a new user to create an account
router.post('/signup', authController.signup);

// Public route for an existing user to log in
router.post('/login', authController.login);

// --- YEH NAYA ROUTE HAI ---
// Public route for a new user to accept a workspace invitation
// Yeh route user se invitation token, naam aur password lega
router.post('/accept-invite', authController.acceptInvite);

// Protected route to update user profile
router.put('/profile', checkAuth, upload.single('profileImage'), authController.updateProfile);


module.exports = router;

