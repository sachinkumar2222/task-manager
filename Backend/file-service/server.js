require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db'); // Import DB connection
const fileRoutes = require('./routes/fileRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Allow form data parsing

// Register routes
// Note: API Gateway forwards /api/files -> / here.
app.use('/', fileRoutes);

// Health check
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "File Service is healthy and running!" 
    });
});

const PORT = process.env.PORT || 4004;

app.listen(PORT, () => {
  console.log(`🚀 File Service is live and listening on port ${PORT}`);
});