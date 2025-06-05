import { connectToDatabase } from '../../../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        
        // Get all messages sorted by creation date (newest first)
        const messages = await db.collection('support_messages')
            .find({})
            .sort({ createdAt: -1 })
            .toArray();

        return res.status(200).json(messages);
    } catch (error) {
        console.error('Error fetching support messages:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 