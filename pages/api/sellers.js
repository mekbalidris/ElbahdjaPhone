import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('sellers');

  if (req.method === 'GET') {
    const sellers = await collection.find({}).toArray();
    res.status(200).json(sellers);
  } else if (req.method === 'POST') {
    const seller = req.body;
    const result = await collection.insertOne(seller);
    res.status(201).json(result.ops ? result.ops[0] : seller);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 