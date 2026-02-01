require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const analyticsRoutes = require('./routes/analyticsRoutes');

connectDB();

const app = express();

app.use(express.json());

// Error handling middleware for JSON syntax errors (e.g. malformed payloads)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON received:', err.message);
    return res.status(400).json({ message: 'Invalid JSON payload' });
  }
  next();
});


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

