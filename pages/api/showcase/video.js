import { connectToDatabase } from '../../../lib/mongodb';
// No need for formidable or fs here as we are serving, not parsing/uploading

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        const showcaseCollection = db.collection('showcase');

        // Fetch the specific showcase video document
        const showcase = await showcaseCollection.findOne({ _id: 'mainShowcaseVideo' });

        if (!showcase || !showcase.videoData || !showcase.videoType) {
            // If you want to serve a default/placeholder video, you could do it here
            // For now, just 404
            return res.status(404).json({ error: 'Showcase video not found or data is incomplete.' });
        }

        // The videoData should be a BSON Binary type. Access its buffer.
        const videoBuffer = showcase.videoData.buffer; 

        // Set appropriate headers for video streaming
        res.setHeader('Content-Type', showcase.videoType);
        res.setHeader('Content-Length', videoBuffer.length);
        // Cache control can be important for videos
        // Cache for a shorter period if videos change often, or use ETag for validation
        res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
        // res.setHeader('Accept-Ranges', 'bytes'); // Optional: if you want to support range requests for seeking

        // Send the video data buffer
        res.send(videoBuffer);

    } catch (error) {
        console.error('Error serving video:', error);
        return res.status(500).json({ error: 'Failed to serve video. Please try again later.' });
    }
}
