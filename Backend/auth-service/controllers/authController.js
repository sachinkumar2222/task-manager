const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Workspace = require('../models/workspaceModel'); // Import the Workspace model

/**
 * Creates a new user account.
 */
exports.signup = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'Please provide full name, email, and password.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = {
      fullName,
      email,
      passwordHash,
    };

    const createdUser = await User.create(newUser);

    res.status(201).json({
      message: 'User created successfully! Please log in to continue.',
      user: createdUser,
    });

  } catch (error) {
    console.error('Signup Error:', error);
    res.status(500).json({ message: 'Internal server error during registration.' });
  }
};

/**
 * Logs in an existing user.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });

    res.status(200).json({
      message: 'Login successful!',
      token: `Bearer ${token}`,
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Internal server error during login.' });
  }
};

/**
 * Accepts an invitation sent to a new user.
 */
exports.acceptInvite = async (req, res) => {
  try {
    const { token, fullName, password } = req.body;

    // Validate inputs
    if (!token || !fullName || !password) {
      return res.status(400).json({ message: 'Token, full name, and password are required.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Call the Workspace model to handle all database logic
    // We pass the plain-text password so the model can hash it inside a transaction
    const result = await Workspace.acceptInvitation(token, fullName, password);

    // Send success response
    res.status(200).json({
      message: 'Invitation accepted successfully! You are now a member of the workspace.',
      user: result.user,
    });

  } catch (error) {
    // Handle specific model-level errors
    if (error.message.includes('Invalid or expired')) {
      return res.status(400).json({ message: error.message });
    }

    console.error('Accept Invite Error:', error);
    res.status(500).json({ message: 'Internal server error while accepting invitation.' });
  }
};
  