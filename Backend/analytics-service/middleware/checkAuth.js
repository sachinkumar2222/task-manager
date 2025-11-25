// e.g., task-service/middleware/checkAuth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Step 1: Get the JWT token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: No token provided or invalid format.' });
    }
    const token = authHeader.split(' ')[1];

    // Step 2: Verify the JWT token to get user details
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Step 3: Get the Workspace ID from the custom header (sent by apiClient)
    // Headers are typically converted to lowercase by Express/Node
    const workspaceId = req.headers['x-workspace-id']; 

    // Step 4: Check if the workspace ID is present (Crucial for most task-service routes)
    if (!workspaceId) {
        // We need a workspace context for almost all actions in task-service
        console.warn(`[checkAuth - Task Service] Missing X-Workspace-ID header for ${req.method} ${req.originalUrl}`);
        return res.status(400).json({ message: 'Bad Request: Workspace ID is missing in the request header.' });
    }

    // Step 5: Attach decoded user data AND workspace ID to the request object
    req.userData = { 
        userId: decodedToken.userId, 
        email: decodedToken.email,
        fullName: decodedToken.fullName, // Make sure fullName is included from the token
        workspaceId: workspaceId // Use the ID from the header
        // Role from JWT might represent global role, not workspace-specific role
    };
    
    // Step 6: Proceed to the next middleware or controller
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
         return res.status(401).json({ message: `Authentication failed: ${error.message}` });
    }
    // Handle other errors
    console.error("[checkAuth - Task Service] Error verifying token or processing headers:", error);
    return res.status(401).json({ message: 'Authentication failed: Could not verify token or process request.' });
  }
};