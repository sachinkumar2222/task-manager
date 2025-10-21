require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

app.use(express.json());

// --- Proxy Routes ---
// Auth Service
app.use('/api/auth', proxy(process.env.AUTH_SERVICE_URL));
app.use('/api/workspaces', proxy(process.env.AUTH_SERVICE_URL));

// Task Service
app.use('/api/projects', proxy(process.env.TASK_SERVICE_URL));
app.use('/api/tasks', proxy(process.env.TASK_SERVICE_URL));
app.use('/api/comments', proxy(process.env.TASK_SERVICE_URL));

// Analytics Service
app.use('/api/analytics', proxy(process.env.ANALYTICS_SERVICE_URL));

// Notification Service
app.use('/api/notify', proxy(process.env.NOTIFICATION_SERVICE_URL));

// --- YEH NAYA UPDATE HAI ---
// File Service
app.use('/api/files', proxy(process.env.FILE_SERVICE_URL));


app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Gateway is healthy and running.' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is live and listening on port ${PORT}`);
});

