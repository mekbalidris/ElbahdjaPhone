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
    ShoppingCart
} from 'lucide-react';

const Icon = ({ name, className, ...props }) => {
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
    };

    const SelectedIcon = icons[name];

    if (!SelectedIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    // Render the imported Lucide-react component
    return <SelectedIcon className={className || "w-5 h-5"} {...props} />;
};

export default Icon; 