'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Home, BarChart2, Package, Menu, X, User } from 'lucide-react';

interface MobileNavProps {
  userName?: string;
}

export default function MobileNav({ userName }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="fixed bottom-6 right-6 md:hidden z-20">
        <button 
          onClick={toggleMenu}
          className="bg-blue-500 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          {isOpen ? (
            <X className="text-white" size={24} />
          ) : (
            <Menu className="text-white" size={24} />
          )}
        </button>
      </div>

      {/* Mobile navigation menu */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-10 md:hidden">
          <div className="absolute bottom-24 right-6 bg-white rounded-lg shadow-xl overflow-hidden w-64">
            {/* User name display if available */}
            {userName && (
              <div className="px-4 py-3 bg-gray-50 border-b flex items-center">
                <User className="mr-2 text-gray-600" size={16} />
                <span className="text-sm text-gray-700">Hello, {userName}</span>
              </div>
            )}
            <nav>
              <ul>
                <li>
                  <Link 
                    href="/"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Home className="mr-2 text-gray-600" size={20} />
                    <span>Home</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/dashboard"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <BarChart2 className="mr-2 text-gray-600" size={20} />
                    <span>Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/inventory"
                    className="flex items-center px-4 py-3 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Package className="mr-2 text-gray-600" size={20} />
                    <span>Inventory</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
} 