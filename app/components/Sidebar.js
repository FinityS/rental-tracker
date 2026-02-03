'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Receipt, History } from 'lucide-react';

const Sidebar = () => {
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Rentals', href: '/rentals', icon: Car },
        { name: 'Tolls', href: '/tolls', icon: Receipt },
        { name: 'History', href: '/history', icon: History },
    ];

    return (
        <div className="hidden md:flex flex-col w-64 h-screen bg-gray-900 text-white border-r border-gray-800">
            <div className="p-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                    RentalTracker
                </h1>
            </div>
            <nav className="flex-1 px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                }`}
                        >
                            <Icon
                                className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`}
                                suppressHydrationWarning={true}
                            />
                            <span className="font-medium">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">User</p>
                        <p className="text-xs text-gray-500">Admin</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
