require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/apiRoutes');
const cron = require('node-cron');
const taskController = require('./controllers/taskController');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/', apiRoutes);
app.use('/', require('./routes/messageRoutes')); // Mount messages at root so /projects/... works

app.get('/', (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Task Service is healthy and running!"
  });
});

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`🚀 Task Service is live and listening on port ${PORT}`);

  // Schedule deadline check every day at midnight (or frequently as needed)
  // For testing/development, every hour might be better: '0 * * * *'
  // Or even every 5 minutes: '*/5 * * * *'
  // Let's go with every hour.
  // Schedule deadline check every day at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily deadline checker...');
    await taskController.checkDeadlines({}, {});
  });
});
