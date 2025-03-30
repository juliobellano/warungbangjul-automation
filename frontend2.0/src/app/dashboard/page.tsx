'use client';

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar, ChevronDown } from 'lucide-react';

// Mock data - replace with real data from your API
const mockData = [
  { date: '2024-03-20', orders: 45, revenue: 1200 },
  { date: '2024-03-21', orders: 52, revenue: 1400 },
  { date: '2024-03-22', orders: 48, revenue: 1300 },
  { date: '2024-03-23', orders: 70, revenue: 1800 },
  { date: '2024-03-24', orders: 60, revenue: 1600 },
  { date: '2024-03-25', orders: 55, revenue: 1500 },
  { date: '2024-03-26', orders: 65, revenue: 1700 },
];

const todayOrders = [
  { id: 1, customer: 'John Doe', items: '2x Burger Bistro', total: 80 },
  { id: 2, customer: 'Jane Smith', items: '1x Smokin\' Burger, 1x Fries', total: 75 },
  { id: 3, customer: 'Mike Johnson', items: '3x Buffalo Burgers', total: 225 },
];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    start: '2024-03-20',
    end: '2024-03-26'
  });

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
        
        {/* Date Range Selector */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <div className="relative">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
              <Calendar size={20} className="text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border-0 focus:ring-0"
              />
            </div>
          </div>
          <span className="text-gray-500">to</span>
          <div className="relative">
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm">
              <Calendar size={20} className="text-gray-500" />
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border-0 focus:ring-0"
              />
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Orders</h3>
            <p className="text-3xl font-bold">395</p>
            <span className="text-green-500 text-sm">↑ 12% from last week</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Total Revenue</h3>
            <p className="text-3xl font-bold">$8,940</p>
            <span className="text-green-500 text-sm">↑ 8% from last week</span>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-gray-500 text-sm mb-2">Average Order Value</h3>
            <p className="text-3xl font-bold">$22.63</p>
            <span className="text-red-500 text-sm">↓ 3% from last week</span>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <h2 className="text-xl font-semibold mb-4">Daily Orders</h2>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="orders" fill="#3B82F6" />
                <Bar dataKey="revenue" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Today's Orders</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3">Order ID</th>
                    <th className="text-left pb-3">Customer</th>
                    <th className="text-left pb-3">Items</th>
                    <th className="text-right pb-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {todayOrders.map((order) => (
                    <tr key={order.id} className="border-b last:border-0">
                      <td className="py-3">{`#${order.id}`}</td>
                      <td className="py-3">{order.customer}</td>
                      <td className="py-3">{order.items}</td>
                      <td className="py-3 text-right">${order.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 