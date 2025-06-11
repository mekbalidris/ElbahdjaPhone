import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { rateLimiter } from '../../../lib/rateLimit';
import { connectToDatabase } from '../../../lib/mongodb';
import { verifyPassword } from '../../../lib/auth';

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
    try {
        const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
        });
        const data = await response.json();
        return data.success;
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        return false;
    }
}

export default rateLimiter(async function auth(req, res) {
    return await NextAuth(req, res, {
        providers: [
            CredentialsProvider({
                name: 'Credentials',
                credentials: {
                    email: { label: "Email", type: "email" },
                    password: { label: "Password", type: "password" },
                    recaptchaToken: { label: "reCAPTCHA", type: "text" }
                },
                async authorize(credentials) {
                    try {
                        // Verify reCAPTCHA
                        if (!credentials.recaptchaToken) {
                            throw new Error('reCAPTCHA verification required');
                        }

                        const isValidRecaptcha = await verifyRecaptcha(credentials.recaptchaToken);
                        if (!isValidRecaptcha) {
                            throw new Error('reCAPTCHA verification failed');
                        }

                        const { db } = await connectToDatabase();
                        const user = await db.collection('users').findOne({ email: credentials.email });

                        if (!user) {
                            throw new Error('No user found with this email');
                        }

                        const isValid = await verifyPassword(credentials.password, user.password);
                        if (!isValid) {
                            throw new Error('Invalid password');
                        }

                        return {
                            id: user._id.toString(),
                            email: user.email,
                            name: user.name,
                            role: user.role
                        };
                    } catch (error) {
                        throw new Error(error.message);
                    }
                }
            })
        ],
        session: {
            strategy: 'jwt',
            maxAge: 30 * 24 * 60 * 60, // 30 days
        },
        callbacks: {
            async jwt({ token, user }) {
                if (user) {
                    token.role = user.role;
                    token.id = user.id;
                }
                return token;
            },
            async session({ session, token }) {
                if (token) {
                    session.user.role = token.role;
                    session.user.id = token.id;
                }
                return session;
            }
        },
        pages: {
            signIn: '/auth',
            error: '/auth',
        },
        secret: process.env.NEXTAUTH_SECRET,
    });
}); 