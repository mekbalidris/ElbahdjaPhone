import { connectToDatabase } from '../../../lib/mongodb';

export default async function handler(req, res) {
    const { method, query: { userId } } = req;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const { db } = await connectToDatabase();

        switch (method) {
            case 'GET':
                const messages = await db.collection('support_messages')
                    .find({ userId })
                    .sort({ createdAt: -1 })
                    .toArray();
                return res.status(200).json(messages);

            case 'POST':
                const { subject, message, userName, userEmail } = req.body;
                
                if (!subject || !message) {
                    return res.status(400).json({ error: 'Subject and message are required' });
                }

                const newMessage = {
                    userId,
                    userName,
                    userEmail,
                    subject,
                    message,
                    status: 'new',
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                const result = await db.collection('support_messages').insertOne(newMessage);

                if (result.acknowledged) {
                    return res.status(201).json({
                        ...newMessage,
                        _id: result.insertedId
                    });
                } else {
                    return res.status(500).json({ error: 'Failed to create message' });
                }

            default:
                res.setHeader('Allow', ['GET', 'POST']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('Support Messages API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 