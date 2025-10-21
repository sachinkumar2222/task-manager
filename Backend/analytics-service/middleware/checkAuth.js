const jwt = require('jsonwebtoken');

/**
 * Middleware function to validate JWT tokens.
 * Yeh function har us route par lagaya jaayega jiske liye user ka login hona zaroori hai.
 */
module.exports = (req, res, next) => {
  try {
    // Step 1: Request ke header se Authorization token nikalo.
    // Header is format mein hona chahiye: "Bearer [token]"
    const authHeader = req.headers.authorization;

    // Step 2: Check karo ki header hai ya nahi aur sahi format mein hai ya nahi.
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed: Token nahi mila ya format galat hai.' });
    }

    // Step 3: Header se sirf token string ko alag karo.
    const token = authHeader.split(' ')[1];

    // Step 4: Token ko hamare secret key se verify karo.
    // jwt.verify() token ko decode karta hai aur check karta hai ki woh expired ya farzi to nahi hai.
    // Agar verification fail hota hai, to yeh ek error dega jo catch block mein pakda jaayega.
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Step 5: Agar verification successful hai, to user ka data request object mein daal do.
    // Isse, aage aane waale controller is data (jaise userId, email) ko istemaal kar sakte hain.
    req.userData = { 
        userId: decodedToken.userId, 
        email: decodedToken.email,
        // Hum future use ke liye role aur workspaceId bhi attach kar sakte hain agar token mein hain.
        // Yeh line sirf tab kaam karegi jab login ke time token mein yeh data daala gaya ho.
        ...(decodedToken.role && { role: decodedToken.role }),
        ...(decodedToken.workspaceId && { workspaceId: decodedToken.workspaceId })
    };

    // Step 6: next() call karke request ko aage controller ke paas bhej do.
    next();
  } catch (error) {
    // Agar jwt.verify() fail ho jaaye ya koi aur error aaye, to "unauthorized" response bhejo.
    return res.status(401).json({ message: 'Authentication failed: Token aahi nahi hai.' });
  }
};
