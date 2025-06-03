import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('carts');

  // Get user ID from the request
  const userId = req.headers['user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const cart = await collection.findOne({ userId });
      res.status(200).json(cart || { userId, items: [] });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId, quantity } = req.body;
      
      // Get the product details
      const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if cart exists
      let cart = await collection.findOne({ userId });
      
      if (!cart) {
        // Create new cart
        cart = {
          userId,
          items: [{
            productId: new ObjectId(productId),
            quantity,
            name: product.name,
            price: product.price,
            imageUrl: product.images?.[0] || product.imageUrl
          }]
        };
        await collection.insertOne(cart);
      } else {
        // Update existing cart
        const existingItemIndex = cart.items.findIndex(item => 
          item.productId.toString() === productId
        );

        if (existingItemIndex > -1) {
          // Update quantity of existing item
          cart.items[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          cart.items.push({
            productId: new ObjectId(productId),
            quantity,
            name: product.name,
            price: product.price,
            imageUrl: product.images?.[0] || product.imageUrl
          });
        }

        await collection.updateOne(
          { userId },
          { $set: { items: cart.items } }
        );
      }

      res.status(200).json(cart);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update cart' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { productId, quantity } = req.body;
      
      const cart = await collection.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(item => 
        item.productId.toString() === productId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        cart.items.splice(itemIndex, 1);
      } else {
        // Update quantity
        cart.items[itemIndex].quantity = quantity;
      }

      await collection.updateOne(
        { userId },
        { $set: { items: cart.items } }
      );

      res.status(200).json(cart);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update cart' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { productId } = req.query;
      
      const cart = await collection.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const updatedItems = cart.items.filter(item => 
        item.productId.toString() !== productId
      );

      await collection.updateOne(
        { userId },
        { $set: { items: updatedItems } }
      );

      res.status(200).json({ ...cart, items: updatedItems });
    } catch (err) {
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 