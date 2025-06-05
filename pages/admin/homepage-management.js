import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext'; // Assuming this path is correct
import { useRouter } from 'next/router'; // Assuming this path is correct
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button'; // Assuming this path is correct
import Icon from '../../components/ui/Icon';   // Assuming this path is correct

const HomepageManagement = () => {
    const { currentUser, isLoading: isLoadingAuth } = useAuth();
    const router = useRouter();
    const [allProducts, setAllProducts] = useState([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(true);
    const [showcaseVideoVisible, setShowcaseVideoVisible] = useState(true);
    const [isLoadingShowcase, setIsLoadingShowcase] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    // currentVideoPath will now be dynamic based on successful upload, forcing video re-render
    const [currentVideoKey, setCurrentVideoKey] = useState(Date.now()); // Used to force video re-render
    const fileInputRef = useRef(null);

    // State for search terms
    const [featuredSearchTerm, setFeaturedSearchTerm] = useState('');
    const [offerSearchTerm, setOfferSearchTerm] = useState('');

    // Memoized lists for currently featured/offer products
    const featuredProducts = useMemo(() => allProducts.filter(p => p.featured), [allProducts]);
    const offerProducts = useMemo(() => allProducts.filter(p => p.offer), [allProducts]);

    // Memoized lists for products available to be added, filtered by search term
    const availableForFeatured = useMemo(() => {
        if (!featuredSearchTerm.trim()) {
            return allProducts.filter(p => !p.featured);
        }
        return allProducts.filter(p => 
            !p.featured && p.name.toLowerCase().includes(featuredSearchTerm.toLowerCase())
        );
    }, [allProducts, featuredSearchTerm]);

    const availableForOffers = useMemo(() => {
        if (!offerSearchTerm.trim()) {
            return allProducts.filter(p => !p.offer);
        }
        return allProducts.filter(p => 
            !p.offer && p.name.toLowerCase().includes(offerSearchTerm.toLowerCase())
        );
    }, [allProducts, offerSearchTerm]);

    const isAdmin = currentUser?.role === 'seller';

    useEffect(() => {
        if (!isLoadingAuth && !isAdmin) {
            toast.error("Access Denied. Redirecting...");
            router.push('/');
        }
    }, [currentUser, isLoadingAuth, isAdmin, router]);

    useEffect(() => {
        if (isAdmin) {
            fetchProducts();
            fetchShowcaseSettings(); // Fetches visibility and sets initial video key
        }
    }, [isAdmin]);

    const fetchShowcaseSettings = async () => {
        setIsLoadingShowcase(true);
        try {
            const res = await fetch('/api/showcase'); // This API should return { visible: boolean }
            if (!res.ok) {
                 // If video not found (404), assume it's not visible and no video exists yet
                if (res.status === 404) {
                    setShowcaseVideoVisible(false);
                    toast.info("No showcase video currently set up.");
                    return;
                }
                throw new Error('Failed to fetch showcase settings');
            }
            const data = await res.json();
            setShowcaseVideoVisible(data.visible);
            setCurrentVideoKey(Date.now()); // Update key to ensure video reloads if it exists
        } catch (error) {
            console.error('Error fetching showcase settings:', error);
            toast.error(error.message || 'Failed to load showcase video status');
        } finally {
            setIsLoadingShowcase(false);
        }
    };

    const fetchProducts = async () => {
        setIsLoadingProducts(true);
        try {
            const res = await fetch('/api/products');
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Failed to fetch products' }));
                throw new Error(errorData.error || 'Failed to fetch products');
            }
            const data = await res.json();
            setAllProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error(error.message || 'Failed to load products');
        } finally {
            setIsLoadingProducts(false);
        }
    };

    const updateProductFlags = async (productId, flags) => {
        console.log('Attempting to update product flags:');
        console.log('Product ID:', productId);
        console.log('Flags to update:', flags);
        // Simple confirmation for critical actions
        try {
            const res = await fetch(`/api/products`, { // Use the main /api/products endpoint
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ _id: productId, ...flags }), // Include productId in the body as _id
            });
            const responseData = await res.json();
            if (!res.ok) throw new Error(responseData.error || `Failed to update product ${productId}`);
            
            toast.success(responseData.message || `Product ${productId} updated.`);
            setAllProducts(prevProducts =>
                prevProducts.map(p =>
                    p._id === productId ? { ...p, ...flags } : p
                )
            );
        } catch (error) {
            console.error('Error updating product flags:', error);
            toast.error(error.message || 'Failed to update product flags.');
        }
    };

    const toggleShowcaseVideoVisibility = async () => {
        setIsLoadingShowcase(true);
        try {
            const res = await fetch('/api/showcase', { // This API should handle PATCH for visibility
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visible: !showcaseVideoVisible }),
            });
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to toggle video visibility');
            }
            const data = await res.json();
            setShowcaseVideoVisible(data.visible);
            toast.success(data.message || 'Showcase video visibility updated.');
        } catch (error) {
            console.error('Error toggling video visibility:', error);
            toast.error(error.message || 'Failed to toggle video visibility.');
        } finally {
            setIsLoadingShowcase(false);
        }
    };

    const handleVideoUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('video/')) {
            toast.error('Invalid file type. Please upload a video file (e.g., MP4, WebM).');
            return;
        }
        if (file.size > 50 * 1024 * 1024) { // 50MB
            toast.error('Video file is too large. Maximum size is 50MB.');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('video', file); // Ensure the key 'video' matches backend

        try {
            const res = await fetch('/api/showcase/upload', {
                method: 'POST',
                body: formData,
            });
            const data = await res.json(); // Always try to parse JSON

            if (!res.ok) {
                throw new Error(data.error || `Upload failed with status: ${res.status}`);
            }
            
            toast.success(data.message || 'Video uploaded successfully!');
            setCurrentVideoKey(Date.now()); // Force video component to re-render with new content
            setShowcaseVideoVisible(true); // Assume visible after successful upload
        } catch (error) {
            console.error('Error uploading video:', error);
            toast.error(`Upload failed: ${error.message}`);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = ''; // Reset file input
            }
        }
    };

    if (isLoadingAuth && !currentUser) { // Show loading only if auth is pending and no user yet
        return <div className="flex justify-center items-center h-screen text-gray-700"><p className="text-xl">Loading Authentication...</p></div>;
    }
    if (!isAdmin && !isLoadingAuth) { // If auth loaded and still not admin, this part might not be reached due to useEffect redirect
         return <div className="flex justify-center items-center h-screen text-red-500"><p className="text-xl">Access Denied.</p></div>;
    }
    if (!isAdmin && isLoadingAuth) { // If still loading auth but no user, show loading
        return <div className="flex justify-center items-center h-screen text-gray-700"><p className="text-xl">Verifying Access...</p></div>;
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 font-sans">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Homepage Management</h1>
                <p className="text-gray-600 mt-1">Control the content displayed on your homepage.</p>
            </header>

            {/* Showcase Video Management */}
            <section className="bg-white shadow-xl rounded-lg p-6 mb-8">
                <h2 className="text-2xl font-semibold text-gray-700 mb-5 border-b pb-3">Showcase Video</h2>
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                        <span className="text-gray-700">
                            Hero Video is currently: 
                            <strong className={showcaseVideoVisible ? "text-green-600" : "text-red-600"}>
                                {isLoadingShowcase ? ' Checking...' : (showcaseVideoVisible ? ' Visible' : ' Hidden')}
                            </strong>
                        </span>
                        <Button
                            onClick={toggleShowcaseVideoVisibility}
                            variant={showcaseVideoVisible ? 'secondary' : 'primary'}
                            disabled={isLoadingShowcase || isUploading}
                            className="w-full sm:w-auto"
                        >
                            {isLoadingShowcase ? 'Updating...' : (showcaseVideoVisible ? 'Hide Video' : 'Show Video')}
                        </Button>
                    </div>

                    <div className="border-t pt-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">Upload New Hero Video</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Replace the current hero video. Max file size: 50MB. Recommended format: MP4.
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/ogg,video/quicktime"
                            onChange={handleVideoUpload}
                            className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer
                                       file:mr-4 file:py-2.5 file:px-5
                                       file:rounded-l-lg file:border-0
                                       file:text-sm file:font-semibold
                                       file:bg-blue-50 file:text-blue-700
                                       hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isUploading}
                        />
                        {isUploading && (
                            <div className="mt-3 flex items-center text-blue-600">
                                <Icon name="loader" className="w-5 h-5 animate-spin mr-2" /> {/* Assuming 'loader' icon */}
                                <span>Uploading video... Please wait. This might take a moment.</span>
                            </div>
                        )}
                    </div>

                    {showcaseVideoVisible && (
                        <div className="border-t pt-6">
                            <h3 className="text-xl font-semibold text-gray-700 mb-3">Current Hero Video</h3>
                            <div className="bg-gray-200 rounded-lg overflow-hidden aspect-video max-w-2xl mx-auto">
                                <video
                                    key={currentVideoKey} // Force re-render on new video upload
                                    src="/api/showcase/video" // Endpoint to serve the video
                                    controls
                                    className="w-full h-full object-contain"
                                    onError={(e) => {
                                        console.error("Video load error:", e);
                                        toast.error("Could not load current video. It might be missing or corrupted.");
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Product Sections Management (Simplified for brevity - expand as needed) */}
            <div className="grid md:grid-cols-2 gap-8">
                {/* Featured Products Management */}
                <section className="bg-white shadow-xl rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-5 border-b pb-3">Featured Products ({featuredProducts.length})</h2>
                    {isLoadingProducts ? <p className="text-gray-500">Loading products...</p> : (
                        <>
                            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto mb-4 pr-2">
                                {featuredProducts.map(product => (
                                    <li key={product._id} className="py-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate mr-2" title={product.name}>{product.name}</span>
                                        <Button onClick={() => updateProductFlags(product._id, { featured: false })} variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100">Remove</Button>
                                    </li>
                                ))}
                                {featuredProducts.length === 0 && <li className="py-3 text-gray-500">No products currently featured.</li>}
                            </ul>
                            <h3 className="text-lg font-semibold text-gray-600 mt-4 mb-2">Add to Featured</h3>
                            <div className="relative mb-4">
                                <input 
                                    type="text"
                                    placeholder="Search products to feature..."
                                    value={featuredSearchTerm}
                                    onChange={(e) => setFeaturedSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                            </div>
                            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto pr-2">
                                {availableForFeatured.map(product => (
                                    <li key={product._id} className="py-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate mr-2" title={product.name}>{product.name}</span>
                                        <Button onClick={() => updateProductFlags(product._id, { featured: true })} variant="primary" size="sm">Add</Button>
                                    </li>
                                ))}
                                {availableForFeatured.length === 0 && featuredSearchTerm && <li className="py-3 text-gray-500 text-sm">No products match your search.</li>}
                                {availableForFeatured.length === 0 && !featuredSearchTerm && <li className="py-3 text-gray-500 text-sm">All products are already featured or no products available.</li>}
                            </ul>
                        </>
                    )}
                </section>

                {/* Offer Products Management */}
                <section className="bg-white shadow-xl rounded-lg p-6">
                    <h2 className="text-2xl font-semibold text-gray-700 mb-5 border-b pb-3">Offer Products ({offerProducts.length})</h2>
                    {isLoadingProducts ? <p className="text-gray-500">Loading products...</p> : (
                        <>
                            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto mb-4 pr-2">
                                {offerProducts.map(product => (
                                    <li key={product._id} className="py-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate mr-2" title={product.name}>{product.name}</span>
                                        <Button onClick={() => updateProductFlags(product._id, { offer: false })} variant="secondary" size="sm" className="bg-red-50 text-red-600 hover:bg-red-100">Remove</Button>
                                    </li>
                                ))}
                                {offerProducts.length === 0 && <li className="py-3 text-gray-500">No products currently on offer.</li>}
                            </ul>
                             <h3 className="text-lg font-semibold text-gray-600 mt-4 mb-2">Add to Offers</h3>
                            <div className="relative mb-4">
                                <input 
                                    type="text"
                                    placeholder="Search products for offers..."
                                    value={offerSearchTerm}
                                    onChange={(e) => setOfferSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                                />
                                <Icon name="search" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                            </div>
                            <ul className="divide-y divide-gray-200 max-h-80 overflow-y-auto pr-2">
                                {availableForOffers.map(product => (
                                    <li key={product._id} className="py-3 flex items-center justify-between text-sm">
                                        <span className="text-gray-700 truncate mr-2" title={product.name}>{product.name}</span>
                                        <Button onClick={() => updateProductFlags(product._id, { offer: true })} variant="primary" size="sm">Add</Button>
                                    </li>
                                ))}
                                {availableForOffers.length === 0 && offerSearchTerm && <li className="py-3 text-gray-500 text-sm">No products match your search.</li>}
                                {availableForOffers.length === 0 && !offerSearchTerm && <li className="py-3 text-gray-500 text-sm">All products are already on offer or no products available.</li>}
                            </ul>
                        </>
                    )}
                </section>
            </div>

            <div className="text-center mt-10">
                <Button onClick={() => router.push('/')} variant="outline" size="lg">
                    <Icon name="home" className="w-5 h-5 mr-2" /> {/* Assuming 'home' icon */}
                    Back to Homepage
                </Button>
            </div>
        </div>
    );
};

export default HomepageManagement;
