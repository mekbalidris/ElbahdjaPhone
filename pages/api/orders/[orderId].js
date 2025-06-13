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
        const productsCollection = db.collection('products');

        switch (method) {
            case 'GET':
                const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
                if (!order) {
                    return res.status(404).json({ error: 'Order not found' });
                }
                return res.status(200).json(order);

            case 'PATCH':
                // Require user authentication for status updates
                const userId = req.headers['user-id'];
                if (!userId) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }

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

                // Handle revenue and stock tracking for completed orders
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

                    // Decrease product stock for each item in the order
                    if (currentOrder.items && currentOrder.items.length > 0) {
                        const bulkOps = currentOrder.items.map(item => ({
                            updateOne: {
                                filter: { _id: new ObjectId(item.productId) },
                                update: { $inc: { stock: -(item.quantity || 1) } }
                            }
                        }));
                         if (bulkOps.length > 0) {
                             await productsCollection.bulkWrite(bulkOps);
                         }
                    }
                } else if (status !== 'completed' && currentOrder.status === 'completed') {
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

                     // Increase product stock for each item if order status changes from completed
                    if (currentOrder.items && currentOrder.items.length > 0) {
                         const bulkOps = currentOrder.items.map(item => ({
                             updateOne: {
                                 filter: { _id: new ObjectId(item.productId) },
                                 update: { $inc: { stock: (item.quantity || 1) } }
                             }
                         }));
                          if (bulkOps.length > 0) {
                              await productsCollection.bulkWrite(bulkOps);
                          }
                    }
                }

                return res.status(200).json({ message: 'Order status updated successfully' });

            case 'DELETE':
                // Require user authentication for deletion
                const deleteUserId = req.headers['user-id'];
                if (!deleteUserId) {
                    return res.status(401).json({ error: 'Unauthorized' });
                }

                // Get the order before deleting to check if it was completed
                const orderToDelete = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
                if (!orderToDelete) {
                    return res.status(404).json({ error: 'Order not found' });
                }

                // If the order was completed, subtract its revenue and increase stock
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
                     // Increase product stock for each item when a completed order is deleted
                    if (orderToDelete.items && orderToDelete.items.length > 0) {
                        const bulkOps = orderToDelete.items.map(item => ({
                            updateOne: {
                                filter: { _id: new ObjectId(item.productId) },
                                update: { $inc: { stock: (item.quantity || 1) } }
                            }
                        }));
                         if (bulkOps.length > 0) {
                            await productsCollection.bulkWrite(bulkOps);
                         }
                    }
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