import { connectToDatabase } from '../../../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const { messageId } = req.query;

    if (!messageId) {
        return res.status(400).json({ error: 'Message ID is required' });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { db } = await connectToDatabase();
        const { reply, adminId, adminName } = req.body;

        if (!reply || !adminId || !adminName) {
            return res.status(400).json({ error: 'Reply, adminId, and adminName are required' });
        }

        const result = await db.collection('support_messages').updateOne(
            { _id: new ObjectId(messageId) },
            { 
                $set: { 
                    reply,
                    adminId,
                    adminName,
                    status: 'replied',
                    repliedAt: new Date(),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }

        const updatedMessage = await db.collection('support_messages').findOne(
            { _id: new ObjectId(messageId) }
        );

        return res.status(200).json(updatedMessage);
    } catch (error) {
        console.error('Error sending reply:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
} 