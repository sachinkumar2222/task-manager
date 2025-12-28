require('dotenv').config();
console.log("NOTIFICATION_SERVICE_URL:", process.env.NOTIFICATION_SERVICE_URL || "MISSING");
console.log("INTERNAL_API_KEY:", process.env.INTERNAL_API_KEY || "MISSING");
