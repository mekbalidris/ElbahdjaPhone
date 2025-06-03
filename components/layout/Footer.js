import React from 'react';

const Footer = () => (
    <footer className="bg-gray-800 text-white py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-lg font-semibold mb-2">PhoneVerse</p>
            <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} PhoneVerse Inc. All rights reserved.</p>
            <p className="text-xs text-gray-500 mt-1">Your one-stop shop for the latest phones and accessories.</p>
            <div className="mt-4 flex justify-center space-x-4">
                {/* Add social media icons or links here if desired */}
            </div>
        </div>
    </footer>
);

export default Footer; 