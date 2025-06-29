import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const FavoritesContext = createContext();

export const useFavorites = () => {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
};

export const FavoritesProvider = ({ children }) => {
    const [favorites, setFavorites] = useState([]);
    const [favoritesCount, setFavoritesCount] = useState(0);

    // Load favorites from localStorage on mount
    useEffect(() => {
        const savedFavorites = localStorage.getItem('favorites');
        if (savedFavorites) {
            try {
                const parsedFavorites = JSON.parse(savedFavorites);
                setFavorites(parsedFavorites);
                setFavoritesCount(parsedFavorites.length);
            } catch (error) {
                console.error('Error loading favorites:', error);
                localStorage.removeItem('favorites');
            }
        }
    }, []);

    // Save favorites to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem('favorites', JSON.stringify(favorites));
        setFavoritesCount(favorites.length);
    }, [favorites]);

    const addToFavorites = (product) => {
        const isAlreadyFavorite = favorites.some(fav => fav._id === product._id);
        
        if (isAlreadyFavorite) {
            toast.error('Ce produit est déjà dans vos favoris !');
            return false;
        }

        setFavorites(prev => [...prev, product]);
        toast.success('Ajouté à vos favoris !');
        return true;
    };

    const removeFromFavorites = (productId) => {
        setFavorites(prev => prev.filter(fav => fav._id !== productId));
        toast.success('Retiré de vos favoris !');
    };

    const toggleFavorite = (product) => {
        const isFavorite = favorites.some(fav => fav._id === product._id);
        
        if (isFavorite) {
            removeFromFavorites(product._id);
        } else {
            addToFavorites(product);
        }
    };

    const isFavorite = (productId) => {
        return favorites.some(fav => fav._id === productId);
    };

    const clearFavorites = () => {
        setFavorites([]);
        toast.success('Tous les favoris ont été supprimés !');
    };

    const value = {
        favorites,
        favoritesCount,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        clearFavorites
    };

    return (
        <FavoritesContext.Provider value={value}>
            {children}
        </FavoritesContext.Provider>
    );
}; 