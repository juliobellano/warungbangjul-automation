import React, { useState, useEffect } from 'react';
import { getTodayInventoryNeeds } from '../services/api';
import { Drumstick, Egg } from 'lucide-react';

// Function to abbreviate units
const abbreviateUnit = (unit) => {
  const unitMap = {
    'grams': 'g',
    'gram': 'g',
    'g': 'g',
    'kilograms': 'kg',
    'kilogram': 'kg',
    'kg': 'kg',
    'liter': 'l',
    'liters': 'l',
    'l': 'l',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'ml': 'ml',
    'pieces': 'pcs',
    'piece': 'pcs',
    'pcs': 'pcs'
  };
  
  return unitMap[unit.toLowerCase()] || unit;
};

// Ingredient Card Component
const IngredientCard = ({ name, amount, unit }) => {
  // Format the name to be title case
  const formattedName = name.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  // Abbreviate the unit
  const shortUnit = abbreviateUnit(unit);  
    
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between h-full">
      <div className="flex items-center mb-2">
        {/* Small icon circle next to title */}
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
          {name === 'chicken_egg' || name === 'oil' ? 
            <Egg size={20} color="#f59e0b" /> : 
            <Drumstick size={20} color="#f59e0b" />
          }          
          {/* Icon placeholder */}
        </div>
        
        <h3 className="text-lg font-medium">{formattedName}</h3>
      </div>
      
      <div className="mt-2">
        <span className="text-3xl font-bold">{typeof amount === 'number' ? amount.toFixed(1) : amount}</span>
        <span className="text-sm ml-1 text-gray-600">{shortUnit}</span>
      </div>
    </div>
  );
};

const InventoryPlanner = () => {
  // State
  const [inventoryData, setInventoryData] = useState([]);
  const [orderSummary, setOrderSummary] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('inventory');
  
  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await getTodayInventoryNeeds();
        
        // Process ingredients data
        const ingredients = [];
        if (data.ingredients_needed) {
          Object.entries(data.ingredients_needed).forEach(([name, details]) => {
            ingredients.push({
              name: name,
              amount: details.quantity,
              unit: details.unit
            });
          });
        }
        
        setInventoryData(ingredients);
        
        // Set order summary
        if (data.order_summary) {
          setOrderSummary(data.order_summary);
        }
      } catch (err) {
        setError('Failed to load inventory data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Helper function
  const getMenuItemName = (code) => {
    const menuNames = {
      'SE': 'Chicken Salted Egg',
      'T': 'Sunny Side Up Egg',
    };
    
    return menuNames[code] || code;
  };
  
  return (
    <div className="w-full bg-gray-100 min-h-screen p-4">
            
      {activeTab === 'inventory' && (
        <>          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading...</p>
            </div>
          ) : error ? (
            <div className="text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {/* Today's Orders Summary Card - takes 2x2 space */}
              <div className="bg-white rounded-lg shadow p-6 col-span-2 row-span-2">
                <h2 className="text-xl font-bold mb-4">Today's Orders</h2>
                {orderSummary.item_counts && Object.entries(orderSummary.item_counts).length > 0 ? (
                  Object.entries(orderSummary.item_counts).map(([code, count]) => (
                    <div key={code} className="mb-4">
                      <h3 className="font-medium">{getMenuItemName(code)}:</h3>
                      <p className="text-5xl font-bold">{count}</p>
                    </div>
                  ))
                ) : (
                  <p>No orders for today</p>
                )}
              </div>
              
              {/* Regular ingredient cards */}
              {inventoryData.map((ingredient, index) => (
                <IngredientCard 
                  key={index}
                  name={ingredient.name}
                  amount={ingredient.amount}
                  unit={ingredient.unit}
                />
              ))}
            </div>
          )}
        </>
      )}
      
      {activeTab === 'dashboard' && (
        <div className="p-4 bg-white rounded-lg shadow mt-4">
          <h2 className="text-xl font-bold mb-4">Dashboard</h2>
          <p>Dashboard content would appear here.</p>
        </div>
      )}
      
      {activeTab === 'orders' && (
        <div className="p-4 bg-white rounded-lg shadow mt-4">
          <h2 className="text-xl font-bold mb-4">Orders</h2>
          <p>Orders content would appear here.</p>
        </div>
      )}
    </div>
  );
};

export default InventoryPlanner;