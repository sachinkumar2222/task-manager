require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// --- ROUTE REGISTRATION UPDATED ---
// Register analyticsRoutes at the root ('/') because the API Gateway adds '/api/analytics'
app.use('/', analyticsRoutes); 

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Analytics Service is healthy and running!" 
    });
});

// Use the correct port for the analytics service from our plan
const PORT = process.env.PORT || 4005; 

app.listen(PORT, () => {
  console.log(`🚀 Analytics Service is live and listening on port ${PORT}`);
});

