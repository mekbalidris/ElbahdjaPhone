import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    const { method, query: { userId } } = req;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const { db } = await connectToDatabase();

        switch (method) {
            case 'GET':
                const profile = await db.collection('profiles').findOne({ userId });
                if (!profile) {
                    return res.status(404).json({ error: 'Profile not found' });
                }
                return res.status(200).json(profile);

            case 'PUT':
                const { name, phone, addressStreet, addressCity, addressPostalCode, addressCountry } = req.body;
                
                // Update or insert the profile
                const result = await db.collection('profiles').updateOne(
                    { userId },
                    {
                        $set: {
                            userId,
                            name,
                            phone,
                            addressStreet,
                            addressCity,
                            addressPostalCode,
                            addressCountry,
                            updatedAt: new Date()
                        }
                    },
                    { upsert: true }
                );

                if (result.acknowledged) {
                    return res.status(200).json({ message: 'Profile updated successfully' });
                } else {
                    return res.status(500).json({ error: 'Failed to update profile' });
                }

            default:
                res.setHeader('Allow', ['GET', 'PUT']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('Profile API Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 