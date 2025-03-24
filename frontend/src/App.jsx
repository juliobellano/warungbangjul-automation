

import React, { useState } from 'react';
import OrderInput from './components/OrderInput';
import Dashboard from './components/Dashboard';
import InventoryPlanner from './components/InventoryPlanner';

console.log("React App component loaded");
document.title = "React is working!";

// Add this component to App.jsx, replacing your current tab components
const SimpleTabs = ({ defaultValue, tabs, contents }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  console.log(`SimpleTabs active tab: ${activeTab}`);
  console.log(`Available tabs: ${Object.keys(tabs).join(', ')}`);
  
  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex border-b">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            className={`px-4 py-2 ${
              tabKey === activeTab 
                ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              console.log(`Changing tab to: ${tabKey}`);
              setActiveTab(tabKey);
            }}
          >
            {tabs[tabKey]}
          </button>
        ))}
      </div>
      
      {/* Tab content */}
      <div>
        {contents[activeTab]}
      </div>
    </div>
  );
};

const App = () => {
  // Define your tab labels
  const tabDefinitions = {
    "orders": "Orders",
    "dashboard": "Dashboard",
    "inventory": "Inventory"
  };
  
  // Define your tab contents
  const tabContents = {
    "orders": (
      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-6">Process Orders</h2>
        <OrderInput />
        
        <div className="mt-8 bg-yellow-50 border border-yellow-100 rounded-md p-4">
          <h3 className="text-lg font-medium text-yellow-800">Order Format Examples</h3>
          <ul className="mt-2 list-disc pl-5 text-yellow-700">
            <li>Single item: <code className="bg-yellow-100 px-1">John 2SE</code></li>
            <li>Multiple items: <code className="bg-yellow-100 px-1">Mary 1SE + 3T</code></li>
            <li>Multiple customers: Enter each customer order on a new line</li>
          </ul>
        </div>
      </div>
    ),
    "dashboard": (
      <div className="pt-6">
        <Dashboard />
      </div>
    ),
    "inventory": (
      <div className="pt-6">
        <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>
        <InventoryPlanner />
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Fried Chicken Business Automation
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <SimpleTabs 
          defaultValue="orders" 
          tabs={tabDefinitions} 
          contents={tabContents} 
        />
      </main>
      
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500">
            Fried Chicken Business Automation System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;