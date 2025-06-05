import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/router';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icon';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// --- Color Palette (Client Inspired - Tailwind classes) ---
const brandOrange = {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
    hoverBg: 'hover:bg-amber-600',
    ring: 'focus:ring-amber-500',
};

const brandPurple = {
    bg: 'bg-purple-600',
    text: 'text-purple-600',
    border: 'border-purple-600',
    hoverBg: 'hover:bg-purple-700',
    ring: 'focus:ring-purple-500',
};

const SupportMessagesPage = () => {
    const { currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSendingReply, setIsSendingReply] = useState(false);

    // Log currentUser after auth is loaded and user is available
    useEffect(() => {
        if (!authLoading && currentUser) {
            console.log('CurrentUser state after auth load:', currentUser);
        }
    }, [authLoading, currentUser]);

    // Check for admin role and redirect if not authorized
    useEffect(() => {
        if (!authLoading) {
            if (!currentUser) {
                toast.error('Please log in to access the dashboard');
                router.replace('/auth');
            } else if (currentUser.role !== 'seller') {
                toast.error('Access denied. Only admins can access this page');
                router.replace('/');
            }
        }
    }, [currentUser, authLoading, router]);

    // Fetch all support messages
    useEffect(() => {
        if (!currentUser || currentUser.role !== 'seller') return;

        console.log('CurrentUser object in SupportMessagesPage:', currentUser);

        const fetchMessages = async () => {
            setIsLoading(true);
            try {
                const res = await fetch('/api/admin/support-messages');
                if (!res.ok) throw new Error('Failed to fetch messages');
                const data = await res.json();
                setMessages(data);
            } catch (error) {
                console.error('Error fetching messages:', error);
                toast.error('Failed to load support messages');
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
    }, [currentUser]);

    const handleStatusChange = async (messageId, newStatus) => {
        try {
            const res = await fetch(`/api/admin/support-messages/${messageId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update message status');

            setMessages(prev => prev.map(msg => 
                msg._id === messageId ? { ...msg, status: newStatus } : msg
            ));
            toast.success('Message status updated');
        } catch (error) {
            console.error('Error updating message status:', error);
            toast.error('Failed to update message status');
        }
    };

    const handleReply = async (e) => {
        e.preventDefault();
        if (!selectedMessage || !replyText.trim()) return;

        setIsSendingReply(true);
        try {
            const res = await fetch(`/api/admin/support-messages/${selectedMessage._id}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    reply: replyText.trim(),
                    adminId: currentUser._id,
                    adminName: currentUser.name
                }),
            });

            if (!res.ok) throw new Error('Failed to send reply');

            const updatedMessage = await res.json();
            setMessages(prev => prev.map(msg => 
                msg._id === selectedMessage._id ? updatedMessage : msg
            ));
            setReplyText('');
            setSelectedMessage(null);
            toast.success('Reply sent successfully');
        } catch (error) {
            console.error('Error sending reply:', error);
            toast.error('Failed to send reply');
        } finally {
            setIsSendingReply(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <LoadingSpinner size="lg" colorClass={brandOrange.text} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="md:flex md:items-center md:justify-between mb-8">
                    <div className="flex-1 min-w-0">
                        <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                            Support Messages
                        </h2>
                    </div>
                </div>

                <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
                    {messages.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                            No support messages found
                        </div>
                    ) : (
                        messages.map(message => (
                            <div key={message._id} className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3">
                                            <h3 className="text-lg font-medium text-gray-900">
                                                {message.subject}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full
                                                ${message.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                                  message.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                  message.status === 'replied' ? 'bg-green-100 text-green-800' :
                                                  'bg-gray-100 text-gray-800'}`}>
                                                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">
                                            From: {message.userName} ({message.userEmail})
                                        </p>
                                        <p className="mt-2 text-sm text-gray-700">
                                            {message.message}
                                        </p>
                                        {message.reply && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <p className="text-sm font-medium text-gray-900">Admin Reply:</p>
                                                <p className="mt-1 text-sm text-gray-700">{message.reply}</p>
                                                <p className="mt-2 text-xs text-gray-500">
                                                    Replied by {message.adminName} on {new Date(message.repliedAt).toLocaleString()}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                                        {message.status !== 'replied' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setSelectedMessage(message)}
                                            >
                                                Reply
                                            </Button>
                                        )}
                                        <select
                                            value={message.status}
                                            onChange={(e) => handleStatusChange(message._id, e.target.value)}
                                            className={`text-sm rounded-md border-gray-300 shadow-sm focus:border-${brandPurple.border} focus:ring focus:ring-${brandPurple.ring} focus:ring-opacity-50`}
                                        >
                                            <option value="new">New</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="replied">Replied</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Reply Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">
                            Reply to: {selectedMessage.subject}
                        </h3>
                        <form onSubmit={handleReply}>
                            <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                rows={4}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-500 focus:ring-opacity-50"
                                placeholder="Type your reply..."
                                required
                            />
                            <div className="mt-4 flex justify-end space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedMessage(null);
                                        setReplyText('');
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    isLoading={isSendingReply}
                                    disabled={isSendingReply}
                                >
                                    Send Reply
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportMessagesPage; 