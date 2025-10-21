const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: No token provided or invalid format.' });
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    req.userData = { 
        userId: decodedToken.userId, 
        workspaceId: decodedToken.workspaceId,
        role: decodedToken.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
  }
};
