import clientPromise from '../../lib/mongodb';
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
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('products');

  if (req.method === 'GET') {
    if (req.query.id) {
      try {
        const product = await collection.findOne({ _id: new ObjectId(req.query.id) });
        res.status(200).json(product);
      } catch (err) {
        res.status(400).json({ error: 'Invalid product ID' });
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
        res.status(400).json({ error: 'Invalid product ID' });
      }
    } else {
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
    const insertedProduct = await collection.findOne({ _id: result.insertedId });
    res.status(201).json(insertedProduct);
  } else if (req.method === 'PATCH') {
    const { _id, ...update } = req.body;
    try {
      const result = await collection.findOneAndUpdate(
        { _id: new ObjectId(_id) },
        { $set: update },
        { returnDocument: 'after' }
      );
      res.status(200).json(result.value);
    } catch (err) {
      res.status(400).json({ error: 'Invalid product ID' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const result = await collection.findOneAndDelete({ _id: new ObjectId(req.query._id) });
      if (!result.value) {
        res.status(404).json({ error: 'Product not found' });
      } else {
        res.status(200).json({ message: 'Product deleted successfully' });
      }
    } catch (err) {
      console.error('Delete error:', err);
      res.status(400).json({ error: 'Invalid product ID' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 