import React from 'react';
import Icon from './Icon';

const Input = React.forwardRef(({ type = 'text', placeholder, value, onChange, name, label, required = false, className = '', error, iconLeft }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <div className="relative">
            {iconLeft && <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Icon name={iconLeft} className="text-gray-400 w-5 h-5" /></div>}
            <input
                ref={ref}
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${iconLeft ? 'pl-10' : ''} ${className}`}
            />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));

export default Input; 