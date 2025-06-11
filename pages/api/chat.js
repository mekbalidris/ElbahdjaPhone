import { GoogleGenerativeAI } from '@google/generative-ai';
import { connectToDatabase } from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, language } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
        // --- Step 1: Fetch all products from your database ---
        const { db } = await connectToDatabase();
        const products = await db.collection('products').find({}).toArray();

        // Format the product data into a simple text list for the AI
        const productCatalog = products.map(p => 
            `- Name: ${p.name}, Price: ${p.price} DA, Category: ${p.category}, Brand: ${p.brand}, Stock: ${p.stock}, Description: ${p.description}`
        ).join('\n');
        
        // --- Step 2: Create a detailed system prompt to control the AI ---
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });

        const prompt = `
            **Your Persona and Rules:**
            You are "El Bahdja Phone Bot", a friendly and professional customer service assistant for an e-commerce store called EL Bahdja Phone.
            Your ONLY purpose is to answer questions related to the store's products, shipping, warranty, and payment methods.
            You MUST refuse to answer any questions not related to the store, including questions about history, science, math, coding, or any other general knowledge topic. 
            If asked an off-topic question, you must politely say in ${language === 'fr' ? 'French' : 'English'}: "I can only answer questions about EL Bahdja Phone products and services."
            Your responses should be concise, helpful, and friendly.
            Always provide prices in Algerian Dinars (DA).
            You must respond in the user's detected language: ${language === 'fr' ? 'French' : 'English'}.

            **Store Information:**
            - We ship to all 58 Wilayas in Algeria.
            - All products have a 12-month official warranty.
            - We accept cash on delivery.

            **Available Product Catalog (Use ONLY this information to answer product questions):**
            ${productCatalog}

            ---
            **User's Question:**
            ${message}
        `;

        // --- Step 3: Generate the response based on the complete prompt ---
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.status(200).json({ response: text });
    } catch (error) {
        console.error('Gemini API Error:', error);
        res.status(500).json({ 
            error: 'Sorry, I encountered an error. Please try again.',
            details: error.message 
        });
    }
} 