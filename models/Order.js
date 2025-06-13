import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    name: {
        type: String,
        required: true,
        maxLength: 100
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        get: v => Math.round(v * 100) / 100
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        max: 999
    },
    imageUrl: {
        type: String,
        maxLength: 500
    }
}, { _id: false }); // Disable _id for subdocuments to save space

const contactInfoSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxLength: 100
    },
    email: {
        type: String,
        required: true,
        maxLength: 100
    },
    phone: {
        type: String,
        required: true,
        maxLength: 20
    }
}, { _id: false });

const deliveryAddressSchema = new mongoose.Schema({
    street: {
        type: String,
        required: true,
        maxLength: 200
    },
    city: {
        type: String,
        required: true,
        maxLength: 100
    },
    state: {
        type: String,
        required: true,
        maxLength: 100
    },
    zipCode: {
        type: String,
        required: true,
        maxLength: 20
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    items: [orderItemSchema],
    contactInfo: contactInfoSchema,
    deliveryAddress: deliveryAddressSchema,
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    totals: {
        subtotal: {
            type: Number,
            required: true,
            min: 0,
            get: v => Math.round(v * 100) / 100
        },
        shipping: {
            type: Number,
            required: true,
            min: 0,
            get: v => Math.round(v * 100) / 100
        },
        total: {
            type: Number,
            required: true,
            min: 0,
            get: v => Math.round(v * 100) / 100
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 365 * 24 * 60 * 60 // Auto-delete orders after 1 year
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Enable compression
    compression: {
        level: 6
    }
});

// Update the updatedAt timestamp before saving
orderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', orderSchema); 