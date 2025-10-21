module.exports = (req, res, next) => {
  try {
    const internalApiKey = req.headers['x-internal-api-key'];
    if (!internalApiKey) {
      return res.status(403).json({ message: 'Forbidden: No internal API key provided.' });
    }
    if (internalApiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ message: 'Forbidden: Invalid internal API key.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Internal server error.' });
  }
};
