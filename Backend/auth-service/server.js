require('dotenv').config();

const express = require('express');
const authRoutes = require('./routes/authRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

app.use('/api/workspaces', workspaceRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Auth Service is healthy and running!" 
    });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Auth Service is live and listening on port ${PORT}`);
});

