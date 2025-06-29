import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('carts');
  const productsCollection = db.collection('products');

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
      console.error('Error fetching cart:', err);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  } else if (req.method === 'POST') {
    try {
      const { items } = req.body;
      
      // If items array is provided, replace the entire cart
      if (Array.isArray(items)) {
        const cart = {
          userId,
          items: items.map(item => ({
            ...item,
            _id: new ObjectId(item._id),
            productId: new ObjectId(item._id) // Keep productId for backward compatibility
          }))
        };
        
        await collection.replaceOne(
          { userId },
          cart,
          { upsert: true }
        );
        
        return res.status(200).json(cart);
      }
      
      // Legacy support for single product addition
      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID is required' });
      }
      
      // Get the product details to add to the cart item
      const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if cart exists
      let cart = await collection.findOne({ userId });
      
      const newItem = {
        _id: new ObjectId(productId),
        productId: new ObjectId(productId),
        name: product.name,
        price: product.price,
        images: product.images || [],
        imageUrl: product.images?.[0] || product.imageUrl,
        stock: product.stock,
        quantity: 1,
        size: null,
        color: null
      };

      if (!cart) {
        // Create new cart with the item
        cart = {
          userId,
          items: [newItem]
        };
        await collection.insertOne(cart);
      } else {
        // Check if item already exists in cart (same product, size, and color)
        const existingItemIndex = cart.items.findIndex(item => 
          item._id.toString() === productId &&
          item.size === newItem.size &&
          item.color === newItem.color
        );

        if (existingItemIndex !== -1) {
          // Item exists, increase quantity
          cart.items[existingItemIndex].quantity = (cart.items[existingItemIndex].quantity || 1) + 1;
        } else {
          // Item doesn't exist, add new item
          cart.items.push(newItem);
        }

        await collection.updateOne(
          { userId },
          { $set: { items: cart.items } }
        );
      }

      res.status(200).json(cart);

    } catch (err) {
      console.error('Error updating cart:', err);
      res.status(500).json({ error: 'Failed to update cart' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { productId, size, color } = req.body;
      
      const cart = await collection.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      // If no productId is provided, clear the entire cart
      if (!productId) {
        await collection.updateOne(
          { userId },
          { $set: { items: [] } }
        );
        return res.status(200).json({ userId, items: [] });
      }

      // Remove item with specific size and color
      const itemIndexToRemove = cart.items.findIndex(item => 
        item._id.toString() === productId &&
        item.size === size &&
        item.color === color
      );

      if (itemIndexToRemove === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Remove the item
      cart.items.splice(itemIndexToRemove, 1);

      await collection.updateOne(
        { userId },
        { $set: { items: cart.items } }
      );

      res.status(200).json(cart);

    } catch (err) {
      console.error('Error removing item from cart:', err);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { productId, quantity, size, color } = req.body;
      
      if (!productId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const cart = await collection.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(item => 
        item._id.toString() === productId &&
        item.size === size &&
        item.color === color
      );

      if (itemIndex === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Update the quantity
      cart.items[itemIndex].quantity = quantity;

      await collection.updateOne(
        { userId },
        { $set: { items: cart.items } }
      );

      res.status(200).json(cart);

    } catch (err) {
      console.error('Error updating quantity:', err);
      res.status(500).json({ error: 'Failed to update quantity' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
} 