/**
 * Middleware to validate a secret internal API key.
 * Yeh function har us internal route par lagaya jaayega jise sirf hamare
 * dusre microservices hi call kar sakte hain.
 */
module.exports = (req, res, next) => {
  try {
    // Step 1: Request ke header se internal API key nikalo.
    // Hum ek custom header 'x-internal-api-key' ka istemaal karenge.
    const internalApiKey = req.headers['x-internal-api-key'];

    // Step 2: Check karo ki header hai ya nahi.
    if (!internalApiKey) {
      // 403 Forbidden: Aapke paas is resource ko access karne ka adhikar nahi hai.
      return res.status(403).json({ message: 'Forbidden: No internal API key provided.' });
    }

    // Step 3: Header se aayi key ko hamare .env file mein save ki hui key se compare karo.
    if (internalApiKey !== process.env.INTERNAL_API_KEY) {
      return res.status(403).json({ message: 'Forbidden: Invalid internal API key.' });
    }

    // Step 4: Agar key match ho jaati hai, to request ko aage controller ke paas bhej do.
    next();
  } catch (error) {
    // Agar koi unexpected error aata hai, to server error response bhejo.
    console.error('Internal API Key Check Error:', error);
    res.status(500).json({ message: 'Internal server error.' });
  }
};
