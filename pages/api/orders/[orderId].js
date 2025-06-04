import clientPromise from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
    const { orderId } = req.query;
    const { method } = req;

    if (!orderId) {
        return res.status(400).json({ error: 'Order ID is required' });
    }

    try {
        const client = await clientPromise;
        const db = client.db();
        const ordersCollection = db.collection('orders');
        const statisticsCollection = db.collection('statistics');

        switch (method) {
            case 'GET':
                const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
                if (!order) {
                    return res.status(404).json({ error: 'Order not found' });
                }
                return res.status(200).json(order);

            case 'PATCH':
                const { status } = req.body;
                
                if (!status) {
                    return res.status(400).json({ error: 'Status is required' });
                }

                const validStatuses = ['pending', 'completed', 'cancelled', 'returned'];
                if (!validStatuses.includes(status)) {
                    return res.status(400).json({ error: 'Invalid status' });
                }

                // Get the current order to check if it was previously completed
                const currentOrder = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
                if (!currentOrder) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                // Update the order status
                const result = await ordersCollection.updateOne(
                    { _id: new ObjectId(orderId) },
                    { 
                        $set: { 
                            status,
                            updatedAt: new Date().toISOString()
                        } 
                    }
                );

                if (result.matchedCount === 0) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                // Handle revenue tracking for completed orders
                if (status === 'completed' && currentOrder.status !== 'completed') {
                    // Add the order total to the revenue
                    await statisticsCollection.updateOne(
                        { _id: 'main' },
                        { 
                            $inc: { 
                                totalRevenue: currentOrder.totals?.total || 0,
                                completedOrders: 1
                            } 
                        },
                        { upsert: true }
                    );
                } else if (currentOrder.status === 'completed' && status !== 'completed') {
                    // Subtract the order total from revenue if uncompleting
                    await statisticsCollection.updateOne(
                        { _id: 'main' },
                        { 
                            $inc: { 
                                totalRevenue: -(currentOrder.totals?.total || 0),
                                completedOrders: -1
                            } 
                        },
                        { upsert: true }
                    );
                }

                return res.status(200).json({ message: 'Order status updated successfully' });

            case 'DELETE':
                // Get the order before deleting to check if it was completed
                const orderToDelete = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
                if (!orderToDelete) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                // If the order was completed, subtract its revenue
                if (orderToDelete.status === 'completed') {
                    await statisticsCollection.updateOne(
                        { _id: 'main' },
                        { 
                            $inc: { 
                                totalRevenue: -(orderToDelete.totals?.total || 0),
                                completedOrders: -1
                            } 
                        },
                        { upsert: true }
                    );
                }

                // Delete the order
                const deleteResult = await ordersCollection.deleteOne({ _id: new ObjectId(orderId) });
                if (deleteResult.deletedCount === 0) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                return res.status(200).json({ message: 'Order deleted successfully' });

            default:
                res.setHeader('Allow', ['GET', 'PATCH', 'DELETE']);
                return res.status(405).json({ error: `Method ${method} Not Allowed` });
        }
    } catch (error) {
        console.error('Error handling order:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
} 