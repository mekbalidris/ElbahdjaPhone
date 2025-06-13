import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

// --- IMPORTANT: Define your designated seller email(s) here ---
const SELLER_EMAILS = ['seller@gmail.com', 'admin@gmail.com']; // Add more if needed

export default async function handler(req, res) {
    const client = await clientPromise;
    const db = client.db();
    const usersCollection = db.collection('users');

    if (req.method === 'POST') {
        const { action, name, email, password } = req.body;

        if (action === 'register') {
            try {
                if (!name || !email || !password) {
                    return res.status(400).json({ error: 'Name, email, and password are required' });
                }
                if (password.length < 6) {
                    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
                }

                const existingUser = await usersCollection.findOne({ email });
                if (existingUser) {
                    return res.status(409).json({ error: 'User with this email already exists' });
                }

                const hashedPassword = await bcrypt.hash(password, 10);

                // --- Assign role based on email ---
                const role = SELLER_EMAILS.includes(email.toLowerCase()) ? 'seller' : 'user';

                const newUser = {
                    _id: new ObjectId(),
                    name,
                    email: email.toLowerCase(),
                    password: hashedPassword,
                    role,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                const result = await usersCollection.insertOne(newUser);
                
                // Return the new user object (without password)
                const insertedUser = await usersCollection.findOne({ _id: result.insertedId }, { projection: { password: 0 } });
                // Ensure the ID is properly set in the response
                const userResponse = {
                    ...insertedUser,
                    id: insertedUser._id.toString()
                };
                res.status(201).json(userResponse);

            } catch (error) {
                console.error('Registration API Error:', error);
                res.status(500).json({ error: 'Failed to create user' });
            }
        } else if (action === 'login') {
            try {
                if (!email || !password) {
                    return res.status(400).json({ error: 'Email and password are required' });
                }

                const user = await usersCollection.findOne({ email: email.toLowerCase() });

                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

                const isPasswordMatch = await bcrypt.compare(password, user.password);

                if (!isPasswordMatch) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                // Return user data (excluding password) with proper ID
                const { password: _, ...userWithoutPassword } = user;
                const userResponse = {
                    ...userWithoutPassword,
                    id: user._id.toString()
                };
                res.status(200).json(userResponse);

            } catch (error) {
                console.error('Login API Error:', error);
                res.status(500).json({ error: 'Failed to login' });
            }
        } else {
            res.status(400).json({ error: 'Invalid action' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
} 