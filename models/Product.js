import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxLength: 100 // Limit name length
    },
    description: {
        type: String,
        required: true,
        maxLength: 2000 // Limit description length
    },
    price: {
        type: Number,
        required: true,
        min: 0,
        get: v => Math.round(v * 100) / 100 // Round to 2 decimal places
    },
    oldPrice: {
        type: Number,
        min: 0,
        get: v => Math.round(v * 100) / 100 // Round to 2 decimal places
    },
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    images: [{
        type: String,
        required: true,
        maxLength: 500 // Limit image URL length
    }],
    category: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50 // Limit category length
    },
    offer: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    // Enable compression
    compression: {
        level: 6 // Compression level (0-9, higher means more compression but slower)
    }
});

// Update the updatedAt timestamp before saving
productSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Add indexes
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema); 