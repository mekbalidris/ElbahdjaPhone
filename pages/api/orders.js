import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendOrderConfirmationEmail } from '../../lib/email';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const ordersCollection = db.collection('orders');
  const productsCollection = db.collection('products');

  // Get user ID from the request
  const userId = req.headers['user-id'];

  if (req.method === 'GET') {
    try {
      // If no userId provided, return empty array
      if (!userId) {
        return res.status(200).json([]);
      }

      // Find orders for the specific user
      const orders = await ordersCollection.find({ userId: userId }).toArray();
      res.status(200).json(orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  } else if (req.method === 'POST') {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.items || !orderData.contactInfo || !orderData.deliveryAddress) {
        return res.status(400).json({ error: 'Missing required order information' });
      }

      // Ensure userId is present in both headers and body
      if (!userId || !orderData.userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Verify that the userId in headers matches the one in the body
      if (userId !== orderData.userId) {
        return res.status(400).json({ error: 'User ID mismatch' });
      }

      // Add timestamp and status
      const order = {
        ...orderData,
        createdAt: new Date(),
        status: 'pending',
        _id: new ObjectId()
      };

      // Insert the order
      await ordersCollection.insertOne(order);

      // Send email notification to admin
      let emailResult = null;
      try {
        emailResult = await sendOrderConfirmationEmail(order);
        if (!emailResult.success) {
          console.error('Email sending failed:', emailResult);
        }
      } catch (emailError) {
        console.error('Failed to send order confirmation email:', emailError);
        emailResult = {
          success: false,
          error: emailError.message,
          timestamp: new Date().toISOString()
        };
      }

      // Return order data along with email sending status
      res.status(201).json({
        ...order,
        emailNotification: emailResult
      });
    } catch (err) {
      console.error('Error creating order:', err);
      res.status(500).json({ error: 'Failed to create order' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
} 