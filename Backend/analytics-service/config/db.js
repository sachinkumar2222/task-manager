const mongoose = require('mongoose');

/**
 * Establishes a connection to the MongoDB database.
 * This function will be called once when the server starts.
 */
const connectDB = async () => {
  try {
    // Attempt to connect to the database using the connection string
    // from the environment variables.
    await mongoose.connect(process.env.MONGO_URI);

    // If the connection is successful, log a confirmation message.
    console.log('MongoDB Connection Successful');
  } catch (error) {
    // If an error occurs during connection, log the error message
    // and terminate the application process. This is important because
    // the service cannot function without a database connection.
    console.error('MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

// Export the function to be used in server.js
module.exports = connectDB;

