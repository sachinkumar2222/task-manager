require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

const app = express();

app.use(express.json());

// --- ROUTES REGISTRATION UPDATED ---
// Register authRoutes at the root ('/') because the API Gateway already adds '/api/auth'
app.use('/', authRoutes); 

// Register workspaceRoutes at the root ('/') because the API Gateway already adds '/api/workspaces'
app.use('/', workspaceRoutes); 


app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Auth Service is healthy and running!" 
    });
});

// Use the correct port for the auth service
const PORT = process.env.PORT || 4001; 

app.listen(PORT, () => {
  console.log(`🚀 Auth Service is live and listening on port ${PORT}`);
});

