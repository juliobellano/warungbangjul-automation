import React, { useState, useEffect } from 'react';
import { getSalesAnalytics, getProfitabilityMetrics } from '../services/api';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Mock data generation functions 
const generateMockSalesData = (days) => {
  const data = [];
  const endDate = new Date();
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(endDate.getDate() - (days - i - 1));
    
    data.push({
      date: date.toISOString().split('T')[0],
      revenue: Math.floor(Math.random() * 5000) + 5000,
      orders: Math.floor(Math.random() * 20) + 10,
      items: {
        'SE': Math.floor(Math.random() * 15) + 5,
        'T': Math.floor(Math.random() * 10) + 2,
      }
    });
  }
  
  return data;
};

const generateMockProfitabilityData = () => {
  const totalRevenue = Math.floor(Math.random() * 50000) + 100000;
  const totalCost = Math.floor(totalRevenue * 0.6);
  const grossProfit = totalRevenue - totalCost;
  
  return {
    total_revenue: totalRevenue,
    total_cost: totalCost,
    gross_profit: grossProfit,
    profit_margin: Math.floor((grossProfit / totalRevenue) * 100),
    item_counts: {
      'SE': Math.floor(Math.random() * 100) + 50,
      'T': Math.floor(Math.random() * 50) + 20,
    }
  };
};

// Format item counts data for the bar chart
const formatItemCountsForChart = (itemCounts) => {
  return Object.entries(itemCounts || {}).map(([code, count]) => {
    const itemNames = {
      'SE': 'Chicken with Salted Egg',
      'T': 'Sunny Side Up Egg'
    };
    
    return {
      name: itemNames[code] || code,
      count: count
    };
  });
};

// UI Components
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-xl font-bold">{children}</h3>;
const CardDescription = ({ children }) => <p className="text-gray-500 mt-1">{children}</p>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Dashboard = () => {
  console.log("Dashboard component rendering");
  const [analyticsData, setAnalyticsData] = useState([]);
  const [profitabilityData, setProfitabilityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // Default: 30 days

  useEffect(() => {
    console.log(`Dashboard useEffect running with timeRange: ${timeRange}`);
    const fetchData = async () => {
      setIsLoading(true);
      setError('');
      
      try {
        console.log("Attempting to fetch data from API");
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - parseInt(timeRange));
        
        try {
          // Try to fetch real data
          const [salesData, profitData] = await Promise.all([
            getSalesAnalytics(startDate, endDate),
            getProfitabilityMetrics(startDate, endDate)
          ]);
          
          setAnalyticsData(salesData);
          setProfitabilityData(profitData);
        } catch (apiError) {
          console.warn("API endpoints unavailable, using mock data:", apiError);
          
          // Add a small delay to simulate network request
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // Use mock data instead
          const mockSalesData = generateMockSalesData(parseInt(timeRange));
          const mockProfitData = generateMockProfitabilityData();
          
          console.log("Setting mock data");
          setAnalyticsData(mockSalesData);
          setProfitabilityData(mockProfitData);
        }
      } catch (err) {
        console.error("Error in fetchData:", err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);
  
  // Calculate total revenue
  const totalRevenue = analyticsData.reduce((sum, day) => sum + day.revenue, 0);
  
  // Calculate total orders
  const totalOrders = analyticsData.reduce((sum, day) => sum + day.orders, 0);
  
  // Format data for the bar chart
  const itemCountsData = profitabilityData ? formatItemCountsForChart(profitabilityData.item_counts) : [];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Dashboard</h2>
        
        <div className="text-sm text-gray-500">
          Status: {isLoading ? "Loading..." : error ? "Error" : "Data Loaded"}
        </div>
        
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded-md p-2"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Revenue Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Revenue Summary</CardTitle>
                <CardDescription>Total revenue for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{totalRevenue.toLocaleString()} NTD</div>
                <div className="text-sm text-gray-500 mb-4">
                  From {totalOrders} orders
                </div>
                
                <div>
                  <h4 className="font-bold mb-2">Daily Revenue</h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value.toLocaleString()} NTD`} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                          name="Revenue"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Profitability Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profitability</CardTitle>
                <CardDescription>Profit metrics for selected period</CardDescription>
              </CardHeader>
              <CardContent>
                {profitabilityData && (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500">Revenue</div>
                        <div className="text-xl font-bold">{profitabilityData.total_revenue.toLocaleString()} NTD</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Cost</div>
                        <div className="text-xl font-bold">{profitabilityData.total_cost.toLocaleString()} NTD</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Gross Profit</div>
                        <div className="text-xl font-bold">{profitabilityData.gross_profit.toLocaleString()} NTD</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-500">Profit Margin</div>
                        <div className="text-xl font-bold">{profitabilityData.profit_margin}%</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold mb-2">Item Sales Distribution</h4>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={itemCountsData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#82ca9d" name="Items Sold" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Daily Orders Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Daily Orders</CardTitle>
              <CardDescription>Number of orders per day</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={analyticsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="#82ca9d"
                      activeDot={{ r: 8 }}
                      name="Order Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;