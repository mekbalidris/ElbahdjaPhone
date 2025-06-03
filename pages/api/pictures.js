import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('pictures');

  if (req.method === 'GET') {
    const pictures = await collection.find({}).toArray();
    res.status(200).json(pictures);
  } else if (req.method === 'POST') {
    const picture = req.body;
    const result = await collection.insertOne(picture);
    res.status(201).json(result.ops ? result.ops[0] : picture);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 