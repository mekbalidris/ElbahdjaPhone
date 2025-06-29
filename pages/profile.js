import React, { useState, useEffect, useRef, Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/router';

// Import your actual UI components
import Icon from '../components/ui/Icon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TextArea from '../components/ui/TextArea';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';

// --- Color Palette (Client Inspired - Tailwind classes) --- 
// You might want to import these from a central place if not already available globally
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


const ProfilePage = () => {
    const { currentUser, isLoading: authLoading } = useAuth();
    const router = useRouter();

    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        phone: '',
        addressStreet: '',
        addressCity: '',
        addressPostalCode: '',
        addressCountry: '',
    });
    const [editMode, setEditMode] = useState(false);
    const [isLoadingProfile, setIsLoadingProfile] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    const [supportSubject, setSupportSubject] = useState('');
    const [supportMessage, setSupportMessage] = useState('');
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [userMessages, setUserMessages] = useState([]);
    const [isLoadingMessages, setIsLoadingMessages] = useState(true);

    // --- Fetch User Profile from MongoDB Backend via API ---
    useEffect(() => {
        if (authLoading) return;

        if (!currentUser) {
            setIsLoadingProfile(false);
            return;
        }

        setIsLoadingProfile(true);
        fetch(`/api/profile?userId=${currentUser.id}`)
            .then(res => {
                if (!res.ok) { 
                    console.error('Error fetching profile:', res.status);
                    toast.error('Failed to load profile data.');
                    if (res.status === 404) {
                        setProfileData(prev => ({ ...prev, email: currentUser.email || '' }));
                    }
                    setIsLoadingProfile(false);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setProfileData(prev => ({
                        ...prev,
                        email: currentUser.email || '',
                        name: data.name || '',
                        phone: data.phone || '',
                        addressStreet: data.addressStreet || '',
                        addressCity: data.addressCity || '',
                        addressPostalCode: data.addressPostalCode || '',
                        addressCountry: data.addressCountry || '',
                    }));
                }
            })
            .catch(error => {
                console.error("Error fetching profile:", error);
                toast.error("Failed to load profile data.");
                setProfileData(prev => ({ ...prev, email: currentUser.email || '' }));
            })
            .finally(() => {
                setIsLoadingProfile(false);
            });
    }, [currentUser, authLoading]);

    // --- Fetch User Messages from MongoDB Backend via API ---
    useEffect(() => {
        if (authLoading) return;

        if (!currentUser) {
            setIsLoadingMessages(false);
            setUserMessages([]);
            return;
        }

        setIsLoadingMessages(true);
        fetch(`/api/support/messages?userId=${currentUser.id}`)
            .then(res => {
                if (!res.ok) { 
                    console.error('Error fetching messages:', res.status);
                    toast.error('Failed to load support messages.');
                    setUserMessages([]);
                    return null;
                }
                return res.json();
            })
            .then(data => {
                if (data) {
                    setUserMessages(data);
                }
            })
            .catch(error => {
                console.error("Error fetching messages:", error);
                toast.error("Failed to load support messages.");
                setUserMessages([]);
            })
            .finally(() => {
                setIsLoadingMessages(false);
            });
    }, [currentUser, authLoading]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("Not authenticated.");
            return;
        }

        setIsSavingProfile(true);
        const { email, ...saveData } = profileData;

        fetch(`/api/profile?userId=${currentUser.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(saveData),
        })
        .then(res => {
            if (!res.ok) { 
                console.error('Error saving profile:', res.status);
                toast.error('Failed to save profile.');
                throw new Error('Failed to save profile');
            }
            return res.json();
        })
        .then(data => {
            toast.success("Profile updated successfully!");
            setEditMode(false);
        })
        .catch(error => {
            console.error("Error saving profile:", error);
            toast.error("Failed to save profile.");
        })
        .finally(() => {
            setIsSavingProfile(false);
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            toast.error("You must be logged in to send a message.");
            return;
        }

        if (!supportSubject.trim() || !supportMessage.trim()) {
            toast.error("Please enter a subject and your message.");
            return;
        }
        setIsSendingMessage(true);

        const messagePayload = {
            userName: profileData.name || "Anonymous User",
            userEmail: currentUser.email || "No email",
            subject: supportSubject.trim(),
            message: supportMessage.trim(),
            status: 'new',
        };

        fetch(`/api/support/messages?userId=${currentUser.id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(messagePayload),
        })
        .then(res => {
            if (!res.ok) {
                console.error('Error sending message:', res.status);
                toast.error('Failed to send message.');
                throw new Error('Failed to send message');
            }
            return res.json();
        })
        .then(data => {
            toast.success("Support message sent successfully!");
            setSupportSubject('');
            setSupportMessage('');
            setUserMessages(prev => [data, ...prev]);
        })
        .catch(error => {
            console.error("Error sending message:", error);
            toast.error("Failed to send message.");
        })
        .finally(() => {
            setIsSendingMessage(false);
        });
    };

    // Function to refetch messages (could be triggered by a button or after sending a message)
    const refetchMessages = () => {
         console.log("Refetching messages...");
         // TODO: Implement logic to refetch messages.
         // This might involve calling the fetch logic inside the useEffect for messages,
         // potentially by toggling a state variable that the effect depends on.
    };

    // Display loading state while fetching profile or messages
    if (authLoading || isLoadingProfile || isLoadingMessages) { 
         return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 font-sans">
                 <LoadingSpinner size="lg" colorClass={brandOrange.text} />
                 <p className="mt-4 text-slate-600">Loading profile and messages...</p>
             </div>
         );
    }

    // Display message if user is not logged in
    if (!currentUser) {
        return (
            <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 font-sans">
                <Icon name="user" className={`w-16 h-16 ${brandPurple.text} mb-4 opacity-70`} />
                <h1 className="text-2xl font-semibold text-slate-700 mb-2">Access Denied</h1>
                <p className="text-slate-500 text-center max-w-md">
                    Please log in to view your profile and support messages.
                </p>
                <Button onClick={() => router.push('/auth')} variant="primary" className="mt-6">Login</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 sm:py-12 px-4 font-sans mt-[2.5rem]">
            <div className="max-w-3xl mx-auto space-y-10">
                {/* Profile Information Section */}
                {/* This section is displayed if the user is logged in based on the check above */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200/80 animate-fadeInUp">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <h2 className={`text-2xl sm:text-3xl font-bold ${brandPurple.text} flex items-center`}>
                            <Icon name="user" className="w-7 h-7 mr-3" /> My Profile
                        </h2>
                        {/* Show edit if not in edit mode AND if user is logged in (redundant with section check, but good practice) */}
                        {!editMode && currentUser && (
                            <Button variant="outline" size="sm" onClick={() => setEditMode(true)} iconLeft="edit">
                                Edit Profile
                            </Button>
                        )}
                    </div>

                    {/* Render form or loading spinner based on isLoadingProfile */}
                    {isLoadingProfile ? <LoadingSpinner /> : (
                        <form onSubmit={handleProfileSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                                {/* Email is disabled as it typically comes from auth */}
                                <Input label="Full Name" name="name" value={profileData.name} onChange={handleInputChange} placeholder="Your full name" disabled={!editMode} error={null}/>
                                <Input label="Email Address" name="email" type="email" value={profileData.email} placeholder="Your email" disabled={true} className="bg-slate-100 cursor-not-allowed" error={null}/>
                                <Input label="Numéro de téléphone (optionnel)" name="phone" type="tel" value={profileData.phone} onChange={handleInputChange} placeholder="ex: 0555 12 34 56" disabled={!editMode} error={null}/>
                                <Input label="Country" name="addressCountry" value={profileData.addressCountry} onChange={handleInputChange} placeholder="Your country" disabled={!editMode} error={null}/>
                                <Input label="Street Address" name="addressStreet" value={profileData.addressStreet} onChange={handleInputChange} placeholder="123 Main St" className="md:col-span-2" disabled={!editMode} error={null}/>
                                <Input label="City" name="addressCity" value={profileData.addressCity} onChange={handleInputChange} placeholder="Your city" disabled={!editMode} error={null}/>
                                <Input label="Postal Code" name="addressPostalCode" value={profileData.addressPostalCode} onChange={handleInputChange} placeholder="Your postal code" disabled={!editMode} error={null}/>
                            </div>
                            {/* Show Save/Cancel buttons only in edit mode and if user is logged in */}
                            {editMode && currentUser && (
                                <div className="mt-8 flex justify-end space-x-3">
                                    {/* TODO: Implement logic to reset form to original fetched data on Cancel */}
                                    <Button variant="ghost" type="button" onClick={() => { setEditMode(false); /* Reset logic here */ }}>Cancel</Button>
                                    <Button type="submit" variant="primary" isLoading={isSavingProfile} disabled={isSavingProfile} iconLeft={<Icon name="save" className="w-4 h-4"/>}>
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </form>
                    )}
                </section>

                {/* Support Center Section */}
                {/* This section is displayed if the user is logged in based on the check above */}
                <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200/80 animate-fadeInUp" style={{animationDelay: '0.2s'}}> 
                    <h2 className={`text-2xl sm:text-3xl font-bold ${brandOrange.text} mb-6 pb-4 border-b border-gray-200 flex items-center`}>
                        <Icon name="mail" className="w-7 h-7 mr-3" /> Contact Support
                    </h2>
                    {/* Show form only if user is logged in (redundant with section check, but good practice) */}
                    {currentUser && (
                        <form onSubmit={handleSendMessage} className="space-y-5">
                            <Input label="Subject" name="supportSubject" value={supportSubject} onChange={(e) => setSupportSubject(e.target.value)} placeholder="What's your query about?" required />
                            <TextArea label="Your Message" name="supportMessage" value={supportMessage} onChange={(e) => setSupportMessage(e.target.value)} placeholder="Describe your issue or question in detail..." rows={5} required />
                            <div className="flex justify-end">
                                <Button type="submit" variant="secondary" isLoading={isSendingMessage} disabled={isSendingMessage} iconLeft={<Icon name="send" className="w-4 h-4"/>}>
                                    Send Message
                                </Button>
                            </div>
                        </form>
                    )}
                </section>

                {/* Message History Section */}
                 {/* This section is displayed if the user is logged in based on the check above */}
                 <section className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-200/80 animate-fadeInUp" style={{animationDelay: '0.4s'}}> 
                    <h2 className={`text-2xl sm:text-3xl font-bold ${brandPurple.text} mb-6 pb-4 border-b border-gray-200 flex items-center`}>
                        <Icon name="messageSquare" className="w-7 h-7 mr-3" /> Your Support Tickets
                    </h2>
                    {/* Show messages or loading spinner based on isLoadingMessages AND if user is logged in */}
                    {isLoadingMessages ? <LoadingSpinner /> : (
                         currentUser && (userMessages.length > 0 ? (
                            <ul className="space-y-4 max-h-96 overflow-y-auto custom-scrollbar pr-2">
                                {userMessages.map(msg => (
                                    // Assuming MongoDB document _id can be used as a key
                                    // Use msg._id if available, fallback to msg.id or index if needed
                                    <li key={msg._id || msg.id || msg.subject + msg.timestamp} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-semibold text-slate-700 text-md">{msg.subject}</h3>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                                                ${msg.status === 'new' ? 'bg-blue-100 text-blue-700' : 
                                                  msg.status === 'read' ? 'bg-yellow-100 text-yellow-700' : 
                                                  msg.status === 'replied' ? 'bg-green-100 text-green-700' : 
                                                  'bg-gray-100 text-gray-700'}`}>
                                                {msg.status ? msg.status.charAt(0).toUpperCase() + msg.status.slice(1) : 'Unknown'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-2 line-clamp-2">{msg.message}</p>
                                        {/* TODO: Adjust timestamp display based on your MongoDB data structure.
                                            MongoDB timestamps are typically Date objects or ISO strings. */}
                                        <p className="text-xs text-slate-400">
                                            Sent: {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'N/A'} 
                                        </p>
                                        {msg.reply && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-sm font-medium text-blue-800">Admin Reply:</p>
                                                <p className="mt-1 text-sm text-blue-700">{msg.reply}</p>
                                                {msg.adminName && msg.repliedAt && (
                                                    <p className="mt-2 text-xs text-blue-600 opacity-90">
                                                        Replied by {msg.adminName} on {new Date(msg.repliedAt).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        ) : ( // No messages found
                            <p className="text-slate-500">You haven&apos;t sent any support messages yet.</p>
                        ))
                    )}
                     {/* Optionally add a refetch button for messages if user is logged in */}
                     {currentUser && !isLoadingMessages && <Button onClick={refetchMessages} variant="ghost" size="sm" className="mt-4">Refresh Messages</Button>}

                </section>


            </div>
            <style jsx global>{`
                html { scroll-behavior: smooth; } // Kept from provided code
                body { background-color: #f1f5f9; /* slate-100 for overall page consistency */ } // Kept from provided code
                .font-sans {
                     font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
                } // Kept from provided code
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); } // Kept from provided code
                    to { opacity: 1; transform: translateY(0); } // Kept from provided code
                }
                .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; opacity: 0; } // Kept from provided code

                .custom-scrollbar::-webkit-scrollbar { width: 6px; } // Kept from provided code
                .custom-scrollbar::-webkit-scrollbar-track { background: #e2e8f0; border-radius: 10px; } /* slate-200 */ // Kept from provided code
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; } /* slate-300 */ // Kept from provided code
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; } /* slate-400 */ // Kept from provided code
            `}</style>
        </div>
    );
};

export default ProfilePage; 