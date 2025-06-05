import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'PATCH') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        const showcaseCollection = db.collection('showcase');

        if (req.method === 'GET') {
            const showcase = await showcaseCollection.findOne({ _id: 'video' });
            return res.status(200).json({ 
                visible: showcase?.visible ?? true,
                videoPath: showcase?.videoPath ?? '/videos/showcase.mp4' // Default video path
            });
        }

        if (req.method === 'PATCH') {
            const { visible } = req.body;
            if (typeof visible !== 'boolean') {
                return res.status(400).json({ error: 'Visible must be a boolean' });
            }

            const showcase = await showcaseCollection.findOne({ _id: 'video' });
            await showcaseCollection.updateOne(
                { _id: 'video' },
                { 
                    $set: { 
                        visible,
                        videoPath: showcase?.videoPath ?? '/videos/showcase.mp4',
                        updatedAt: new Date() 
                    }
                },
                { upsert: true }
            );

            return res.status(200).json({ 
                message: 'Showcase video visibility updated',
                visible,
                videoPath: showcase?.videoPath ?? '/videos/showcase.mp4'
            });
        }
    } catch (error) {
        console.error('Showcase API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 