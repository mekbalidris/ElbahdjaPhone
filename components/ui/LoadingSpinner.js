import React from 'react';

const LoadingSpinner = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-4',
        lg: 'w-16 h-16 border-4',
    };
    return (
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-red-600 border-t-transparent`}></div>
    );
};

export default LoadingSpinner; 