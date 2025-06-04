import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const ordersCollection = db.collection('orders');
  const cartsCollection = db.collection('carts');

  // Get user ID from the request
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      // Get orders for the specific user
      const orders = await ordersCollection.find({ userId }).sort({ createdAt: -1 }).toArray();
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        items,
        contactInfo,
        deliveryAddress,
        orderNotes,
        paymentMethod,
        totals
      } = req.body;

      // Validate required fields
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Order must contain at least one item' });
      }

      if (!contactInfo || !deliveryAddress) {
        return res.status(400).json({ error: 'Contact info and delivery address are required' });
      }

      // Create the order document
      const order = {
        userId,
        items: items.map(item => ({
          productId: new ObjectId(item.productId),
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          imageUrl: item.imageUrl,
          attributes: item.attributes || null
        })),
        contactInfo,
        deliveryAddress,
        orderNotes: orderNotes || '',
        paymentMethod: paymentMethod || 'cash_on_delivery',
        totals,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Insert the order
      const result = await ordersCollection.insertOne(order);

      // Clear the user's cart after successful order
      await cartsCollection.updateOne(
        { userId },
        { $set: { items: [] } }
      );

      // Return the created order
      const createdOrder = await ordersCollection.findOne({ _id: result.insertedId });
      res.status(201).json(createdOrder);
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 