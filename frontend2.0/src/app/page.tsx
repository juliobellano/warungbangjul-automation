'use client';

import { useState } from 'react';
import { Search, ChevronLeft, Settings, Clock, ArrowRight, Heart } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Menu items data
  const menuItems = [
    {
      id: '1',
      name: 'Pizza Calzone European',
      description: 'Prosciutto e funghi is a pizza variety that is topped with tomato sauce.',
      price: 32,
      restaurant: 'Uttora Coffee House',
      gradient: 'from-red-100 to-red-200',
      path: '/product/1'
    },
    {
      id: '2',
      name: 'Burger Bistro',
      description: 'A juicy beef patty with lettuce, tomato, and special sauce on a brioche bun.',
      price: 40,
      restaurant: 'Rose Garden',
      gradient: 'from-orange-100 to-orange-200',
      path: '/product/2'
    },
    {
      id: '3',
      name: 'Chicken Salted Egg',
      description: 'Crispy chicken pieces tossed in a rich, creamy salted egg sauce.',
      price: 45,
      restaurant: 'Warung Bang Jul',
      gradient: 'from-amber-100 to-amber-200',
      path: '/product/3'
    },
    {
      id: '4',
      name: 'Sunny Side Up Egg',
      description: 'Simple and classic sunny side up egg, prepared to perfection.',
      price: 15,
      restaurant: 'Warung Bang Jul',
      gradient: 'from-yellow-100 to-yellow-200',
      path: '/product/4'
    }
  ];

  // Today's orders data
  const todaysOrders = [
    { id: "#1", customer: "John Doe", items: "2x Burger Bistro", total: 80 },
    { id: "#2", customer: "Jane Smith", items: "1x Smokin' Burger, 1x Fries", total: 75 },
    { id: "#3", customer: "Mike Johnson", items: "3x Buffalo Burgers", total: 225 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Today's Menu</h1>
          
          <div className="flex space-x-3">
            <button className="bg-white p-3 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <Search size={20} className="text-gray-600" />
            </button>
            <button className="bg-white p-3 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all">
              <Settings size={20} className="text-gray-600" />
            </button>
          </div>
        </div>
        
        {/* Main Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          {menuItems.map((item) => (
            <Link 
              href={item.path} 
              key={item.id}
              className="group"
            >
              <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full border border-gray-100 group-hover:-translate-y-1">
                <div className={`h-40 bg-gradient-to-r ${item.gradient} relative`}>
                  <div className="absolute top-4 right-4 bg-white/80 p-2 rounded-full backdrop-blur-sm">
                    <Heart size={20} className="text-gray-400 group-hover:text-red-400 transition-colors" />
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                    <div className="text-2xl font-bold text-orange-500">${item.price}</div>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{item.description}</p>
                  
                  <div className="flex justify-between items-center">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
                      {item.restaurant}
                    </div>
                    
                    <button className="bg-orange-400 text-white px-4 py-2 rounded-full hover:bg-orange-500 transition-colors">
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Today's Orders Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Today's Orders</h2>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-sm font-medium text-gray-700 w-1/6">Order ID</th>
                  <th className="py-3 text-left text-sm font-medium text-gray-700 w-1/4">Customer</th>
                  <th className="py-3 text-left text-sm font-medium text-gray-700 w-2/5">Items</th>
                  <th className="py-3 text-right text-sm font-medium text-gray-700 w-1/6">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {todaysOrders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="py-4 text-sm text-gray-900">{order.id}</td>
                    <td className="py-4 text-sm text-gray-900">{order.customer}</td>
                    <td className="py-4 text-sm text-gray-900">{order.items}</td>
                    <td className="py-4 text-sm text-gray-900 text-right">${order.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
