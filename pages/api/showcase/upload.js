import { connectToDatabase } from '../../../lib/mongodb';
import formidable from 'formidable';
import fs from 'fs'; // Import the 'fs' module to read the file
import { Binary } from 'mongodb'; // Import Binary for BSON type

export const config = {
    api: {
        bodyParser: false, // Important: formidable handles parsing
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        const showcaseCollection = db.collection('showcase');

        // Using a Promise to handle formidable's callback pattern with async/await
        const data = await new Promise((resolve, reject) => {
            const form = formidable({
                maxFileSize: 50 * 1024 * 1024, // 50MB limit
                keepExtensions: true, // Good to keep for reference, though mimetype is primary
            });

            form.parse(req, (err, fields, files) => {
                if (err) {
                    console.error('Formidable parsing error:', err);
                    // Handle specific formidable errors if needed
                    if (err.code === 1009) { // Max file size exceeded
                         return reject(new Error('Video file size exceeds 50MB limit.'));
                    }
                    return reject(err);
                }
                // formidable v3 stores files in an object where keys are field names,
                // and values are arrays of file objects.
                if (!files.video || files.video.length === 0) {
                    return reject(new Error('No video file uploaded. Make sure the input field name is "video".'));
                }
                resolve({ fields, files });
            });
        });

        const videoFileArray = data.files.video;
        const videoFile = videoFileArray[0]; // Get the first file if multiple were somehow sent

        if (!videoFile) { // Should be caught by the check above, but for safety
            return res.status(400).json({ error: 'No video file uploaded.' });
        }

        // Read the file into a buffer from its temporary path
        const fileBuffer = fs.readFileSync(videoFile.filepath);

        // Clean up the temporary file
        fs.unlinkSync(videoFile.filepath);
        
        // Create a BSON Binary object for MongoDB
        const videoBinary = new Binary(fileBuffer);

        // Update the database with the video data
        // Using a specific document, e.g., identified by { type: 'showcaseVideo' } or a fixed _id
        const result = await showcaseCollection.updateOne(
            { _id: 'video' }, // Using a fixed _id 'video' to match the serve endpoint
            {
                $set: {
                    videoData: videoBinary,
                    videoType: videoFile.mimetype, // Get mimetype from formidable's file object
                    originalFilename: videoFile.originalFilename,
                    visible: true, // Default to visible on new upload
                    updatedAt: new Date()
                }
            },
            { upsert: true } // Create the document if it doesn't exist
        );

        if (result.acknowledged) {
            return res.status(200).json({
                message: 'Video uploaded successfully',
                // videoPath is dynamic, served from another endpoint
                // but you can return info if needed by client
                videoDetails: {
                    filename: videoFile.originalFilename,
                    type: videoFile.mimetype,
                    size: videoFile.size,
                }
            });
        } else {
            throw new Error('Database update failed after video processing.');
        }

    } catch (error) {
        console.error('Video upload error:', error);
        // Ensure a user-friendly message for specific errors
        if (error.message.includes('exceeds 50MB limit')) {
            return res.status(413).json({ error: error.message }); // Payload Too Large
        }
        return res.status(500).json({ error: error.message || 'Failed to upload video' });
    }
}
