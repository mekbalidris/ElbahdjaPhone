import clientPromise from '../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db();

        // Get total orders
        const totalOrders = await db.collection('orders').countDocuments();
        
        // Get total revenue (only from completed orders)
        const completedOrders = await db.collection('orders')
            .find({ status: 'completed' })
            .toArray();
        const totalRevenue = completedOrders.reduce((sum, order) => 
            sum + (order.totals?.total || 0), 0);

        // Get orders by status
        const ordersByStatus = await db.collection('orders').aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]).toArray();

        // Get recent orders
        const recentOrders = await db.collection('orders')
            .find({})
            .sort({ createdAt: -1 })
            .limit(10)
            .toArray();

        // Get top selling products (only from completed orders)
        const topProducts = await db.collection('orders').aggregate([
            { $match: { status: 'completed' } }, // Only count completed orders
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalSold: { $sum: '$items.quantity' },
                    productName: { $first: '$items.name' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 3 }
        ]).toArray();

        res.status(200).json({
            totalOrders,
            totalRevenue,
            ordersByStatus,
            recentOrders,
            topProducts
        });
    } catch (error) {
        console.error('Statistics API Error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
} 