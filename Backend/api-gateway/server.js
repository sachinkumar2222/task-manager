require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const url = require('url'); // Keep url module for path resolving

const app = express();

// Enable CORS for frontend
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));

app.use(express.json());

// --- Standard Proxy Function (Logging Removed) ---
const createProxy = (serviceUrl, stripPrefix) => { // Added stripPrefix parameter
  return proxy(serviceUrl, {
    proxyReqPathResolver: function (req) {
      const originalPath = url.parse(req.originalUrl).pathname;
      let targetPath = originalPath;

      // --- CORRECTED PATH LOGIC ---
      // If a specific prefix needs stripping (like '/api/auth' -> '/'), do it here
      if (stripPrefix && originalPath.startsWith(stripPrefix)) {
          targetPath = originalPath.substring(stripPrefix.length);
          // Ensure targetPath starts with '/' if it's not empty
          if (targetPath === '' || !targetPath.startsWith('/')) {
              targetPath = '/' + targetPath;
          }
      } 
      // Fallback for other routes (removes just '/api')
      else if (originalPath.startsWith('/api')) { 
          targetPath = originalPath.substring(4);
      }
      
      console.log(`[Gateway] Received ${req.method} ${req.originalUrl} -> Forwarding to ${serviceUrl}${targetPath}`); // Re-added log for clarity
      return targetPath; 
    },
    proxyErrorHandler: function(err, res, next) {
        console.error(`[Gateway] Proxy Error to ${serviceUrl}:`, err.code || err);
        if (!res.headersSent) {
            res.status(502).json({ message: 'Bad Gateway Error' }); 
        } else {
            next(err);
        }
    }
  });
};


// --- Proxy Routes (Using the corrected helper) ---
// For auth service, strip the entire '/api/auth' and '/api/workspaces' prefix
app.use('/api/auth', createProxy(process.env.AUTH_SERVICE_URL, '/api/auth')); 
app.use('/api/workspaces', createProxy(process.env.AUTH_SERVICE_URL, '/api/workspaces')); 

// For other services, strip only '/api' (or adjust as needed based on their server.js)
app.use('/api/projects', createProxy(process.env.TASK_SERVICE_URL, '/api/projects')); 
app.use('/api/tasks', createProxy(process.env.TASK_SERVICE_URL, '/api/tasks')); 
app.use('/api/comments', createProxy(process.env.TASK_SERVICE_URL, '/api/comments')); 
app.use('/api/analytics', createProxy(process.env.ANALYTICS_SERVICE_URL, '/api/analytics')); 
app.use('/api/notify', createProxy(process.env.NOTIFICATION_SERVICE_URL, '/api/notify')); 
app.use('/api/files', createProxy(process.env.FILE_SERVICE_URL, '/api/files')); 


// Health check for the gateway itself
app.get('/', (req, res) => {
    res.status(200).json({ message: 'API Gateway is healthy and running.' });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`🚀 API Gateway is live and listening on port ${PORT}`);
});
