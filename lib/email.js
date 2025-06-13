import nodemailer from 'nodemailer';

// Create a transporter using environment variables
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

// Function to send order confirmation email to admin
export async function sendOrderConfirmationEmail(order) {
    const startTime = Date.now();
    // Convert ObjectId to string before using slice
    const orderId = order._id.toString();
    console.log(`[${new Date().toISOString()}] Starting to send order confirmation email for order #${orderId.slice(-6)}`);

    try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.error(`[${new Date().toISOString()}] Error: Admin email not configured in environment variables`);
            return;
        }

        console.log(`[${new Date().toISOString()}] Preparing email for admin: ${adminEmail}`);

        const orderItems = order.items.map(item => 
            `${item.name} - Quantity: ${item.quantity} - Price: ${item.price} DA`
        ).join('\n');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: adminEmail,
            subject: `New Order #${orderId.slice(-6)} Received`,
            html: `
                <h2>New Order Received</h2>
                <p><strong>Order ID:</strong> ${orderId}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
                
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${order.contactInfo.fullName}</p>
                <p><strong>Email:</strong> ${order.contactInfo.email}</p>
                <p><strong>Phone:</strong> ${order.contactInfo.phone}</p>
                
                <h3>Delivery Address</h3>
                <p>${order.deliveryAddress.address}</p>
                ${order.deliveryAddress.aptSuite ? `<p>Apt/Suite: ${order.deliveryAddress.aptSuite}</p>` : ''}
                <p>${order.deliveryAddress.city}, ${order.deliveryAddress.wilaya}</p>
                
                <h3>Order Items</h3>
                <ul>
                    ${orderItems}
                </ul>
                
                <h3>Order Summary</h3>
                <p><strong>Subtotal:</strong> ${order.totals.subtotal} DA</p>
                <p><strong>Shipping:</strong> ${order.totals.shippingCost} DA</p>
                <p><strong>Tax:</strong> ${order.totals.taxes} DA</p>
                <p><strong>Total:</strong> ${order.totals.total} DA</p>
                
                ${order.orderNotes ? `<h3>Order Notes</h3><p>${order.orderNotes}</p>` : ''}
            `,
        };

        console.log(`[${new Date().toISOString()}] Attempting to send email...`);
        const info = await transporter.sendMail(mailOptions);
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000; // Convert to seconds

        console.log(`[${new Date().toISOString()}] Email sent successfully!`);
        console.log(`[${new Date().toISOString()}] Email details:`);
        console.log(`- Message ID: ${info.messageId}`);
        console.log(`- Response: ${info.response}`);
        console.log(`- Time taken: ${duration} seconds`);
        
        return {
            success: true,
            messageId: info.messageId,
            duration: duration,
            timestamp: new Date().toISOString()
        };
    } catch (error) {
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        
        console.error(`[${new Date().toISOString()}] Error sending order confirmation email:`);
        console.error(`- Error message: ${error.message}`);
        console.error(`- Error code: ${error.code}`);
        console.error(`- Time taken before error: ${duration} seconds`);
        
        if (error.code === 'EAUTH') {
            console.error('Authentication failed. Please check your email credentials in .env.local');
        } else if (error.code === 'ESOCKET') {
            console.error('Network error. Please check your internet connection and email service settings');
        }
        
        return {
            success: false,
            error: error.message,
            code: error.code,
            duration: duration,
            timestamp: new Date().toISOString()
        };
    }
} 