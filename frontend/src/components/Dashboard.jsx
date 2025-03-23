import React, { useState, useEffect } from 'react';
import { getSalesAnalytics, getProfitabilityMetrics } from '../services/api';

// In a real implementation, these would be imported from ShadCN and Recharts
// For brevity, we'll define minimal versions here
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-xl font-bold">{children}</h3>;
const CardDescription = ({ children }) => <p className="text-gray-500 mt-1">{children}</p>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;

const Select = ({ value, onValueChange, children }) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className="border rounded-md p-2"
  >
    {children}
  </select>
);

const SelectTrigger = ({ children, className }) => <div className={className}>{children}</div>;
const SelectValue = ({ placeholder }) => <span>{placeholder}</span>;
const SelectContent = ({ children }) => <div>{children}</div>;
const SelectItem = ({ value, children }) => <option value={value}>{children}</option>;

// Sample chart component (in real implementation, use Recharts)
const LineChart = ({ data, dataKey, title }) => (
  <div className="mt-4">
    <h4 className="font-bold mb-2">{title}</h4>
    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
      {/* This would be a real chart in implementation */}
      <div className="text-center text-gray-500">
        <p>Line Chart visualization for {dataKey}</p>
        <p>{data.length} data points</p>
      </div>
    </div>
  </div>
);

const BarChart = ({ data, dataKey, title }) => (
  <div className="mt-4">
    <h4 className="font-bold mb-2">{title}</h4>
    <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
      {/* This would be a real chart in implementation */}
      <div className="text-center text-gray-500">
        <p>Bar Chart visualization for {dataKey}</p>
        <p>{data.length} data points</p>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [profitabilityData, setProfitabilityData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // Default: 30 days
  
  const fetchData = async (days) => {
    setIsLoading(true);
    setError('');
    
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));
      
      const [salesData, profitData] = await Promise.all([
        getSalesAnalytics(startDate, endDate),
        getProfitabilityMetrics(startDate, endDate)
      ]);
      
      setAnalyticsData(salesData);
      setProfitabilityData(profitData);
    } catch (err) {
      setError('Failed to load analytics data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(timeRange);
  }, [timeRange]);
  
  // Calculate total revenue
  const totalRevenue = analyticsData.reduce((sum, day) => sum + day.revenue, 0);
  
  // Calculate total orders
  const totalOrders = analyticsData.reduce((sum, day) => sum + day.orders, 0);
  
  // Calculate item popularity
  const itemPopularity = {};
  analyticsData.forEach(day => {
    Object.entries(day.items || {}).forEach(([code, quantity]) => {
      if (!itemPopularity[code]) {
        itemPopularity[code] = 0;
      }
      itemPopularity[code] += quantity;
    });
  });
  
  // Convert to array for chart
  const itemPopularityData = Object.entries(itemPopularity).map(([code, quantity]) => ({
    code,
    quantity
  }));
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Business Dashboard</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
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
                <div className="text-sm text-gray-500">
                  From {totalOrders} orders
                </div>
                
                <LineChart 
                  data={analyticsData}
                  dataKey="revenue"
                  title="Daily Revenue"
                />
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
                    <div className="grid grid-cols-2 gap-4">
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
                    
                    <BarChart 
                      data={Object.entries(profitabilityData.item_counts || {}).map(([code, count]) => ({ code, count }))}
                      dataKey="count"
                      title="Item Sales Distribution"
                    />
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
              <LineChart 
                data={analyticsData}
                dataKey="orders"
                title="Daily Order Count"
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default Dashboard;