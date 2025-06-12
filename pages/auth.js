import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

// --- Color Palette ---
const brandOrange = { text: 'text-amber-500', bg: 'bg-amber-500', hoverBg: 'hover:bg-amber-600', ring: 'focus:ring-amber-500' };
const brandPurple = { text: 'text-purple-600', hoverText: 'hover:text-purple-700' };

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login, register } = useAuth();

    const validateForm = () => {
        const newErrors = {};
        if (!isLogin && !name.trim()) newErrors.name = "Full name is required";
        if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
        if (!password) newErrors.password = "Password is required";
        else if (password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (!isLogin && password !== confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error("Please correct the errors in the form.");
            return;
        }
        setLoading(true);
        const loadingToastId = toast.loading(isLogin ? 'Signing in...' : 'Creating account...');

        if (isLogin) {
            try {
                await login({ email, password });
                toast.dismiss(loadingToastId);
                toast.success("Logged in successfully!");
                router.push(router.query.redirect || '/');
            } catch (err) {
                toast.dismiss(loadingToastId);
                console.error('Login Error:', err);
                toast.error(err.message || "Invalid email or password.");
            }
        } else {
            try {
                await register({ name, email, password });
                toast.dismiss(loadingToastId);
                toast.success("Account created successfully! Please log in.");
                setIsLogin(true);
                setPassword('');
                setConfirmPassword('');
            } catch (err) {
                toast.dismiss(loadingToastId);
                console.error('Registration Error:', err);
                toast.error(err.message || "Failed to create account.");
            }
        }
        setLoading(false);
    };
    
    const toggleView = () => {
        setIsLogin(!isLogin);
        setErrors({});
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 mt-[2rem]">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="Logo" className="h-12 w-auto" onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/150x48/FFA500/FFFFFF?text=Logo&font=roboto';}}/>
                </div>
                <h2 className="mt-2 text-center text-lg font-semibold text-slate-700">
                    {isLogin ? 'Welcome Back!' : 'Create your Account'}
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                    <button onClick={toggleView} className={`font-medium ${brandOrange.text} hover:text-orange-600 hover:underline ml-1 focus:outline-none`}>
                        {isLogin ? 'Sign up' : 'Sign in'}
                    </button>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-200/80">
                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {!isLogin && (
                            <Input 
                                label="Full Name" 
                                name="name" 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                error={errors.name} 
                                required 
                                iconLeft="user" 
                                placeholder="e.g., Jane Doe"
                            />
                        )}
                        <Input 
                            label="Email Address" 
                            name="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            error={errors.email} 
                            required 
                            iconLeft="mail" 
                            placeholder="you@example.com"
                        />
                        <Input 
                            label="Password" 
                            name="password" 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            error={errors.password} 
                            required 
                            iconLeft="lock" 
                            placeholder="••••••••" 
                        />
                        {!isLogin && (
                            <Input 
                                label="Confirm Password" 
                                name="confirmPassword" 
                                type="password" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                error={errors.confirmPassword} 
                                required 
                                iconLeft="lock" 
                                placeholder="••••••••"
                            />
                        )}

                        {isLogin && (
                            <div className="flex items-center justify-end">
                                <div className="text-sm">
                                    <a href="#" className={`font-medium ${brandPurple.text} ${brandPurple.hoverText} hover:underline`}>
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <Button 
                                type="submit" 
                                size="lg" 
                                className="w-full" 
                                isLoading={loading} 
                                disabled={loading}
                            >
                                {isLogin ? 'Sign In' : 'Create Account'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthPage; 