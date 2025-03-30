'use client';

import { useState, useEffect } from 'react';
import { Clock, Drumstick, Egg, Check } from 'lucide-react';
import InventoryItem from '@/components/InventoryItem';
import { getTodayInventoryNeeds } from '@/services/api';
import { useApiCall } from '@/services/useApi';

// Abbreviate units helper function (from InventoryPlanner.jsx)
const abbreviateUnit = (unit: string): string => {
  const unitMap: Record<string, string> = {
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

// Format ingredient name
const formatIngredientName = (name: string): string => {
  return name.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get menu item name
const getMenuItemName = (code: string): string => {
  const menuNames: Record<string, string> = {
    'SE': 'Chicken Salted Egg',
    'T': 'Sunny Side Up Egg',
  };
  
  return menuNames[code] || code;
};

// Ingredient interface matching the backend data format
interface Ingredient {
  name: string;
  amount: number;
  unit: string;
}

// Order summary interface
interface OrderSummary {
  item_counts?: Record<string, number>;
}

export default function InventoryPage() {
  const [inventoryData, setInventoryData] = useState<Ingredient[]>([]);
  const [orderSummary, setOrderSummary] = useState<OrderSummary>({});
  const [checkedIngredients, setCheckedIngredients] = useState<Set<string>>(new Set());
  
  // Use the API call hook
  const inventoryApiCall = useApiCall(getTodayInventoryNeeds);
  
  // Fetch inventory data on component mount
  useEffect(() => {
    fetchInventoryData();
  }, []);
  
  // Monitor order summary changes
  useEffect(() => {
    console.log('Order summary state updated:', orderSummary);
    console.log('Has item_counts?', Boolean(orderSummary.item_counts));
    if (orderSummary.item_counts) {
      console.log('Number of items:', Object.keys(orderSummary.item_counts).length);
    }
  }, [orderSummary]);
  
  // Function to fetch inventory data
  const fetchInventoryData = async () => {
    try {
      console.log('Fetching inventory data...');
      const data = await inventoryApiCall.execute();
      
      if (data) {
        console.log('Inventory data received:', data);
        
        // Process ingredients data
        const ingredients: Ingredient[] = [];
        if (data.ingredients_needed) {
          console.log('Processing ingredients:', data.ingredients_needed);
          
          Object.entries(data.ingredients_needed).forEach(([name, details]: [string, any]) => {
            ingredients.push({
              name: name,
              amount: details.quantity || details.amount || 0,
              unit: details.unit || 'pcs'
            });
          });
          
          setInventoryData(ingredients);
          console.log('Processed ingredients:', ingredients);
        }
        
        // Set order summary - simpler approach, set the entire object at once
        if (data.order_summary) {
          const newOrderSummary = {
            item_counts: data.order_summary.item_counts || {}
          };
          
          console.log('Setting order summary to:', newOrderSummary);
          setOrderSummary(newOrderSummary);
        }
      }
    } catch (error) {
      console.error('Error fetching inventory data:', error);
    }
  };
  
  // Handle ingredient card click
  const toggleIngredientCheck = (ingredientName: string) => {
    setCheckedIngredients(prev => {
      const newChecked = new Set(prev);
      if (newChecked.has(ingredientName)) {
        newChecked.delete(ingredientName);
      } else {
        newChecked.add(ingredientName);
      }
      return newChecked;
    });
  };
  
  // Handle refresh button click
  const handleRefresh = () => {
    fetchInventoryData();
  };
  
  // Clear all checked ingredients with a transition effect
  const clearCheckedIngredients = () => {
    // First mark them for clearing with a visual transition
    const ingredientCards = document.querySelectorAll('.ingredient-card');
    ingredientCards.forEach((card) => {
      if (card.classList.contains('bg-green-50')) {
        card.classList.add('clear-transition');
        card.classList.add('bg-red-50');
        card.classList.remove('bg-green-50');
      }
    });
    
    // Then actually clear the state after the visual transition
    setTimeout(() => {
      setCheckedIngredients(new Set());
    }, 300);
  };
  
  // Debug function to log data
  const handleDebug = () => {
    console.log('Current inventory data:', inventoryData);
    console.log('Current order summary state:', orderSummary);
    console.log('Item counts:', orderSummary.item_counts ? 'exists' : 'missing');
    console.log('Keys in item_counts:', orderSummary.item_counts ? Object.keys(orderSummary.item_counts) : 'N/A');
    console.log('Length of item_counts:', orderSummary.item_counts ? Object.keys(orderSummary.item_counts).length : 'N/A');
    console.log('Checked ingredients:', Array.from(checkedIngredients));
    
    console.log('API data structure expected:', {
      ingredients_needed: {
        "ingredient_name": { amount: 1.0, unit: "g" }
      },
      order_summary: {
        item_counts: { "SE": 2, "T": 1 }
      },
      total_orders: 3
    });
  };
  
  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Inventory Planner</h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleRefresh}
            className="bg-blue-50 text-blue-600 border border-blue-100 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center"
          >
            <Clock className="mr-2" size={20} />
            <span>Refresh</span>
          </button>
          <button 
            onClick={clearCheckedIngredients}
            className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center"
          >
            <span>Clear Checks</span>
          </button>
          <button 
            onClick={handleDebug}
            className="bg-gray-50 text-gray-600 border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors flex items-center"
          >
            <span>Debug</span>
          </button>
          <div className="text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            <span>Updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {inventoryApiCall.isLoading && (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">Loading inventory data...</p>
        </div>
      )}

      {/* Error State */}
      {inventoryApiCall.error && (
        <div className="bg-red-50 rounded-lg shadow-sm p-6 text-red-700 mb-8">
          <h3 className="font-medium">Error loading inventory data</h3>
          <p>{inventoryApiCall.error.message}</p>
        </div>
      )}

      {/* Content when data is loaded */}
      {!inventoryApiCall.isLoading && !inventoryApiCall.error && (
        <>
          {/* Today's Orders Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-3">Today's Orders</h2>
            {(() => {
              console.log('Rendering with order summary:', orderSummary);
              if (orderSummary.item_counts && Object.keys(orderSummary.item_counts).length > 0) {
                console.log('Item counts exist, mapping:', orderSummary.item_counts);
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(orderSummary.item_counts).map(([code, count]) => {
                      console.log(`Rendering item: ${code} with count:`, count);
                      return (
                        <div key={code} className="bg-blue-50 p-4 rounded-lg">
                          <h3 className="text-lg font-medium text-gray-700">{getMenuItemName(code)}:</h3>
                          <p className="text-5xl font-bold text-blue-700">{count}</p>
                        </div>
                      );
                    })}
                  </div>
                );
              } else {
                console.log('No item counts found, showing empty state');
                return <p className="text-gray-500">No orders for today</p>;
              }
            })()}
          </div>

          {/* Checked Progress */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">Ingredients Needed</h2>
            <div className="text-sm text-gray-600">
              {checkedIngredients.size} of {inventoryData.length} checked
            </div>
          </div>

          {/* Ingredients Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {inventoryData.length > 0 ? (
              inventoryData.map((ingredient, index) => {
                const isChecked = checkedIngredients.has(ingredient.name);
                return (
                  <div 
                    key={index} 
                    className={`ingredient-card rounded-lg shadow-sm border p-4 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-md active:scale-[0.98] ${
                      isChecked 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-white border-gray-100 hover:bg-gray-50'
                    }`}
                    onClick={() => toggleIngredientCheck(ingredient.name)}
                  >
                    <div className="flex items-center mb-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 transition-all duration-300 ${
                        isChecked ? 'bg-green-100 rotate-0' : 'bg-blue-100 hover:rotate-12'
                      }`}>
                        {isChecked ? (
                          <Check size={20} className="text-green-600 animate-[bounceIn_0.3s_ease-in-out]" />
                        ) : ingredient.name.includes('egg') || ingredient.name.includes('oil') ? (
                          <Egg size={20} className="text-amber-500 transition-transform duration-200 hover:scale-110" />
                        ) : (
                          <Drumstick size={20} className="text-amber-500 transition-transform duration-200 hover:scale-110" />
                        )}
                      </div>
                      <h3 className={`font-medium transition-colors duration-200 ${isChecked ? 'text-green-800' : 'text-gray-800'}`}>
                        {formatIngredientName(ingredient.name)}
                      </h3>
                    </div>
                    <div className="mt-2 relative overflow-hidden">
                      <div className={`transition-all duration-300 ${
                        isChecked ? 'opacity-100' : 'opacity-0'
                      } absolute top-0 right-0 bg-green-100 rounded-full p-1`}>
                        <Check size={16} className="text-green-600" />
                      </div>
                      <span className={`text-3xl font-bold transition-colors duration-200 ${isChecked ? 'text-green-700' : 'text-gray-900'}`}>
                        {typeof ingredient.amount === 'number' ? ingredient.amount.toFixed(1) : ingredient.amount}
                      </span>
                      <span className={`text-sm ml-1 transition-colors duration-200 ${isChecked ? 'text-green-600' : 'text-gray-600'}`}>
                        {abbreviateUnit(ingredient.unit)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full p-6 text-center bg-gray-50 rounded-lg">
                <p className="text-gray-500">No ingredients data available</p>
              </div>
            )}
          </div>

          {/* Admin Actions */}
          <div className="mt-10 flex justify-between">
            <div>
              <button 
                className={`px-5 py-2 rounded-lg transition-colors shadow-md ${
                  checkedIngredients.size === inventoryData.length
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-600'
                }`}
                disabled={checkedIngredients.size !== inventoryData.length}
              >
                All Ingredients Ready
              </button>
            </div>
            <button 
              className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors shadow-md"
              onClick={() => console.log('Process today\'s orders - functionality to be implemented')}
            >
              Process Today's Orders
            </button>
          </div>
        </>
      )}
    </div>
  );
} 