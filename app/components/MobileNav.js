'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Car, Receipt, History, Menu, X } from 'lucide-react';

export default function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);
    const pathname = usePathname();

    const links = [
        { name: 'Dashboard', href: '/', icon: Home },
        { name: 'Rentals', href: '/rentals', icon: Car },
        { name: 'Tolls', href: '/tolls', icon: Receipt },
        { name: 'History', href: '/history', icon: History },
    ];

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <div className="md:hidden">
            {/* Hamburger Button */}
            <button
                onClick={toggleMenu}
                className="fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-900/80 text-white backdrop-blur-sm border border-white/10"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-gray-900 border-r border-gray-800 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
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
                                onClick={() => setIsOpen(false)}
                                className={`flex items-center px-4 py-3 rounded-lg transition-all duration-200 group ${isActive
                                    ? 'bg-blue-600/10 text-blue-400'
                                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                    }`}
                            >
                                <Icon
                                    className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-white'}`}
                                />
                                <span className="font-medium">{link.name}</span>
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-gray-800 absolute bottom-0 w-full bg-gray-900">
                    <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white">User</p>
                            <p className="text-xs text-gray-500">Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
