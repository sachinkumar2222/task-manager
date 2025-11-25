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

    // Step 3: Get Workspace Context from Custom Headers (sent by apiClient)
    // Headers are typically converted to lowercase by Express/Node
    const workspaceId = req.headers['x-workspace-id']; 
    const workspaceRole = req.headers['x-workspace-role']; // Read the role sent by frontend

    // Step 4: Validate Workspace Context
    // For task-service operations, knowing the workspace is critical
    if (!workspaceId) {
        console.warn(`[checkAuth - Task Service] Missing X-Workspace-ID header for ${req.method} ${req.originalUrl}`);
        return res.status(400).json({ message: 'Bad Request: Workspace ID is missing. Please select a workspace.' });
    }

    // Step 5: Attach decoded user data AND workspace context to the request object
    req.userData = { 
        userId: decodedToken.userId, 
        email: decodedToken.email,
        fullName: decodedToken.fullName, 
        workspaceId: workspaceId,
        // Use the role from the header, default to 'TEAM_MEMBER' if missing (Security First)
        role: workspaceRole || 'TEAM_MEMBER' 
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