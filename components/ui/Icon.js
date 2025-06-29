import React from 'react';
import {
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
    ChevronLeft,
    ChevronRight,
    PlayCircle,
    ArrowRight,
    MessageSquare,
    Columns3,
    Columns4
} from 'lucide-react';

const Icon = ({ name, className, ...props }) => {
    console.log('Icon component received name prop:', name, typeof name);
    if (typeof name !== 'string') {
        console.warn('Icon component received a non-string name prop:', name);
        return null;
    }

    const icons = {
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
        columns3: Columns3,
        columns4: Columns4,
        chevronLeft: ChevronLeft,
        chevronRight: ChevronRight,
        playCircle: PlayCircle,
        arrowRight: ArrowRight,
        messageSquare: MessageSquare,
        grid3: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={props.className} {...props}>
                {[0,1,2].map(i => [0,1,2].map(j => (
                    <rect key={i+','+j} x={2+j*7.5} y={2+i*7.5} width="5" height="5" rx="1" fill="none" />
                )))}
            </svg>
        ),
        grid4: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" className={props.className} {...props}>
                {[0,1,2,3].map(i => [0,1,2,3].map(j => (
                    <rect key={i+','+j} x={1.5+j*5.5} y={1.5+i*5.5} width="3.5" height="3.5" rx="0.7" fill="none" />
                )))}
            </svg>
        ),
        grid5: (props) => (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className={props.className} {...props}>
                {[0,1,2,3,4].map(i => [0,1,2,3,4].map(j => (
                    <rect key={i+','+j} x={0.8+j*4.5} y={0.8+i*4.5} width="2.8" height="2.8" rx="0.5" fill="none" />
                )))}
            </svg>
        ),
    };

    const SelectedIcon = typeof icons[name] === 'function' ? icons[name] : icons[name];

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

    // Render the imported Lucide-react component or custom SVG
    return typeof SelectedIcon === 'function'
        ? <SelectedIcon className={className || "w-5 h-5"} {...props} />
        : <SelectedIcon className={className || "w-5 h-5"} style={style} {...props} />;
};

export default Icon; 