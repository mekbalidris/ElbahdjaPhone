import React from 'react';

const Select = React.forwardRef(({ options, value, onChange, name, label, required = false, className = '', error }, ref) => (
    <div className="mb-4 w-full">
        {label && <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
        <select
            ref={ref}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            className={`w-full px-3 py-2 border ${error ? 'border-red-500' : 'border-gray-300'} bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 ${error ? 'focus:ring-red-500' : 'focus:ring-blue-500'} focus:border-transparent ${className}`}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
            ))}
        </select>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
));

Select.displayName = 'Select';

export default Select; 