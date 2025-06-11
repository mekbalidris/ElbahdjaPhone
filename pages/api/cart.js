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
      // When fetching the cart, populate product details for each item
      if (cart && cart.items && cart.items.length > 0) {
          const productIds = cart.items.map(item => item.productId);
          const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

          // Map cart items to include full product details
          cart.items = cart.items.map(item => {
              const product = products.find(p => p._id.toString() === item.productId.toString());
              if (!product) return null; // Or handle as an error if a product in cart is not found
              return {
                  ...item, // Keep existing item data like quantity (though quantity will be 1 now)
                  name: product.name,
                  price: product.price,
                  imageUrl: product.images?.[0] || product.imageUrl,
                  // Add other product details if needed in cart display (e.g., attributes)
              };
          }).filter(item => item !== null); // Filter out any items where the product wasn't found
      }
      res.status(200).json(cart || { userId, items: [] });
    } catch (err) {
      console.error('Error fetching cart:', err);
      res.status(500).json({ error: 'Failed to fetch cart' });
    }
  } else if (req.method === 'POST') {
    try {
      const { productId } = req.body; // Expecting only productId
      
      // Get the product details to add to the cart item
      const product = await productsCollection.findOne({ _id: new ObjectId(productId) });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if cart exists
      let cart = await collection.findOne({ userId });
      
      const newItem = {
           productId: new ObjectId(productId),
           // Store necessary product details directly in the cart item
           name: product.name,
           price: product.price,
           imageUrl: product.images?.[0] || product.imageUrl,
           attributes: product.attributes || null, // Include attributes if they exist
           quantity: 1, // Default quantity for new items
      };

      if (!cart) {
        // Create new cart with the item
        cart = {
          userId,
          items: [newItem]
        };
        await collection.insertOne(cart);
      } else {
        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(item => 
          item.productId.toString() === productId
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

      // Fetch and return the updated cart with populated product details
      const updatedCart = await collection.findOne({ userId });
       if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
          const productIds = updatedCart.items.map(item => item.productId);
          const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

          updatedCart.items = updatedCart.items.map(item => {
              const product = products.find(p => p._id.toString() === item.productId.toString());
              if (!product) return null;
              return {
                  ...item,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.images?.[0] || product.imageUrl,
              };
          }).filter(item => item !== null);
      }

      res.status(200).json(updatedCart);

    } catch (err) {
      console.error('Error adding to cart:', err);
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { productId } = req.body; // Expecting productId in the body for DELETE
      
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

      const itemIndexToRemove = cart.items.findIndex(item => 
           item.productId.toString() === productId
      );

      if (itemIndexToRemove === -1) {
        return res.status(404).json({ error: 'Item not found in cart' });
      }

      // Remove only one instance of the item
      cart.items.splice(itemIndexToRemove, 1);

      await collection.updateOne(
        { userId },
        { $set: { items: cart.items } }
      );

      // Fetch and return the updated cart with populated product details
      const updatedCart = await collection.findOne({ userId });
       if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
          const productIds = updatedCart.items.map(item => item.productId);
          const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

          updatedCart.items = updatedCart.items.map(item => {
              const product = products.find(p => p._id.toString() === item.productId.toString());
              if (!product) return null;
              return {
                  ...item,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.images?.[0] || product.imageUrl,
              };
          }).filter(item => item !== null);
      }

      res.status(200).json(updatedCart);

    } catch (err) {
      console.error('Error removing item from cart:', err);
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  } else if (req.method === 'PATCH') {
    try {
      const { productId, quantity } = req.body;
      
      if (!productId || typeof quantity !== 'number' || quantity < 1) {
        return res.status(400).json({ error: 'Invalid request parameters' });
      }

      const cart = await collection.findOne({ userId });
      if (!cart) {
        return res.status(404).json({ error: 'Cart not found' });
      }

      const itemIndex = cart.items.findIndex(item => 
        item.productId.toString() === productId.toString()
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

      // Fetch and return the updated cart with populated product details
      const updatedCart = await collection.findOne({ userId });
      if (updatedCart && updatedCart.items && updatedCart.items.length > 0) {
        const productIds = updatedCart.items.map(item => item.productId);
        const products = await productsCollection.find({ _id: { $in: productIds } }).toArray();

        updatedCart.items = updatedCart.items.map(item => {
          const product = products.find(p => p._id.toString() === item.productId.toString());
          if (!product) return null;
          return {
            ...item,
            name: product.name,
            price: product.price,
            imageUrl: product.images?.[0] || product.imageUrl,
          };
        }).filter(item => item !== null);
      }

      res.status(200).json(updatedCart);
    } catch (err) {
      console.error('Error updating cart quantity:', err);
      res.status(500).json({ error: 'Failed to update item quantity' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 