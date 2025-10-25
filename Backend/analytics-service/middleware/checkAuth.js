const jwt = require('jsonwebtoken');

/**
 * Middleware function to validate JWT tokens.
 * This middleware is applied to all routes that require the user to be logged in.
 */
module.exports = (req, res, next) => {
  try {
    // Step 1: Extract the Authorization token from the request headers.
    // The header format should be: "Bearer [token]"
    const authHeader = req.headers.authorization;

    // Step 2: Validate that the header exists and is in the correct format.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: Token missing or invalid format.' });
    }

    // Step 3: Extract only the token string.
    const token = authHeader.split(' ')[1];

    // Step 4: Verify the token using our secret key.
    // jwt.verify() decodes and checks if the token is expired or tampered with.
    // If verification fails, it will throw an error that will be caught in the catch block.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: If verification is successful, attach the decoded user data to the request object.
    // This allows controllers to access user details (like userId and email).
    req.userData = { 
      userId: decodedToken.userId, 
      email: decodedToken.email,
      // Optionally attach role and workspaceId if they exist in the token.
      ...(decodedToken.role && { role: decodedToken.role }),
      ...(decodedToken.workspaceId && { workspaceId: decodedToken.workspaceId }),
    };

    // Step 6: Pass control to the next middleware or controller.
    next();
  } catch (error) {
    // If jwt.verify() fails or any other error occurs, send an unauthorized response.
    return res.status(401).json({ message: 'Authentication failed: Invalid or missing token.' });
  }
};
