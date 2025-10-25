require('dotenv').config();
const express = require('express');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// --- ROUTE REGISTRATION UPDATED ---
// Register fileRoutes at the root ('/') because the API Gateway adds '/api/files'
app.use('/', fileRoutes); 

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "File Service is healthy and running!" 
    });
});

// Use the correct port for the file service from our plan
const PORT = process.env.PORT || 4004; 

app.listen(PORT, () => {
  console.log(`🚀 File Service is live and listening on port ${PORT}`);
});

