

import React, { useState } from 'react';
import OrderInput from './components/OrderInput';
import Dashboard from './components/Dashboard';
import InventoryPlanner from './components/InventoryPlanner';

console.log("React App component loaded");
document.title = "React is working!";

// UI Components (in real implementation, import from ShadCN UI)
const Tabs = ({ defaultValue, children }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  
  const tabs = React.Children.toArray(children).filter(
    child => child.type === TabsTrigger
  );
  
  const panels = React.Children.toArray(children).filter(
    child => child.type === TabsContent
  );
  
  return (
    <div className="space-y-4">
      <div className="flex border-b">
        {tabs.map((tab) => 
          React.cloneElement(tab, { 
            key: tab.props.value,
            isActive: tab.props.value === activeTab,
            onClick: () => setActiveTab(tab.props.value)
          })
        )}
      </div>
      <div>
        {panels.find(panel => panel.props.value === activeTab)}
      </div>
    </div>
  );
};

const TabsList = ({ children }) => (
  <div className="flex">{children}</div>
);

const TabsTrigger = ({ value, children, isActive, onClick }) => (
  <button
    className={`px-4 py-2 ${
      isActive 
        ? 'text-blue-600 border-b-2 border-blue-600 font-medium' 
        : 'text-gray-500 hover:text-gray-700'
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const TabsContent = ({ value, children }) => (
  <div>{children}</div>
);

const App = () => {
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
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
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
          </TabsContent>
          
          <TabsContent value="dashboard">
            <div className="pt-6">
              <Dashboard />
            </div>
          </TabsContent>
          
          <TabsContent value="inventory">
            <div className="pt-6">
              <h2 className="text-2xl font-bold mb-6">Inventory Management</h2>
              <InventoryPlanner />
            </div>
          </TabsContent>
        </Tabs>
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