import React from 'react';
import Icon from './Icon';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-[100] flex items-center justify-center">
            <div className="w-full h-full flex flex-col bg-white rounded-none shadow-2xl overflow-auto animate-modalShow">
                <div className="flex justify-between items-center px-8 py-6 border-b border-gray-200 bg-white sticky top-0 z-10">
                    <h3 className="text-2xl font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                        <Icon name="x" className="w-7 h-7" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto px-8 py-6">{children}</div>
            </div>
        </div>
    );
};

export default Modal; 