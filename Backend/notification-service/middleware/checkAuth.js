const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication failed: No token provided.' });
        }
        const token = authHeader.split(' ')[1];

        if (!process.env.JWT_SECRET) {
            console.error("FATAL: JWT_SECRET is not defined in environment variables.");
            return res.status(500).json({ message: "Internal Server Configuration Error" });
        }

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.userData = {
            userId: decodedToken.userId,
            email: decodedToken.email,
            fullName: decodedToken.fullName
        };

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Authentication failed: Invalid token.' });
    }
};
