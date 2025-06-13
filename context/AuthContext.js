import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Check for user data in cookies on initial load
        const storedUser = Cookies.get('currentUser');
        if (storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setCurrentUser(parsedUser);
            } catch (e) {
                console.error("Error parsing stored user:", e);
                Cookies.remove('currentUser');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'login',
                    email: credentials.email,
                    password: credentials.password
                })
            });
            
            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Login failed. Please check your credentials.');
            }
            
            // Ensure the user ID is properly set
            const userWithId = {
                ...responseData,
                id: responseData._id // Ensure the ID is properly set
            };
            
            setCurrentUser(userWithId);
            // Store user data in cookie with 7 days expiration
            Cookies.set('currentUser', JSON.stringify(userWithId), { expires: 7 });
            return userWithId;
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
                body: JSON.stringify({
                    action: 'register',
                    ...userData
                }),
            });
            const responseData = await res.json();

            if (!res.ok) {
                throw new Error(responseData.error || 'Registration failed. Please try again.');
            }
            
            // Store the user data including ID in the cookie
            const userWithId = {
                ...responseData,
                id: responseData._id // Ensure the ID is properly set
            };
            Cookies.set('currentUser', JSON.stringify(userWithId), { expires: 7 });
            setCurrentUser(userWithId);
            
            return responseData;
        } catch (error) {
            console.error('Registration error in AuthContext:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            setCurrentUser(null);
            Cookies.remove('currentUser');
            toast.success("Logged out successfully.");
            router.push('/');
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
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

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}; 