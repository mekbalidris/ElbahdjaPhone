import clientPromise from '../../lib/mongodb';
// import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('users');

    if (req.method === 'GET') {
      const { email, password } = req.query;
      console.log('Login attempt for email:', email);
      if (email && password) {
        // Find user by email and password (plain text, for testing only)
        const user = await collection.findOne({ email, password });
        console.log('Login result:', user ? 'User found' : 'User not found');
        if (!user) {
          return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Don't send password back to client
        const { password: _, ...userWithoutPassword } = user;
        // Ensure we're sending the _id as id
        const userWithId = {
          ...userWithoutPassword,
          id: user._id.toString()
        };
        return res.status(200).json(userWithId);
      }
      // If no email/password provided, return all users (without passwords)
      const users = await collection.find({}, { projection: { password: 0 } }).toArray();
      res.status(200).json(users);
    } else if (req.method === 'POST') {
      const { email, password, ...otherData } = req.body;
      console.log('Registration attempt for email:', email);
      
      // Check if user already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        console.log('Registration failed: Email already registered');
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Store password in plain text (for testing only)
      const user = {
        email,
        password,
        ...otherData,
        createdAt: new Date().toISOString()
      };

      const result = await collection.insertOne(user);
      // Fetch the inserted user by _id
      const insertedUser = await collection.findOne({ _id: result.insertedId });
      // Don't send password back to client
      const { password: _, ...userWithoutPassword } = insertedUser;
      // Ensure we're sending the _id as id
      const userWithId = {
        ...userWithoutPassword,
        id: insertedUser._id.toString()
      };
      console.log('User registered successfully:', userWithId);
      res.status(201).json(userWithId);
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error in /api/users:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
} 