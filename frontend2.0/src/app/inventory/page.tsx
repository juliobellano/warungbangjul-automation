'use client';

import { useState } from 'react';
import { Clock } from 'lucide-react';
import InventoryItem from '@/components/InventoryItem';

// Inventory item interface
interface InventoryItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export default function Inventory() {
  // Mock data for inventory items based on the reference image
  const inventoryItems: InventoryItem[] = [
    { id: '1', name: 'Chicken Breast', amount: 300.0, unit: 'g', category: 'protein' },
    { id: '2', name: 'Salted Egg Yolk', amount: 2.7, unit: 'pcs', category: 'dairy' },
    { id: '3', name: 'Flour Marinade', amount: 20.0, unit: 'g', category: 'dry' },
    { id: '4', name: 'Flour Batter', amount: 133.3, unit: 'g', category: 'dry' },
    { id: '5', name: 'Salt Marinade', amount: 1.7, unit: 'g', category: 'spices' },
    { id: '6', name: 'Salt Batter', amount: 3.3, unit: 'g', category: 'spices' },
    { id: '7', name: 'Fish Sauce', amount: 5.0, unit: 'g', category: 'condiments' },
    { id: '8', name: 'Msg', amount: 1.7, unit: 'g', category: 'condiments' },
    { id: '9', name: 'Garlic', amount: 5.0, unit: 'g', category: 'spices' },
    { id: '10', name: 'Baking Powder', amount: 1.7, unit: 'g', category: 'dry' },
    { id: '11', name: 'White Pepper', amount: 1.7, unit: 'g', category: 'spices' },
    { id: '12', name: 'Oyster Sauce', amount: 5.0, unit: 'g', category: 'condiments' },
    { id: '13', name: 'Condensed Milk', amount: 6.7, unit: 'g', category: 'dairy' },
    { id: '14', name: 'Chili Big', amount: 2.0, unit: 'pcs', category: 'vegetables' },
    { id: '15', name: 'Chili Small', amount: 0.7, unit: 'pcs', category: 'vegetables' },
    { id: '16', name: 'Lime Leaves', amount: 2.0, unit: 'pcs', category: 'herbs' },
    { id: '17', name: 'Butter', amount: 10.0, unit: 'g', category: 'dairy' },
    { id: '18', name: 'Chicken Powder', amount: 2.5, unit: 'g', category: 'spices' },
    { id: '19', name: 'Milk', amount: 100.0, unit: 'ml', category: 'dairy' },
  ];

  // Calculate today's data for the top card
  const todayData = {
    title: "Chicken Salted Egg:",
    count: 2
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory</h1>
        <div className="flex items-center text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
          <Clock className="mr-2" size={20} />
          <span>Updated: Today, 2:30 PM</span>
        </div>
      </div>

      {/* Today's Orders Card */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-3">Today's Orders</h2>
        <div className="flex items-baseline">
          <p className="text-gray-600">{todayData.title}</p>
          <p className="text-5xl font-bold ml-4">{todayData.count}</p>
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {inventoryItems.map(item => (
          <InventoryItem
            key={item.id}
            id={item.id}
            name={item.name}
            amount={item.amount}
            unit={item.unit}
            category={item.category}
          />
        ))}
      </div>

      {/* Admin Actions */}
      <div className="mt-10 flex justify-end">
        <button className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md">
          Update Inventory
        </button>
      </div>
    </div>
  );
} 