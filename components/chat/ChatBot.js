import React, { useState, useEffect, useRef, Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, X, Send, Info } from 'lucide-react';
import { Transition } from '@headlessui/react';

const CATEGORIES = {
    fr: [
        "📱 Smartphones",
        "💻 Ordinateurs portables", 
        "🎧 Accessoires",
        "⌚ Montres connectées"
    ],
    ar: [
        "📱 الهواتف الذكية",
        "💻 أجهزة الكمبيوتر المحمولة",
        "🎧 الملحقات",
        "⌚ الساعات الذكية"
    ],
    en: [
        "📱 Smartphones",
        "💻 Laptops",
        "🎧 Accessories", 
        "⌚ Smartwatches"
    ]
};

const BRANDS = {
    fr: {
        "📱 Smartphones": ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Vivo", "OnePlus", "Google", "Autres"],
        "💻 Ordinateurs portables": ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Razer", "Autres"],
        "🎧 Accessoires": ["Apple", "Samsung", "Sony", "JBL", "Logitech", "Anker", "Belkin", "Autres"],
        "⌚ Montres connectées": ["Apple", "Samsung", "Autres"]
    },
    ar: {
        "📱 الهواتف الذكية": ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Vivo", "OnePlus", "Google", "أخرى"],
        "💻 أجهزة الكمبيوتر المحمولة": ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Razer", "أخرى"],
        "🎧 الملحقات": ["Apple", "Samsung", "Sony", "JBL", "Logitech", "Anker", "Belkin", "أخرى"],
        "⌚ الساعات الذكية": ["Apple", "Samsung", "أخرى"]
    },
    en: {
        "📱 Smartphones": ["Apple", "Samsung", "Xiaomi", "Huawei", "Oppo", "Vivo", "OnePlus", "Google", "Other"],
        "💻 Laptops": ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Acer", "MSI", "Razer", "Other"],
        "🎧 Accessories": ["Apple", "Samsung", "Sony", "JBL", "Logitech", "Anker", "Belkin", "Other"],
        "⌚ Smartwatches": ["Apple", "Samsung", "Other"]
    }
};

const WEBSITE_INFO = {
    en: {
        welcome: "Welcome to our e-commerce store! How can I help you today?",
        categories: "We offer products in the following categories:",
        brands: "We carry products from these brands:",
        shipping: "We offer fast delivery to all 58 Wilayas in Algeria.",
        warranty: "All products come with a 12-month official warranty.",
        payment: "We accept various payment methods including cash on delivery.",
        help: "You can ask me about our products, categories, brands, shipping, or warranty information."
    },
    fr: {
        welcome: "Bienvenue chez Elbahdja Phone ! Comment puis-je vous aider aujourd'hui ?",
        categories: "Nous proposons des produits dans les catégories suivantes :",
        brands: "Nous proposons des produits de ces marques :",
        shipping: "Nous proposons une livraison rapide dans les 58 Wilayas d'Algérie.",
        warranty: "Tous nos produits sont garantis officiellement.",
        payment: "Nous acceptons différents modes de paiement, y compris le paiement à la livraison.",
        help: "Vous pouvez me poser des questions sur nos produits, catégories, marques, livraison ou garantie."
    },
    ar: {
        welcome: "مرحباً بك في متجرنا الإلكتروني! كيف يمكنني مساعدتك اليوم؟",
        categories: "نقدم منتجات في الفئات التالية:",
        brands: "نقدم منتجات من هذه العلامات التجارية:",
        shipping: "نقدم توصيل سريع إلى جميع الولايات الـ 58 في الجزائر.",
        warranty: "جميع المنتجات تأتي مع ضمان رسمي لمدة 12 شهراً.",
        payment: "نقبل طرق دفع متنوعة بما في ذلك الدفع عند الاستلام.",
        help: "يمكنك أن تسألني عن منتجاتنا، الفئات، العلامات التجارية، الشحن، أو معلومات الضمان."
    }
};

const ChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showHelper, setShowHelper] = useState(true);
    const messagesEndRef = useRef(null);
    const [language, setLanguage] = useState('fr'); // Default to French

    // Show welcome toast when component mounts
    useEffect(() => {
        const welcomeMessages = {
            en: "Need help? Click the chat icon!",
            fr: "Besoin d'aide ? Cliquez sur l'icône de chat !",
            ar: "تحتاج إلى مساعدة؟ انقر على أيقونة الدردشة!"
        };

        // Default to French
        const detectedLang = 'fr';
        
        // Wait for 2 seconds after component mount to show the toast
        const timer = setTimeout(() => {
            toast.custom(
                (t) => (
                    <div
                        className={`${
                            t.visible ? 'animate-enter' : 'animate-leave'
                        } fixed bottom-5 right-16 bg-white text-gray-800 shadow-lg rounded-full pointer-events-auto flex items-center px-4 py-2`}
                        style={{
                            animation: 'slideIn 0.5s ease-out',
                        }}
                    >
                        <p className="text-sm whitespace-nowrap">
                            {welcomeMessages[detectedLang]}
                        </p>
                    </div>
                ),
                {
                    duration: 5000,
                    position: 'bottom-right',
                }
            );
        }, 2000);

        return () => clearTimeout(timer);
    }, []); // Empty dependency array means this runs once when component mounts

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if(isOpen && messages.length === 0) {
            // Add initial welcome message when chat opens
            const welcomeMessages = {
                en: "Welcome! How can I help you with our products today?",
                fr: "Bienvenue ! Comment puis-je vous aider avec nos produits aujourd'hui ?",
                ar: "مرحبا بك! كيف يمكنني مساعدتك بخصوص منتجاتنا اليوم؟"
            };
            setMessages([{ role: 'assistant', content: welcomeMessages[language] }]);
        }
        scrollToBottom();
    }, [messages, isOpen, language]);
    
    // Simple language detection
    const detectLanguage = (text) => {
        if (/[\u0600-\u06FF]/.test(text)) return 'ar';
        const frenchWords = ['bonjour', 'produit', 'prix', 'livraison'];
        if (frenchWords.some(word => text.toLowerCase().includes(word))) return 'fr';
        return 'en';
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        const detectedLang = detectLanguage(userMessage);
        setLanguage(detectedLang);

        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setIsLoading(true);
        setShowHelper(false);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMessage, language: detectedLang }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to get response.');
            }

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.message);
            setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but there was an error connecting to the service.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const helperMessages = {
        en: [
            "👋 Welcome to Arena Fashion Assistant!",
            "I can help you with:",
            "• Product information and prices",
            "• Available clothing categories and brands",
            "• Shipping and delivery details",
            "• Size and color options",
            "• Payment methods",
            "Feel free to ask me anything about our clothing store!"
        ],
        fr: [
            "👋 Bienvenue chez l'Assistant Elbahdja Phone !",
            "Je peux vous aider avec :",
            "• Informations et prix des produits",
            "• Catégories de téléphones et technologies",
            "• Détails de livraison",
            "• Options de stockage et couleur",
            "• Méthodes de paiement",
            "N'hésitez pas à me poser des questions sur notre boutique de téléphones !"
        ],
        ar: [
            "�� مرحباً بك في مساعد أرينا فاشن!",
            "يمكنني مساعدتك في:",
            "• معلومات وأسعار المنتجات",
            "• فئات الملابس والعلامات التجارية المتاحة",
            "• تفاصيل الشحن والتوصيل",
            "• خيارات المقاسات والألوان",
            "• طرق الدفع",
            "لا تتردد في طرح أي سؤال عن متجر الملابس!"
        ]
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white w-12 h-12 p-0 rounded-full shadow-lg hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
                aria-label="Open chat"
            >
                <MessageSquare size={20} />
            </button>

            {/* Chat Modal */}
            <Transition show={isOpen} as={Fragment}>
                <div className="fixed inset-0 z-50 pointer-events-none">
                    {/* Only allow pointer events on the chat window and overlay */}
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity pointer-events-auto" onClick={() => setIsOpen(false)} />
                    </Transition.Child>

                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        enterTo="opacity-100 translate-y-0 sm:scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                        leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                    >
                        <div className="fixed bottom-6 right-6 w-[95vw] max-w-xs sm:max-w-sm md:max-w-md bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all pointer-events-auto flex flex-col" style={{height: '450px'}}>
                            {/* Header */}
                            <div className="bg-gray-900 text-white px-4 py-3 flex justify-between items-center">
                                <h3 className="text-base font-semibold">Assistant Elbahdja Phone</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-300 hover:text-white transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-3 bg-gray-50">
                                {showHelper && (
                                    <div className="mb-4 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex items-center mb-2">
                                            <Info size={16} className="text-gray-600 mr-2" />
                                            <span className="text-sm font-medium text-gray-700">Comment puis-je vous aider ?</span>
                                        </div>
                                        <div className="text-sm text-gray-600 space-y-1">
                                            {helperMessages[language].map((message, index) => (
                                                <p key={index} className={index === 0 ? "font-semibold" : ""}>
                                                    {message}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                message.role === 'user'
                                                    ? 'bg-gray-900 text-white'
                                                    : 'bg-white text-gray-800 border border-gray-200'
                                            }`}
                                        >
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                    </div>
                                ))}

                                {isLoading && (
                                    <div className="flex justify-start mb-4">
                                        <div className="bg-white text-gray-800 border border-gray-200 px-4 py-2 rounded-lg">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input */}
                            <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-gray-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        placeholder="Tapez votre message..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input.trim() || isLoading}
                                        className="px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <Send size={15} />
                                    </button>
                                </div>
                            </form>
                        </div>
                    </Transition.Child>
                </div>
            </Transition>
        </>
    );
};

export default ChatBot; 