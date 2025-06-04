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
    User
} from 'lucide-react';

const Icon = ({ name, className, ...props }) => {
    const icons = { 
        smartphone: Smartphone, 
        headphones: Headphones, 
        home: Home, 
        shoppingBag: ShoppingBag, 
        user: UserCircle, 
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
        userCircle: UserCircle
    };
    const LucideIcon = icons[name];
    return LucideIcon ? <LucideIcon className={className || "w-5 h-5"} {...props} /> : null;
};

export default Icon; 