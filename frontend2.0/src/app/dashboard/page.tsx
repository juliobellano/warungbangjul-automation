'use client';

import { useState, useEffect } from 'react';
import { useApiCall } from '@/services/useApi';
import { getOrders } from '@/services/api';
import { Order } from '@/services/types';
import { createDateRange } from '@/services/utils';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import { CalendarRange, Calendar, ArrowRight, DownloadCloud, RefreshCw } from 'lucide-react';

// Date formatting
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper to check if a date is valid
const isValidDate = (date: Date): boolean => {
  return !isNaN(date.getTime());
};

// Safe date parsing helper
const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isValidDate(date) ? date : null;
};

// Get ISO date string safely
const getISODateString = (date: Date | null): string | null => {
  if (!date || !isValidDate(date)) return null;
  try {
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return null;
  }
};

export default function DashboardPage() {
  // Date range selection
  const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>(
    createDateRange(30) // Default to last 30 days
  );
  
  // States for data
  const [orders, setOrders] = useState<Order[]>([]);
  const [dailyOrders, setDailyOrders] = useState<any[]>([]);
  const [dailyIncome, setDailyIncome] = useState<any[]>([]);
  const [totalStats, setTotalStats] = useState({
    totalOrders: 0,
    totalIncome: 0,
    averageOrderValue: 0,
  });
  
  // API call hooks
  const ordersApiCall = useApiCall<Order[], [Date | null, Date | null, string | null]>(getOrders);
  
  // Fetch data when date range changes
  useEffect(() => {
    console.log('Date range changed, fetching data for:', {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    });
    fetchData();
  }, [dateRange]);
  
  // Function to fetch data
  const fetchData = async () => {
    try {
      console.log('Fetching orders data...');
      const fetchedOrders = await ordersApiCall.execute(
        dateRange.startDate,
        dateRange.endDate,
        null
      );
      
      if (fetchedOrders) {
        console.log(`Successfully fetched ${fetchedOrders.length} orders:`, fetchedOrders);
        setOrders(fetchedOrders);
        processOrdersData(fetchedOrders);
      } else {
        console.warn('No orders data returned from API');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };
  
  // Process orders data for graphs
  const processOrdersData = (orders: Order[]) => {
    console.log('Processing orders data for visualization');
    
    // Create a map of dates in the range
    const dateMap = new Map();
    const currentDate = new Date(dateRange.startDate);
    
    // Create date range for the chart
    while (currentDate <= dateRange.endDate) {
      const dateStr = getISODateString(currentDate);
      if (dateStr) {
        dateMap.set(dateStr, {
          date: formatDate(new Date(dateStr)),
          orders: 0,
          income: 0,
        });
      }
      // Clone the date before modifying to avoid reference issues
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      currentDate.setTime(nextDate.getTime());
    }
    
    console.log(`Created date map with ${dateMap.size} days`);
    
    // Fill the map with order data
    let totalOrders = 0;
    let totalIncome = 0;
    let matchedOrders = 0;
    
    orders.forEach(order => {
      console.log('Processing order:', {
        id: order.id,
        created_at: order.created_at,
        total_price: order.total_price
      });
      
      const orderDate = parseDate(order.created_at);
      if (!orderDate) {
        console.warn(`Invalid order date: ${order.created_at}`);
        return;
      }
      
      const orderDateStr = getISODateString(orderDate);
      console.log(`Order ${order.id} date parsed to: ${orderDateStr}`);
      
      if (orderDateStr && dateMap.has(orderDateStr)) {
        const dateData = dateMap.get(orderDateStr);
        dateData.orders += 1;
        dateData.income += order.total_price;
        totalOrders += 1;
        totalIncome += order.total_price;
        matchedOrders += 1;
        console.log(`Order ${order.id} matched to date ${orderDateStr}, new count: ${dateData.orders}`);
      } else {
        console.warn(`Order ${order.id} date ${orderDateStr} not in range`);
      }
    });
    
    console.log(`Processed ${orders.length} orders, matched ${matchedOrders} to date range`);
    
    // Convert map to array for charts
    const dailyData = Array.from(dateMap.values());
    console.log('Daily data for charts:', dailyData);
    
    setDailyOrders(dailyData);
    setDailyIncome(dailyData);
    
    // Set total stats
    setTotalStats({
      totalOrders,
      totalIncome,
      averageOrderValue: totalOrders > 0 ? totalIncome / totalOrders : 0,
    });
    
    console.log('Dashboard stats:', {
      totalOrders,
      totalIncome,
      averageOrderValue: totalOrders > 0 ? totalIncome / totalOrders : 0,
    });
  };
  
  // Handle date range change
  const handleDateRangeChange = (days: number) => {
    setDateRange(createDateRange(days));
  };
  
  // Manual refresh of data
  const refreshData = () => {
    console.log('Manual refresh requested');
    fetchData();
  };
  
  const toggleLogDateMap = () => {
    console.log('Current daily data:', dailyOrders);
    console.log('Current date range:', {
      startDate: dateRange.startDate.toISOString(),
      endDate: dateRange.endDate.toISOString()
    });
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={refreshData}
            className="p-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <RefreshCw size={16} className="mr-1" />
            <span>Refresh</span>
          </button>
          
          <button 
            onClick={toggleLogDateMap}
            className="p-2 bg-gray-50 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
          >
            <span>Debug</span>
          </button>
          
          <button 
            className="p-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-md hover:bg-blue-100 flex items-center"
          >
            <DownloadCloud size={16} className="mr-1" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Date range selector */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CalendarRange size={20} className="text-gray-500 mr-2" />
            <h2 className="font-semibold text-gray-700">Date Range</h2>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleDateRangeChange(7)}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange.endDate.getTime() - dateRange.startDate.getTime() === 6 * 86400000
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => handleDateRangeChange(30)}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange.endDate.getTime() - dateRange.startDate.getTime() === 29 * 86400000
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => handleDateRangeChange(90)}
              className={`px-3 py-1 rounded-md text-sm ${
                dateRange.endDate.getTime() - dateRange.startDate.getTime() === 89 * 86400000
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              90 Days
            </button>
          </div>
        </div>
        
        <div className="mt-3 flex items-center text-sm text-gray-600">
          <span>{formatDate(dateRange.startDate)}</span>
          <ArrowRight size={14} className="mx-2" />
          <span>{formatDate(dateRange.endDate)}</span>
        </div>
      </div>
      
      {/* Loading state */}
      {ordersApiCall.isLoading && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8 text-center">
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      )}
      
      {/* Error state */}
      {ordersApiCall.error && (
        <div className="bg-red-50 p-6 rounded-lg shadow-sm border border-red-100 mb-8">
          <h3 className="text-red-800 font-medium mb-2">Error loading dashboard data</h3>
          <p className="text-red-600">{ordersApiCall.error.message}</p>
        </div>
      )}
      
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Orders</h3>
          <p className="text-3xl font-bold text-gray-900">{totalStats.totalOrders}</p>
          <div className="mt-2 text-xs text-green-600">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Income</h3>
          <p className="text-3xl font-bold text-gray-900">{totalStats.totalIncome}</p>
          <div className="mt-2 text-xs text-green-600">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Order Value</h3>
          <p className="text-3xl font-bold text-gray-900">{totalStats.averageOrderValue.toFixed(2)}</p>
          <div className="mt-2 text-xs text-green-600">
            {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
          </div>
        </div>
      </div>
      
      {/* Daily Orders Graph */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="font-bold text-gray-800 mb-6">Daily Orders</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={dailyOrders}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} orders`, 'Orders']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
                name="Orders"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Daily Income Graph */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="font-bold text-gray-800 mb-6">Daily Income</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={dailyIncome}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Income']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="income" 
                stackId="1"
                stroke="#f59e0b" 
                fill="#fde68a" 
                name="Income"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 