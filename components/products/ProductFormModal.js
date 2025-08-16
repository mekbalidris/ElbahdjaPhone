import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import Icon from '../ui/Icon';

const CATEGORIES = [
    { value: 'phones', label: 'Phones' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'watch', label: 'Watches' },
];

const BRANDS = {
    phones: [
        { value: '', label: 'Choose a brand', disabled: true },
        { value: 'apple', label: 'Apple' },
        { value: 'samsung', label: 'Samsung' },
        { value: 'xiaomi', label: 'Xiaomi' },
        { value: 'huawei', label: 'Huawei' },
        { value: 'oppo', label: 'Oppo' },
        { value: 'vivo', label: 'Vivo' },
        { value: 'oneplus', label: 'OnePlus' },
        { value: 'google', label: 'Google' },
        { value: 'other', label: 'Other' },
    ],
    laptops: [
        { value: '', label: 'Choose a brand', disabled: true },
        { value: 'apple', label: 'Apple' },
        { value: 'dell', label: 'Dell' },
        { value: 'hp', label: 'HP' },
        { value: 'lenovo', label: 'Lenovo' },
        { value: 'asus', label: 'ASUS' },
        { value: 'acer', label: 'Acer' },
        { value: 'msi', label: 'MSI' },
        { value: 'razer', label: 'Razer' },
        { value: 'other', label: 'Other' },
    ],
    accessories: [
        { value: '', label: 'Choose a brand', disabled: true },
        { value: 'apple', label: 'Apple' },
        { value: 'samsung', label: 'Samsung' },
        { value: 'sony', label: 'Sony' },
        { value: 'jbl', label: 'JBL' },
        { value: 'logitech', label: 'Logitech' },
        { value: 'anker', label: 'Anker' },
        { value: 'belkin', label: 'Belkin' },
        { value: 'other', label: 'Other' },
    ],
    watch: [
        { value: '', label: 'Choose a brand', disabled: true },
        { value: 'apple', label: 'Apple' },
        { value: 'samsung', label: 'Samsung' },
        { value: 'other', label: 'Other' },
    ],
};

// Predefined options for colors and storage sizes
const PREDEFINED_COLORS = ['Noir', 'Blanc', 'Or', 'Argent', 'Bleu', 'Vert', 'Rouge', 'Rose', 'Violet', 'Gris'];
const PREDEFINED_SIZES = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];

const ProductFormModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('phones');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [oldPrice, setOldPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [errors, setErrors] = useState({});
    const [images, setImages] = useState([null, null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);
    
    // New state for colors and sizes
    const [colors, setColors] = useState([]);
    const [sizes, setSizes] = useState([]);
    const [newColor, setNewColor] = useState('');
    const [newSize, setNewSize] = useState('');

    useEffect(() => {
        if (product) {
            setName(product.name);
            setCategory(product.category);
            setBrand(product.brand || '');
            setPrice(String(product.price));
            setOldPrice(String(product.oldPrice || ''));
            setDescription(product.description);
            setStock(String(product.stock));
            setImages(product.images || [null, null, null, null]);
            setImagePreviews(product.images || [null, null, null, null]);
            setColors(product.colors || []);
            setSizes(product.sizes || []);
        } else {
            setName('');
            setCategory('phones');
            setBrand('');
            setPrice('');
            setOldPrice('');
            setDescription('');
            setStock('');
            setImages([null, null, null, null]);
            setImagePreviews([null, null, null, null]);
            setColors([]);
            setSizes([]);
        }
        setErrors({});
    }, [product, isOpen]);

    const validateForm = () => {
        const newErrors = {};
        if (!name.trim()) newErrors.name = "Product name is required.";
        if (!category) newErrors.category = "Category is required.";
        if (!brand) newErrors.brand = "Brand is required.";
        if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) newErrors.price = "Valid price is required.";
        if (oldPrice && (isNaN(parseFloat(oldPrice)) || parseFloat(oldPrice) <= 0)) newErrors.oldPrice = "Old price must be a valid number greater than 0.";
        if (oldPrice && parseFloat(oldPrice) <= parseFloat(price)) newErrors.oldPrice = "Old price must be greater than current price.";
        if (!description.trim()) newErrors.description = "Description is required.";
        if (stock === '' || isNaN(parseInt(stock)) || parseInt(stock) < 0 || !Number.isInteger(parseFloat(stock))) newErrors.stock = "Valid stock quantity (whole number, 0 or more) is required.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Color management functions
    const addColor = () => {
        if (newColor.trim() && !colors.includes(newColor.trim())) {
            setColors([...colors, newColor.trim()]);
            setNewColor('');
        }
    };

    const removeColor = (colorToRemove) => {
        setColors(colors.filter(color => color !== colorToRemove));
    };

    const addPredefinedColor = (color) => {
        if (!colors.includes(color)) {
            setColors([...colors, color]);
        }
    };

    // Size management functions
    const addSize = () => {
        if (newSize.trim() && !sizes.includes(newSize.trim())) {
            setSizes([...sizes, newSize.trim()]);
            setNewSize('');
        }
    };

    const removeSize = (sizeToRemove) => {
        setSizes(sizes.filter(size => size !== sizeToRemove));
    };

    const addPredefinedSize = (size) => {
        if (!sizes.includes(size)) {
            setSizes([...sizes, size]);
        }
    };

    const compressImage = (base64String, maxWidth = 800) => {
        return new Promise((resolve) => {
            const img = new Image();
            img.src = base64String;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to JPEG with 0.8 quality
                resolve(canvas.toDataURL('image/jpeg', 0.8));
            };
        });
    };

    const handleImageChange = async (idx, file) => {
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                const compressedImage = await compressImage(reader.result);
                const newImages = [...images];
                const newPreviews = [...imagePreviews];
                newImages[idx] = compressedImage;
                newPreviews[idx] = compressedImage;
                setImages(newImages);
                setImagePreviews(newPreviews);
            } catch (err) {
                toast.error('Failed to process image');
            }
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = (idx) => {
        const newImages = [...images];
        const newPreviews = [...imagePreviews];
        newImages[idx] = null;
        newPreviews[idx] = null;
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please correct the errors in the form.");
            return;
        }
        const filteredImages = images.filter(img => !!img);
        const payload = { 
            name, 
            category, 
            brand,
            price: parseFloat(price), 
            oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
            description, 
            stock: parseInt(stock), 
            images: filteredImages,
            colors: colors.length > 0 ? colors : undefined,
            sizes: sizes.length > 0 ? sizes : undefined,
            offer: !!oldPrice // Automatically set offer to true if oldPrice is provided
        };
        if (product && product.id) payload.id = product.id;
        onSubmit(payload);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? "Edit Product" : "Add New Product"} size="lg">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl mx-auto border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <Icon name="package" className="w-6 h-6 mr-2 text-blue-500" /> Product Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input label="Product Name" name="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Galaxy Nova X" required error={errors.name} />
                            <Select label="Category" name="category" options={CATEGORIES} value={category} onChange={e => setCategory(e.target.value)} required error={errors.category} />
                            <Select label="Brand" name="brand" options={BRANDS[category] || []} value={brand} onChange={e => setBrand(e.target.value)} required error={errors.brand} />
                            <Input label="Current Price (DA)" name="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 799.99" required error={errors.price} />
                            <Input label="Old Price (DA) 'optional'" name="oldPrice" type="number" value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="e.g., 999.99" error={errors.oldPrice} />
                            <Input label="Stock (0 for Out of Stock)" name="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g., 50" required error={errors.stock} />
                        </div>
                    </div>

                    {/* Colors Section */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <Icon name="palette" className="w-6 h-6 mr-2 text-purple-500" /> Colors (Optional)
                        </h2>
                        <p className="text-gray-500 text-sm mb-3">Add available colors for this product. Users will be able to select from these options.</p>
                        
                        {/* Predefined colors */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add Colors:</label>
                            <div className="flex flex-wrap gap-2">
                                {PREDEFINED_COLORS.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => addPredefinedColor(color)}
                                        disabled={colors.includes(color)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                            colors.includes(color)
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom color input */}
                        <div className="flex gap-2 mb-3">
                            <Input
                                label="Add Custom Color"
                                value={newColor}
                                onChange={e => setNewColor(e.target.value)}
                                placeholder="e.g., Midnight Blue"
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                            />
                            <Button
                                type="button"
                                onClick={addColor}
                                variant="secondary"
                                className="mt-6 h-10"
                                disabled={!newColor.trim()}
                            >
                                Add
                            </Button>
                        </div>

                        {/* Selected colors */}
                        {colors.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Colors:</label>
                                <div className="flex flex-wrap gap-2">
                                    {colors.map(color => (
                                        <div
                                            key={color}
                                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                                        >
                                            <span>{color}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeColor(color)}
                                                className="ml-1 text-blue-600 hover:text-blue-800"
                                            >
                                                <Icon name="x" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sizes/Storage Section */}
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <Icon name="hard-drive" className="w-6 h-6 mr-2 text-green-500" /> Storage Sizes (Optional)
                        </h2>
                        <p className="text-gray-500 text-sm mb-3">Add available storage sizes for this product. Users will be able to select from these options.</p>
                        
                        {/* Predefined sizes */}
                        <div className="mb-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quick Add Sizes:</label>
                            <div className="flex flex-wrap gap-2">
                                {PREDEFINED_SIZES.map(size => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => addPredefinedSize(size)}
                                        disabled={sizes.includes(size)}
                                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                                            sizes.includes(size)
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Custom size input */}
                        <div className="flex gap-2 mb-3">
                            <Input
                                label="Add Custom Size"
                                value={newSize}
                                onChange={e => setNewSize(e.target.value)}
                                placeholder="e.g., 32GB"
                                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                            />
                            <Button
                                type="button"
                                onClick={addSize}
                                variant="secondary"
                                className="mt-6 h-10"
                                disabled={!newSize.trim()}
                            >
                                Add
                            </Button>
                        </div>

                        {/* Selected sizes */}
                        {sizes.length > 0 && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Selected Sizes:</label>
                                <div className="flex flex-wrap gap-2">
                                    {sizes.map(size => (
                                        <div
                                            key={size}
                                            className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                                        >
                                            <span>{size}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeSize(size)}
                                                className="ml-1 text-green-600 hover:text-green-800"
                                            >
                                                <Icon name="x" className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <Icon name="image" className="w-6 h-6 mr-2 text-green-500" /> Product Images
                        </h2>
                        <p className="text-gray-500 text-sm mb-2">Upload up to 4 images. The first image will be the main product image.</p>
                        <div className="grid grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map(idx => (
                                <div key={idx} className="flex flex-col items-center bg-gray-50 rounded-lg p-3 border border-dashed border-gray-300 relative group">
                                    {imagePreviews[idx] ? (
                                        <>
                                            <Image src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} width={112} height={112} className="w-28 h-28 object-cover rounded shadow mb-2 border border-gray-200" />
                                            <button type="button" onClick={() => handleRemoveImage(idx)} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-100 transition">
                                                <Icon name="x" className="w-5 h-5 text-red-500" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <label className="flex flex-col items-center justify-center w-28 h-28 cursor-pointer hover:bg-blue-50 rounded transition border-2 border-dashed border-gray-300 group-hover:border-blue-400">
                                                <Icon name="image" className="w-8 h-8 text-gray-400 mb-1" />
                                                <span className="text-xs text-gray-400">Upload</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={e => handleImageChange(idx, e.target.files[0])}
                                                    className="hidden"
                                                />
                                            </label>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <h2 className="text-xl font-bold text-gray-800 mb-2 flex items-center">
                            <Icon name="edit" className="w-6 h-6 mr-2 text-yellow-500" /> Description
                        </h2>
                        <TextArea label="Description" name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product description..." rows={4} required error={errors.description} />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-2">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                        <Button type="submit" variant="primary">{product ? "Save Changes" : "Add Product"}</Button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

export default ProductFormModal; 