import React from 'react';
import Icon from './Icon';

const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', type = 'button', disabled = false, iconLeft, iconRight, iconSize }) => {
    const baseStyle = "font-semibold focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed";
    const sizeStyles = {
        sm: "px-3 py-1.5 text-xs rounded-md",
        md: "px-4 py-2 text-sm rounded-lg",
        lg: "px-6 py-3 text-base rounded-lg",
        xl: "px-8 py-4 text-lg rounded-lg",
    };
    const variantStyles = {
        primary: "bg-primary-500 hover:bg-primary-600 text-white focus:ring-primary-500",
        secondary: "bg-neutral-200 hover:bg-neutral-300 text-neutral-800 focus:ring-neutral-400",
        danger: "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500",
        outline: "bg-transparent border border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500",
        ghost: "bg-transparent hover:bg-neutral-100 text-primary-500 focus:ring-primary-500",
    };
    
    const getIconSize = () => {
        if (iconSize) return iconSize;
        return size === 'sm' ? 'w-4 h-4' : size === 'xl' ? 'w-6 h-6' : 'w-5 h-5';
    };

    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`} disabled={disabled}>
            {iconLeft && <Icon name={iconLeft} className={`mr-2 ${getIconSize()}`} />}
            {children}
            {iconRight && <Icon name={iconRight} className={`ml-2 ${getIconSize()}`} />}
        </button>
    );
};

export default Button; 