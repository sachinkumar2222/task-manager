require('dotenv').config();
const express = require('express');
const fileRoutes = require('./routes/fileRoutes');

const app = express();

app.use(express.json());

app.use('/api/files', fileRoutes);

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
