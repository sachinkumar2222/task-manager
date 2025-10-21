const AWS = require('aws-sdk');
const crypto = require('crypto');
const { promisify } = require('util');

// Configure the AWS SDK with credentials from .env file
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_S3_REGION,
    signatureVersion: 'v4', // Important for presigned URLs
});

const s3 = new AWS.S3();
const randomBytes = promisify(crypto.randomBytes);

const S3Service = {
  /**
   * Generates a secure, pre-signed URL for uploading a file to S3.
   * @param {string} fileType - The MIME type of the file (e.g., 'image/jpeg').
   * @returns {Promise<{uploadUrl: string, fileKey: string}>}
   */
  async getPresignedUploadUrl(fileType) {
    try {
      // Generate a unique random name for the file to avoid conflicts
      const rawBytes = await randomBytes(16);
      const fileKey = `uploads/${rawBytes.toString('hex')}`;

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: fileKey,
        Expires: 60 * 5, // URL will be valid for 5 minutes
        ContentType: fileType,
      };

      // Generate the pre-signed URL
      const uploadUrl = await s3.getSignedUrlPromise('putObject', params);

      return { uploadUrl, fileKey };
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      throw error;
    }
  },
};

module.exports = S3Service;
