const S3Service = require('../services/s3Service');
const File = require('../models/fileModel'); // Naye model ko import karein
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * File upload karne ke liye ek secure, pre-signed URL generate karta hai.
 */
exports.generateUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType, taskId } = req.body;
        const { userId, workspaceId } = req.userData;

        if (!fileName || !fileType || !taskId) {
            return res.status(400).json({ message: 'fileName, fileType, and taskId are required.' });
        }

        // Step 1: S3 service se ek secure upload URL prapt karein
        const { uploadUrl, fileKey } = await S3Service.getPresignedUploadUrl(fileType);

        // Step 2: File ka metadata (jaankari) database mein save karein
        await prisma.file.create({
            data: {
                fileKey,
                fileName,
                fileType,
                taskId,
                workspaceId,
                uploaderId: userId,
            }
        });

        // Step 3: Upload URL aur file key frontend ko wapas bhejein
        res.status(200).json({ uploadUrl, fileKey });

    } catch (error) {
        console.error("Generate Upload URL Error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

/**
 * Ek specific task se judi saari files ki list fetch karta hai.
 */
exports.getFilesForTask = async (req, res) => {
    try {
        // URL se taskId nikalein (e.g., /api/files/task/123-abc)
        const { taskId } = req.params;
        
        // File model ka istemaal karke database se files ki list prapt karein
        const files = await File.findByTaskId(taskId);

        // Files ki list frontend ko bhejein
        res.status(200).json(files);
    } catch (error) {
        console.error("Get Files For Task Error:", error);
        res.status(500).json({ message: 'Internal server error.' });
    }
};

