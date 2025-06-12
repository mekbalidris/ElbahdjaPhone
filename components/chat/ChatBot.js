import React, { useState, useEffect, useRef, Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { MessageSquare, X, Send, Info } from 'lucide-react';
import { Transition } from '@headlessui/react';

const CATEGORIES = {
    en: ['Phones', 'Laptops', 'Accessories', 'Watches'],
    fr: ['Téléphones', 'Ordinateurs portables', 'Accessoires', 'Montres'],
    ar: ['هواتف', 'حواسيب محمولة', 'ملحقات', 'ساعات']
};

const BRANDS = {
    phones: {
        en: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'OnePlus', 'Google'],
        fr: ['Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Oppo', 'Vivo', 'OnePlus', 'Google'],
        ar: ['آبل', 'سامسونج', 'شاومي', 'هواوي', 'أوبو', 'فيفو', 'ون بلس', 'جوجل']
    },
    laptops: {
        en: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer'],
        fr: ['Apple', 'Dell', 'HP', 'Lenovo', 'ASUS', 'Acer', 'MSI', 'Razer'],
        ar: ['آبل', 'ديل', 'إتش بي', 'لينوفو', 'آسوس', 'إيسر', 'إم إس آي', 'رازر']
    },
    watches: {
        en: ['Apple', 'Samsung'],
        fr: ['Apple', 'Samsung'],
        ar: ['آبل', 'سامسونج']
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
        welcome: "Bienvenue dans notre boutique en ligne ! Comment puis-je vous aider aujourd'hui ?",
        categories: "Nous proposons des produits dans les catégories suivantes :",
        brands: "Nous proposons des produits de ces marques :",
        shipping: "Nous proposons une livraison rapide dans les 58 Wilayas d'Algérie.",
        warranty: "Tous les produits sont garantis 12 mois officiellement.",
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
    const [language, setLanguage] = useState('en');

    // Show welcome toast when component mounts
    useEffect(() => {
        const welcomeMessages = {
            en: "Need help? Click the chat icon!",
            fr: "Besoin d'aide ? Cliquez sur l'icône de chat !",
            ar: "تحتاج إلى مساعدة؟ انقر على أيقونة الدردشة!"
        };

        // Detect browser language
        const browserLang = navigator.language.split('-')[0];
        const detectedLang = browserLang === 'fr' || browserLang === 'ar' ? browserLang : 'en';
        
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
            "👋 Welcome to El Bahdja Assistant!",
            "I can help you with:",
            "• Product information and prices",
            "• Available categories and brands",
            "• Shipping and delivery details",
            "• Warranty information",
            "• Payment methods",
            "Feel free to ask me anything about our store!"
        ],
        fr: [
            "👋 Bienvenue chez El Bahdja Assistant !",
            "Je peux vous aider avec :",
            "• Informations et prix des produits",
            "• Catégories et marques disponibles",
            "• Détails de livraison",
            "• Informations sur la garantie",
            "• Méthodes de paiement",
            "N'hésitez pas à me poser des questions sur notre magasin !"
        ],
        ar: [
            "👋 مرحباً بك في مساعد البهجة!",
            "يمكنني مساعدتك في:",
            "• معلومات وأسعار المنتجات",
            "• الفئات والعلامات التجارية المتاحة",
            "• تفاصيل الشحن والتوصيل",
            "• معلومات الضمان",
            "• طرق الدفع",
            "لا تتردد في طرح أي سؤال عن متجرنا!"
        ]
    };

    return (
        <div className="fixed bottom-5 right-5 z-50 font-sans">
            {/* Chat Bubble Icon */}
            <Transition
                show={!isOpen}
                as={Fragment}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-amber-500 hover:text-amber-600 transition-colors"
                    aria-label="Open chat"
                >
                    <MessageSquare className="w-8 h-8" />
                </button>
            </Transition>

            {/* Chat Window */}
            <Transition
                show={isOpen}
                as={Fragment}
                enter="transition ease-out duration-300"
                enterFrom="opacity-0 scale-95 translate-y-4"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-200"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-4"
            >
                <div className="bg-white rounded-2xl shadow-2xl w-96 h-[550px] flex flex-col border border-gray-200/80 origin-bottom-right">
                    <header className="bg-purple-600 text-white p-4 rounded-t-2xl flex justify-between items-center flex-shrink-0">
                        <h3 className="font-bold text-lg">El Bahdja Assistant</h3>
                        <button onClick={() => setIsOpen(false)} className="p-1 rounded-full hover:bg-white/20 transition-colors" aria-label="Close chat">
                            <X className="w-5 h-5" />
                        </button>
                    </header>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {showHelper && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                        <Info className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div className="flex-1">
                                        {helperMessages[language].map((line, index) => (
                                            <p key={index} className={`text-sm ${index === 0 ? 'font-semibold text-blue-800' : 'text-blue-700'}`}>
                                                {line}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                        {messages.map((message, index) => (
                            <div key={index} className={`flex items-end gap-2 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                {message.role === 'assistant' && <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-5 h-5 text-purple-600"/></div>}
                                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${message.role === 'user' ? 'bg-amber-500 text-white rounded-br-none' : 'bg-gray-100 text-slate-800 rounded-bl-none'}`}>
                                    {message.content.split('\n').map((line, i) => (
                                        <p key={i} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                                    ))}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-end gap-2 justify-start">
                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0"><MessageSquare className="w-5 h-5 text-purple-600"/></div>
                                <div className="bg-gray-100 rounded-2xl p-3 text-slate-800 rounded-bl-none">
                                    <div className="flex space-x-1">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 border-t bg-white rounded-b-2xl flex-shrink-0">
                        <div className="flex space-x-2">
                            <input 
                                type="text" 
                                value={input} 
                                onChange={(e) => setInput(e.target.value)} 
                                placeholder="Ask a question..." 
                                className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500" 
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading} 
                                className="bg-amber-500 text-white px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </form>
                </div>
            </Transition>
        </div>
    );
};

export default ChatBot; 