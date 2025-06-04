import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for user data in localStorage on initial load
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
            } catch (e) {
                console.error("Error parsing stored user:", e);
                localStorage.removeItem('currentUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const res = await fetch(`/api/users?email=${encodeURIComponent(credentials.email)}&password=${encodeURIComponent(credentials.password)}`);
            
            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Login failed. Please check your credentials.');
            }
            
            setCurrentUser(responseData);
            localStorage.setItem('currentUser', JSON.stringify(responseData));
            return responseData;
        } catch (error) {
            console.error('Login error in AuthContext:', error);
            throw error;
        }
    };

    const register = async (userData) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Registration failed. Please try again.');
            }
            
            return responseData;
        } catch (error) {
            console.error('Registration error in AuthContext:', error);
            throw error;
        }
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        toast.success("Logged out successfully.");
        router.push('/');
    };

    const value = {
        currentUser,
        isLoading,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
} 