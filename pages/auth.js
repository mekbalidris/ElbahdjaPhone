import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Icon from '../components/ui/Icon';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { login } = useAuth();

    const validateForm = () => {
        const newErrors = {};
        if (!email) newErrors.email = "Email is required";
        if (!password) newErrors.password = "Password is required";
        if (!isLogin && !name) newErrors.name = "Name is required";
        if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Please enter a valid email";
        if (password && password.length < 6) newErrors.password = "Password must be at least 6 characters";
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
        if (isLogin) {
            try {
                await login({ email, password });
                toast.success("Logged in successfully!");
                router.push('/'); // Redirect to home page
            } catch (err) {
                console.error('Login Error:', err);
                toast.error(err.message || "Invalid email or password.");
            }
        } else {
            // Register: create user in DB
            try {
                const res = await fetch('/api/users', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password, name }),
                });
                const data = await res.json();
                if (res.ok) {
                    toast.success("Account created successfully! Please log in.");
                    setIsLogin(true);
                    setPassword('');
                } else {
                    toast.error(data.error || "Failed to create account.");
                }
            } catch (err) {
                console.error('Registration Error:', err);
                toast.error("Server error during registration.");
            }
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        {isLogin ? 'Sign in to your account' : 'Create a new account'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setErrors({});
                            }}
                            className="font-medium text-blue-600 hover:text-blue-500"
                        >
                            {isLogin ? 'Sign up' : 'Sign in'}
                        </button>
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        {!isLogin && (
                            <Input
                                label="Full Name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                error={errors.name}
                                required
                            />
                        )}
                        <Input
                            label="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            error={errors.email}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={errors.password}
                            required
                        />
                    </div>
                    <div>
                        <Button
                            type="submit"
                            variant="primary"
                            className="w-full"
                            iconLeft={isLogin ? 'login' : 'plus'}
                            disabled={loading}
                        >
                            {loading ? (isLogin ? 'Signing in...' : 'Creating...') : (isLogin ? 'Sign in' : 'Create Account')}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AuthPage; 