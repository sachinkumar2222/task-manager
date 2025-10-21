require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB();

const app = express();

app.use(express.json());

app.use('/api/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Analytics Service is healthy and running!" 
    });
});

const PORT = process.env.PORT || 4005;

app.listen(PORT, () => {
  console.log(`🚀 Analytics Service is live and listening on port ${PORT}`);
});

