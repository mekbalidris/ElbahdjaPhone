import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { toast } from 'react-hot-toast';
import Icon from '../ui/Icon';

const CATEGORIES = [
    { value: '', label: 'Choisir une catégorie', disabled: true },
    { value: 'tshirts', label: 'T-shirts' },
    { value: 'pantalons', label: 'Pantalons' },
    { value: 'jeans', label: 'Jeans' },
    { value: 'chaussures', label: 'Chaussures' },
    { value: 'vestes', label: 'Vestes' },
    { value: 'accessoires', label: 'Accessoires' },
    { value: 'short', label: 'Short' },
    { value: 'chapeau', label: 'Chapeau' },
    { value: 'casquette', label: 'Casquette' },
    { value: 'hoodie', label: 'Hoodie' },
    { value: 'gilet_ceinture', label: 'Gilet ceinturé' },
];

const BRANDS = [
    { value: '', label: 'Choisir une marque', disabled: true },
    { value: 'nike', label: 'Nike' },
    { value: 'adidas', label: 'Adidas' },
    { value: 'zara', label: 'Zara' },
    { value: 'cosmos', label: 'Cosmos' },
    { value: 'lacoste', label: 'Lacoste' },
    { value: 'polo', label: 'Polo' },
    { value: 'anime', label: 'Anime' },
    { value: 'autre', label: 'Autre' },
];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES = ['39', '40', '41', '42', '43', '44', '45', '46'];

const GENRES = [
    { value: '', label: 'Choisir le genre', disabled: true },
    { value: 'homme', label: 'Homme' },
    { value: 'femme', label: 'Femme' },
    { value: 'unisexe', label: 'Unisexe' },
];
const MATIERES = [
    { value: '', label: 'Choisir la matière', disabled: true },
    { value: 'coton', label: 'Coton' },
    { value: 'laine', label: 'Laine' },
    { value: 'polyester', label: 'Polyester' },
    { value: 'cuir', label: 'Cuir' },
    { value: 'autre', label: 'Autre' },
];
const COUPES = [
    { value: '', label: 'Choisir la coupe', disabled: true },
    { value: 'slim', label: 'Slim' },
    { value: 'regular', label: 'Regular' },
    { value: 'oversize', label: 'Oversize' },
];
const SAISONS = [
    { value: '', label: 'Choisir la saison', disabled: true },
    { value: 'all', label: 'Toutes saisons' },
    { value: 'printemps', label: 'Printemps' },
    { value: 'ete', label: 'Été' },
    { value: 'automne', label: 'Automne' },
    { value: 'hiver', label: 'Hiver' },
];

const COLOR_OPTIONS = [
    'Noir', 'Blanc', 'Bleu', 'Rouge', 'Vert', 'Jaune', 'Gris', 'Marron', 'Violet', 'Orange', 'Rose', 'Beige', 'Kaki', 'Bordeaux', 'Turquoise', 'Doré', 'Argent'
];

const COLOR_MAP = {
    'Noir': 'black',
    'Blanc': 'white',
    'Bleu': 'blue',
    'Rouge': 'red',
    'Vert': 'green',
    'Jaune': 'yellow',
    'Gris': 'gray',
    'Marron': 'brown',
    'Violet': 'violet',
    'Orange': 'orange',
    'Rose': 'pink',
    'Beige': 'beige',
    'Kaki': 'olive',
    'Bordeaux': '#800000',
    'Turquoise': 'turquoise',
    'Doré': 'gold',
    'Argent': 'silver',
};

const ProductFormModal = ({ isOpen, onClose, onSubmit, product }) => {
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [brand, setBrand] = useState('');
    const [price, setPrice] = useState('');
    const [oldPrice, setOldPrice] = useState('');
    const [description, setDescription] = useState('');
    const [stock, setStock] = useState('');
    const [errors, setErrors] = useState({});
    const [images, setImages] = useState([null, null, null, null]);
    const [imagePreviews, setImagePreviews] = useState([null, null, null, null]);
    const [sizes, setSizes] = useState([]);
    const [colors, setColors] = useState([]);
    const [colorInput, setColorInput] = useState('');
    const [sizeInput, setSizeInput] = useState('');
    const [genre, setGenre] = useState('');
    const [matiere, setMatiere] = useState('');
    const [coupe, setCoupe] = useState('');
    const [saison, setSaison] = useState('');

    useEffect(() => {
        if (product) {
            setName(product.name);
            setCategory(product.category || '');
            setBrand(product.brand || '');
            setPrice(String(product.price));
            setOldPrice(String(product.oldPrice || ''));
            setDescription(product.description);
            setStock(String(product.stock));
            setImages(product.images || [null, null, null, null]);
            setImagePreviews(product.images || [null, null, null, null]);
            setSizes(product.sizes || []);
            setColors(product.colors || []);
            setGenre(product.genre || '');
            setMatiere(product.matiere || '');
            setCoupe(product.coupe || '');
            setSaison(product.saison || '');
        } else {
            setName('');
            setCategory('');
            setBrand('');
            setPrice('');
            setOldPrice('');
            setDescription('');
            setStock('');
            setImages([null, null, null, null]);
            setImagePreviews([null, null, null, null]);
            setSizes([]);
            setColors([]);
            setGenre('');
            setMatiere('');
            setCoupe('');
            setSaison('');
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
        if (colors.length === 0) newErrors.colors = "Veuillez ajouter au moins une couleur.";
        if (!genre) newErrors.genre = "Veuillez choisir le genre.";
        if (sizes.length === 0 && category !== 'chapeau' && category !== 'casquette') newErrors.sizes = "Veuillez ajouter au moins une taille.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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
            category: category.toLowerCase(),
            brand,
            price: parseFloat(price), 
            oldPrice: oldPrice ? parseFloat(oldPrice) : undefined,
            description, 
            stock: parseInt(stock), 
            images: filteredImages,
            sizes,
            colors,
            offer: !!oldPrice,
            genre,
            matiere,
            coupe,
            saison
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
                            <Input label={<span>Product Name <span className="text-red-500">*</span></span>} name="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Adidas T-shirt" required error={errors.name} />
                            <Select label={<span>Category <span className="text-red-500">*</span></span>} name="category" options={CATEGORIES} value={category} onChange={e => setCategory(e.target.value)} required error={errors.category} />
                            <Select label={<span>Brand <span className="text-red-500">*</span></span>} name="brand" options={BRANDS} value={brand} onChange={e => setBrand(e.target.value)} required error={errors.brand} />
                            <Select label={<span>Genre <span className="text-red-500">*</span></span>} name="genre" options={GENRES} value={genre} onChange={e => setGenre(e.target.value)} required error={errors.genre} />
                            <Select label="Matière" name="matiere" options={MATIERES} value={matiere} onChange={e => setMatiere(e.target.value)} error={errors.matiere} />
                            <Select label="Coupe" name="coupe" options={COUPES} value={coupe} onChange={e => setCoupe(e.target.value)} error={errors.coupe} />
                            <Select label="Saison" name="saison" options={SAISONS} value={saison} onChange={e => setSaison(e.target.value)} error={errors.saison} />
                            <Input label={<span>Current Price (DA) <span className="text-red-500">*</span></span>} name="price" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., 799.99" required error={errors.price} />
                            <Input label="Old Price (DA) 'optional'" name="oldPrice" type="number" value={oldPrice} onChange={e => setOldPrice(e.target.value)} placeholder="e.g., 999.99" error={errors.oldPrice} />
                            <Input label={<span>Stock (0 for Out of Stock) <span className="text-red-500">*</span></span>} name="stock" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="e.g., 50" required error={errors.stock} />
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Tailles disponibles <span className="text-red-500">*</span></label>
                                <div className="flex gap-2 mb-2">
                                    {(category === 'chaussures' ? SHOE_SIZES : CLOTHING_SIZES).map(size => (
                                        <button
                                            type="button"
                                            key={size}
                                            className={`px-3 py-1 rounded border text-sm ${sizes.includes(size) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
                                            onClick={() => setSizes(sizes.includes(size) ? sizes.filter(s => s !== size) : [...sizes, size])}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                                {errors.sizes && <div className="text-red-500 text-xs mt-1">{errors.sizes}</div>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Couleurs disponibles <span className="text-red-500">*</span></label>
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {COLOR_OPTIONS.map((color) => (
                                        <button
                                            type="button"
                                            key={color}
                                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-yellow-500 mr-1 mb-1 ${colors.includes(color) ? 'border-gray-900 scale-110 ring-2 ring-yellow-500' : 'border-gray-300'}`}
                                            style={{ background: color === 'Multicolore' ? COLOR_MAP[color] : undefined, backgroundColor: color !== 'Multicolore' ? COLOR_MAP[color] : undefined }}
                                            title={color}
                                            onClick={() => {
                                                if (colors.includes(color)) {
                                                    setColors(colors.filter((c) => c !== color));
                                                } else {
                                                    setColors([...colors, color]);
                                                }
                                            }}
                                        >
                                            {colors.includes(color) && (
                                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            )}
                                            <span className="sr-only">{color}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.colors && <div className="text-red-500 text-xs mt-1">{errors.colors}</div>}
                            </div>
                        </div>
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
                                            <img src={imagePreviews[idx]} alt={`Preview ${idx + 1}`} className="w-28 h-28 object-cover rounded shadow mb-2 border border-gray-200" />
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
                        <TextArea label={<span>Description <span className="text-red-500">*</span></span>} name="description" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detailed product description..." rows={4} required error={errors.description} />
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