import clientPromise, { connectToDatabase } from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

// Increase body size limit to 10MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  // const client = await clientPromise; // Not needed if using connectToDatabase
  // const db = client.db(); // Use connectToDatabase instead
  
  try {
    const { db } = await connectToDatabase();
    const collection = db.collection('products');

    if (req.method === 'GET') {
      if (req.query.id) {
        try {
          const product = await collection.findOne({ _id: new ObjectId(req.query.id) });
          if (!product) {
            return res.status(404).json({ error: 'Product not found' });
          }
          res.status(200).json(product);
        } catch (err) {
          if (err.message.includes('ObjectId')) {
             return res.status(400).json({ error: 'Invalid product ID format' });
          }
          console.error('Error fetching single product:', err);
          return res.status(500).json({ error: 'Failed to fetch product' });
        }
      } else if (req.query._id) {
        try {
          const product = await collection.findOne({ _id: new ObjectId(req.query._id) });
          if (!product) {
            res.status(404).json({ error: 'Product not found' });
          } else {
            res.status(200).json(product);
          }
        } catch (err) {
           if (err.message.includes('ObjectId')) {
             return res.status(400).json({ error: 'Invalid product ID format' });
          }
           console.error('Error fetching single product (by _id):', err);
           return res.status(500).json({ error: 'Failed to fetch product' });
        }
      } else {
        // Fetch all products for the homepage/products page
        const products = await collection.find({}).toArray();
        res.status(200).json(products);
      }
    } else if (req.method === 'POST') {
      const product = {
        ...req.body,
        _id: new ObjectId(),
        createdAt: new Date().toISOString()
      };
      const result = await collection.insertOne(product);
      // Fetch the inserted document to return it with the correct _id type
      const insertedProduct = await collection.findOne({ _id: result.insertedId });
      res.status(201).json(insertedProduct);
    } else if (req.method === 'PATCH') {
      console.log('PATCH request received for /api/products');
      console.log('Request body:', req.body);

      // Ensure body exists and is an object
      if (!req.body || typeof req.body !== 'object') {
          console.error('Invalid or missing request body for PATCH');
          return res.status(400).json({ error: 'Invalid request body' });
      }

      const { _id, ...updates } = req.body; // Use 'updates' to avoid conflict with 'update' keyword
      console.log('Product ID (_id):', _id);
      console.log('Update object:', updates);

      // Ensure _id is provided and is a string (expected format from frontend)
      if (!_id || typeof _id !== 'string') {
          console.error('Missing or invalid _id in request body for PATCH');
          return res.status(400).json({ error: 'Product ID (_id) is required and must be a string for PATCH' });
      }

      let objectId;
      try {
          // Validate and convert the string _id to a MongoDB ObjectId
          if (!ObjectId.isValid(_id)) {
               console.error('Invalid ObjectId format for PATCH:', _id);
               return res.status(400).json({ error: 'Invalid Product ID format.' });
          }
          objectId = new ObjectId(_id);
      } catch (err) {
          // This catch might be redundant due to isValid check but good for safety
          console.error('Error creating ObjectId from provided ID:', err);
          return res.status(400).json({ error: 'Invalid product ID format' });
      }

      try {
          const filter = { _id: objectId }; // Use the converted ObjectId for the query
          const updateDoc = { $set: updates }; // Apply the updates received

          const result = await collection.updateOne(
              filter,
              updateDoc
          );

          if (result.matchedCount === 0) {
              console.warn('PATCH failed: Product not found with ID:', _id);
              return res.status(404).json({ error: 'Product not found with provided ID' });
          }

          // Optionally fetch the updated document to return it
          const updatedProduct = await collection.findOne(filter);

          if (result.modifiedCount === 0 && result.matchedCount === 1) {
               // Product was found but no changes were made (e.g., setting featured: true when already true)
               return res.status(200).json({ message: 'Product status unchanged (already up-to-date).', product: updatedProduct });
          }

          return res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });

      } catch (err) {
          console.error('Error updating product in database:', err);
          // Return a 500 error for database-related issues
          return res.status(500).json({ error: 'Internal server error while updating product.' });
      }
    } else if (req.method === 'DELETE') {
      if (!req.query._id) {
         return res.status(400).json({ error: 'Product ID (_id) is required for DELETE query parameter' });
      }
      try {
        const result = await collection.findOneAndDelete({ _id: new ObjectId(req.query._id) });
        if (!result.value) {
          res.status(404).json({ error: 'Product not found' });
        } else {
          res.status(200).json({ message: 'Product deleted successfully' });
        }
      } catch (err) {
        if (err.message.includes('ObjectId')) {
           return res.status(400).json({ error: 'Invalid product ID format' });
        }
        console.error('Delete error:', err);
        res.status(500).json({ error: 'Failed to delete product' });
      }
    } else {
      // Method Not Allowed for other HTTP methods
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (mainError) {
      // Catch any unexpected errors during database connection or initial setup
      console.error('API Handler Error:', mainError);
      res.status(500).json({ error: mainError.message || 'An unexpected server error occurred' });
  }
} 