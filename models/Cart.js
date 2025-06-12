import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
});

const cartSchema = new mongoose.Schema({
    owner: {
        type: String,
        required: true,
        index: true
    },
    items: [cartItemSchema],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 30 * 24 * 60 * 60 // 30 days
    }
});

// Add indexes for better query performance
cartSchema.index({ owner: 1 });
cartSchema.index({ 'items.product': 1 });

export default mongoose.models.Cart || mongoose.model('Cart', cartSchema); 