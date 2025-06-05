import React from 'react';
import {
    Smartphone,
    Headphones,
    Home,
    ShoppingBag,
    UserCircle,
    LogOut,
    LogIn,
    PlusCircle,
    Trash2,
    Edit3,
    Package,
    DollarSign,
    ImageIcon,
    List,
    Search,
    Filter,
    XCircle,
    ChevronDown,
    ChevronUp,
    Menu,
    X,
    MinusCircle,
    Mail,
    Phone,
    MapPin,
    Lock,
    Star,
    User,
    Facebook,
    Twitter,
    Instagram,
    Linkedin,
    Youtube,
    ShoppingCart,
    LayoutGrid,
    Laptop,
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    ArrowRight,
    MessageSquare
} from 'lucide-react';

const Icon = ({ name, className, ...props }) => {
    console.log('Icon component received name prop:', name, typeof name);
    if (typeof name !== 'string') {
        console.warn('Icon component received a non-string name prop:', name);
        return null;
    }

    const icons = {
        smartphone: Smartphone,
        headphones: Headphones,
        home: Home,
        shoppingBag: ShoppingBag,
        user: User,
        logout: LogOut,
        login: LogIn,
        plus: PlusCircle,
        minus: MinusCircle,
        trash: Trash2,
        edit: Edit3,
        package: Package,
        dollar: DollarSign,
        image: ImageIcon,
        list: List,
        search: Search,
        filter: Filter,
        xCircle: XCircle,
        chevronDown: ChevronDown,
        chevronUp: ChevronUp,
        menu: Menu,
        x: X,
        mail: Mail,
        phone: Phone,
        mapPin: MapPin,
        lock: Lock,
        star: Star,
        userCircle: UserCircle,
        facebook: Facebook,
        twitter: Twitter,
        instagram: Instagram,
        linkedin: Linkedin,
        youtube: Youtube,
        cart: ShoppingCart,
        grid: LayoutGrid,
        laptop: Laptop,
        chevronLeft: ChevronLeft,
        chevronRight: ChevronRight,
        playCircle: PlayCircle,
        arrowRight: ArrowRight,
        messageSquare: MessageSquare
    };

    const SelectedIcon = icons[name];

    if (!SelectedIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    // Attempt to extract text color class for direct application
    const textColorClass = className ? className.split(' ').find(cls => cls.startsWith('text-')) : null;
    let style = {};

    if (textColorClass === 'text-black') {
        style.stroke = 'black';
        style.color = 'black'; // Some icons might use fill
    }

    // Render the imported Lucide-react component
    return <SelectedIcon className={className || "w-5 h-5"} style={style} {...props} />;
};

export default Icon; 