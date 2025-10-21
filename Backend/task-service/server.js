require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/apiRoutes');

const app = express();

app.use(express.json());

app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ 
        status: "success", 
        message: "Task Service is healthy and running!" 
    });
});

const PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`🚀 Task Service is live and listening on port ${PORT}`);
});
