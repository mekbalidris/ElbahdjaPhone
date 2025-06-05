import React from 'react';
import Icon from './Icon';

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, iconLeft, iconRight }) => {
    const baseStyle = "font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed";
    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-lg",
        xl: "px-8 py-4 text-lg rounded-lg",
    };
    const variantStyles = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 focus:ring-gray-400",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        outline: "bg-transparent border border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
        ghost: "bg-transparent hover:bg-gray-100 text-blue-600 focus:ring-blue-500",
    };
    
    // Define brandPurple here or import if needed
    const brandPurpleText = 'text-purple-600'; // Assuming this is the desired purple color class

    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} disabled={disabled}>
            {iconLeft && <Icon name={iconLeft} className={`mr-2 ${brandPurpleText} ${size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-6 h-6' : 'w-5 h-5'}`} />}
            {children}
            {iconRight && <Icon name={iconRight} className={`ml-2 ${brandPurpleText} ${size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-6 h-6' : 'w-5 h-5'}`} />}
        </button>
    );
};

export default Button; 