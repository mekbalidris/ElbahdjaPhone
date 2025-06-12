import { connectToDatabase } from '../../../lib/mongodb';
import Cart from '../../../models/Cart';
import Product from '../../../models/Product';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }

    const { guestId } = req.body;
    const userId = req.headers['user-id'];

    if (!guestId || !userId) {
        return res.status(400).json({ error: 'Missing guest ID or user ID' });
    }

    await connectToDatabase();

    try {
        // Get guest cart
        const guestCart = await Cart.findOne({ owner: guestId });
        if (!guestCart) {
            return res.status(200).json({ items: [] });
        }

        // Get or create user cart
        let userCart = await Cart.findOne({ owner: userId });
        if (!userCart) {
            userCart = new Cart({ owner: userId, items: [] });
        }

        // Merge items from guest cart to user cart
        for (const guestItem of guestCart.items) {
            const existingItem = userCart.items.find(
                item => item.productId.toString() === guestItem.productId.toString()
            );

            if (existingItem) {
                // Check if product is still in stock
                const product = await Product.findById(guestItem.productId);
                if (!product || product.stock < existingItem.quantity + guestItem.quantity) {
                    continue; // Skip if not enough stock
                }
                existingItem.quantity += guestItem.quantity;
            } else {
                userCart.items.push({
                    productId: guestItem.productId,
                    quantity: guestItem.quantity
                });
            }
        }

        // Save user cart
        await userCart.save();
        await userCart.populate('items.productId');

        // Delete guest cart
        await Cart.findOneAndDelete({ owner: guestId });

        return res.status(200).json({ items: userCart.items });
    } catch (error) {
        console.error('Cart transfer error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 