import clientPromise from '../../lib/mongodb';

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
            .limit(5)
            .toArray();

        // Get top selling products
        const topProducts = await db.collection('orders').aggregate([
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.productId',
                    totalSold: { $sum: '$items.quantity' }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 5 }
        ]).toArray();

        // Get product details for top selling products
        const productIds = topProducts.map(p => p._id);
        const products = await db.collection('products')
            .find({ _id: { $in: productIds } })
            .toArray();

        const topProductsWithDetails = topProducts.map(tp => {
            const product = products.find(p => p._id.toString() === tp._id.toString());
            return {
                ...tp,
                productName: product?.name || 'Unknown Product',
                productPrice: product?.price || 0
            };
        });

        res.status(200).json({
            totalOrders,
            totalRevenue,
            ordersByStatus,
            recentOrders,
            topProducts: topProductsWithDetails
        });
    } catch (error) {
        console.error('Statistics API Error:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
} 