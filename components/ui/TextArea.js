import React from 'react';

const TextArea = React.forwardRef(({ placeholder, value, onChange, name, label, required = false, rows = 3, className = '', error }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <textarea
            ref={ref}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            rows={rows}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${className}`}
        />
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));

TextArea.displayName = 'TextArea';

export default TextArea; 