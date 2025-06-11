import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const userId = req.headers['user-id'];
    if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const client = await clientPromise;
    const db = client.db();
    const cartsCollection = db.collection('carts');

    try {
        const { items: guestItems } = req.body;
        if (!Array.isArray(guestItems) || guestItems.length === 0) {
            return res.status(200).json({ message: 'No items to merge.' });
        }

        let userCart = await cartsCollection.findOne({ userId });

        if (!userCart) {
            userCart = {
                userId,
                items: guestItems.map(item => ({
                    ...item,
                    productId: new ObjectId(item.productId)
                }))
            };
            await cartsCollection.insertOne(userCart);
        } else {
            guestItems.forEach(guestItem => {
                const existingItemIndex = userCart.items.findIndex(
                    item => item.productId.toString() === guestItem.productId
                );
                
                if (existingItemIndex > -1) {
                    // Item exists, add quantities
                    userCart.items[existingItemIndex].quantity += guestItem.quantity;
                } else {
                    // Item doesn't exist, add it
                    userCart.items.push({
                        ...guestItem,
                        productId: new ObjectId(guestItem.productId)
                    });
                }
            });

            await cartsCollection.updateOne(
                { userId },
                { $set: { items: userCart.items } }
            );
        }
        
        res.status(200).json({ message: 'Cart merged successfully' });

    } catch (err) {
        console.error('Error merging cart:', err);
        res.status(500).json({ error: 'Failed to merge cart' });
    }
} 