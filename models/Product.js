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
    sizes: [{
        type: String,
        trim: true,
        uppercase: true,
        maxLength: 10
    }],
    colors: [{
        type: String,
        trim: true,
        maxLength: 20
    }],
    brand: {
        type: String,
        trim: true,
        maxLength: 50
    },
    gender: {
        type: String,
        enum: ['Men', 'Women', 'Unisex'],
        trim: true
    },
    offer: {
        type: Boolean,
        default: false
    },
    coupe: {
        type: String,
        trim: true,
        maxLength: 50,
        required: false
    },
    matiere: {
        type: String,
        trim: true,
        maxLength: 50,
        required: false
    },
    saison: {
        type: String,
        trim: true,
        maxLength: 50,
        required: false
    },
    comments: [
        {
            _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            userName: { type: String, required: true },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
            approved: { type: Boolean, default: false },
        }
    ],
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
productSchema.index({ gender: 1 });
productSchema.index({ brand: 1 });

export default mongoose.models.Product || mongoose.model('Product', productSchema); 