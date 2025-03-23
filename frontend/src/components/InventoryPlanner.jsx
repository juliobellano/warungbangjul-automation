import React, { useState, useEffect } from 'react';
import { getInventoryNeeds, getMenu } from '../services/api';

// UI Components (In real implementation, import from ShadCN)
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => <div className="p-4 border-b">{children}</div>;
const CardTitle = ({ children }) => <h3 className="text-xl font-bold">{children}</h3>;
const CardDescription = ({ children }) => <p className="text-gray-500 mt-1">{children}</p>;
const CardContent = ({ children }) => <div className="p-4">{children}</div>;
const CardFooter = ({ children }) => <div className="p-4 border-t">{children}</div>;

const Slider = ({ defaultValue, max, min, step, onValueChange, className }) => (
  <input 
    type="range"
    min={min}
    max={max}
    step={step}
    defaultValue={defaultValue[0]}
    onChange={(e) => onValueChange([parseInt(e.target.value)])}
    className={`w-full ${className}`}
  />
);

const Button = ({ onClick, disabled, className, children }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 ${className}`}
  >
    {children}
  </button>
);

const Select = ({ value, onValueChange, children }) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange(e.target.value)}
    className="border rounded-md p-2"
  >
    {children}
  </select>
);

const Table = ({ children }) => <table className="min-w-full divide-y divide-gray-200">{children}</table>;
const TableHeader = ({ children }) => <thead className="bg-gray-50">{children}</thead>;
const TableBody = ({ children }) => <tbody className="bg-white divide-y divide-gray-200">{children}</tbody>;
const TableRow = ({ children }) => <tr>{children}</tr>;
const TableHead = ({ children }) => <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{children}</th>;
const TableCell = ({ children, className }) => <td className={`px-6 py-4 whitespace-nowrap ${className}`}>{children}</td>;

const Badge = ({ children, variant }) => {
  const colorClasses = {
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[variant] || "bg-gray-100 text-gray-800"}`}>
      {children}
    </span>
  );
};

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

const ProgressBar = ({ value, max, color }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colorClass = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  }[color] || "bg-blue-500";
  
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className={`h-2.5 rounded-full ${colorClass}`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

const InventoryPlanner = () => {
  const [inventoryData, setInventoryData] = useState({});
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [days, setDays] = useState(7);
  const [currentStock, setCurrentStock] = useState({});
  const [displayUnit, setDisplayUnit] = useState('default');
  
  // Stock simulation (in a real app, this would come from the database)
  const simulatedStock = {
    chicken: { quantity: 5, unit: "kg" },
    salted_egg: { quantity: 20, unit: "piece" },
    flour: { quantity: 3, unit: "kg" },
    oil: { quantity: 2, unit: "liter" },
    egg: { quantity: 24, unit: "piece" }
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const [inventoryNeeds, menu] = await Promise.all([
        getInventoryNeeds(days),
        getMenu()
      ]);
      
      setInventoryData(inventoryNeeds.inventory_needs);
      setMenuItems(menu);
      
      // In a real app, this would be a call to the API
      // For this demo, we'll use simulated data
      setCurrentStock(simulatedStock);
    } catch (err) {
      setError('Failed to load inventory data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData();
  }, [days]);
  
  const handleDaysChange = (values) => {
    setDays(values[0]);
  };
  
  const getStatusBadge = (ingredient) => {
    const current = currentStock[ingredient]?.quantity || 0;
    const needed = inventoryData[ingredient]?.quantity || 0;
    
    if (current >= needed) {
      return <Badge variant="success">Sufficient</Badge>;
    } else if (current >= needed * 0.5) {
      return <Badge variant="warning">Low</Badge>;
    } else {
      return <Badge variant="danger">Critical</Badge>;
    }
  };

  const getStockLevel = (ingredient) => {
    const current = currentStock[ingredient]?.quantity || 0;
    const needed = inventoryData[ingredient]?.quantity || 0;
    
    if (current >= needed) {
      return { color: "green", percentage: 100 };
    } else if (current === 0) {
      return { color: "red", percentage: 0 };
    } else {
      const percentage = (current / needed) * 100;
      return { 
        color: percentage > 50 ? "yellow" : "red", 
        percentage 
      };
    }
  };
  
  const convertToAlternateUnit = (ingredient, quantity, unit) => {
    // Conversion logic for display purposes
    if (ingredient === 'chicken' && unit === 'kg' && displayUnit === 'pieces') {
      return {
        quantity: Math.ceil(quantity / 0.25),
        unit: 'pieces'
      };
    } else if (ingredient === 'flour' && unit === 'kg' && displayUnit === 'cups') {
      return {
        quantity: Math.round(quantity * 8),
        unit: 'cups'
      };
    } else if (ingredient === 'oil' && unit === 'liter' && displayUnit === 'cups') {
      return {
        quantity: Math.round(quantity * 4),
        unit: 'cups'
      };
    }
    
    return { quantity, unit };
  };
  
  const handleExportCSV = () => {
    // Format inventory data as CSV
    const headers = ["Ingredient", "Required Quantity", "Unit", "Current Stock", "Status"];
    const rows = Object.entries(inventoryData).map(([ingredient, details]) => {
      const current = currentStock[ingredient]?.quantity || 0;
      const status = current >= details.quantity ? "Sufficient" : (current >= details.quantity * 0.5 ? "Low" : "Critical");
      return [
        ingredient.replace('_', ' '),
        details.quantity,
        details.unit,
        current,
        status
      ];
    });
    
    const csvData = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-plan-${days}-days-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Inventory Planner</h2>
        <div className="flex space-x-4">
          <Select value={displayUnit} onValueChange={setDisplayUnit}>
            <option value="default">Default Units</option>
            <option value="pieces">Kitchen Units</option>
          </Select>
          <Button onClick={handleExportCSV} className="bg-green-600 hover:bg-green-700">
            Export to CSV
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory Projection</CardTitle>
          <CardDescription>
            Calculate required ingredients for upcoming orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <p className="mb-2">Project inventory for {days} days</p>
            <Slider
              defaultValue={[7]}
              max={30}
              min={1}
              step={1}
              onValueChange={handleDaysChange}
              className="w-full"
            />
            <div className="flex justify-between text-xs mt-1">
              <span>1 day</span>
              <span>15 days</span>
              <span>30 days</span>
            </div>
          </div>
          
          <Tabs defaultValue="table">
            <div className="flex space-x-4 mb-4">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="status">Status View</TabsTrigger>
            </div>
            
            <TabsContent value="table">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading...</p>
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(inventoryData).map(([ingredient, details]) => {
                      const converted = convertToAlternateUnit(
                        ingredient, 
                        details.quantity, 
                        details.unit
                      );
                      
                      // Also convert current stock to same unit
                      const currentConverted = currentStock[ingredient] ? 
                        convertToAlternateUnit(
                          ingredient, 
                          currentStock[ingredient].quantity, 
                          currentStock[ingredient].unit
                        ) : 
                        { quantity: 0, unit: converted.unit };
                      
                      return (
                        <TableRow key={ingredient}>
                          <TableCell className="font-medium">
                            {ingredient.replace('_', ' ')}
                          </TableCell>
                          <TableCell>{converted.quantity} {converted.unit}</TableCell>
                          <TableCell>{currentConverted.quantity} {currentConverted.unit}</TableCell>
                          <TableCell>{getStatusBadge(ingredient)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
            
            <TabsContent value="status">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <p>Loading...</p>
                </div>
              ) : error ? (
                <div className="text-red-500">{error}</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(inventoryData).map(([ingredient, details]) => {
                    const stockLevel = getStockLevel(ingredient);
                    const current = currentStock[ingredient]?.quantity || 0;
                    
                    return (
                      <div key={ingredient} className="flex items-center space-x-4">
                        <div className="w-32 font-medium">
                          {ingredient.replace('_', ' ')}
                        </div>
                        <div className="flex-grow">
                          <ProgressBar 
                            value={current} 
                            max={details.quantity}
                            color={stockLevel.color}
                          />
                        </div>
                        <div className="w-24 text-right text-sm">
                          {current} / {details.quantity.toFixed(1)} {details.unit}
                        </div>
                        <div className="w-24">
                          {getStatusBadge(ingredient)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Shopping List</CardTitle>
          <CardDescription>
            What you need to buy for the next {days} days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.keys(inventoryData).length > 0 ? (
              <>
                <ul className="list-disc pl-5 space-y-4">
                  {Object.entries(inventoryData).map(([ingredient, details]) => {
                    const currentQty = currentStock[ingredient]?.quantity || 0;
                    const requiredQty = details.quantity;
                    const needToBuy = Math.max(0, requiredQty - currentQty).toFixed(2);
                    
                    if (needToBuy <= 0) {
                      return null;
                    }
                    
                    const converted = convertToAlternateUnit(
                      ingredient, 
                      parseFloat(needToBuy), 
                      details.unit
                    );
                    
                    return (
                      <li key={ingredient} className="pb-2 border-b">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{ingredient.replace('_', ' ')}: </span>
                            <span className="text-lg">{converted.quantity} {converted.unit}</span>
                            
                            {ingredient === 'chicken' && displayUnit !== 'pieces' && (
                              <span className="text-gray-500 ml-2">
                                (approximately {Math.ceil(parseFloat(needToBuy) / 0.25)} pieces)
                              </span>
                            )}
                          </div>
                          <Badge 
                            variant={parseFloat(needToBuy) > requiredQty * 0.7 ? "danger" : parseFloat(needToBuy) > requiredQty * 0.3 ? "warning" : "success"}
                          >
                            {parseFloat(needToBuy) > requiredQty * 0.7 ? "Critical" : parseFloat(needToBuy) > requiredQty * 0.3 ? "Important" : "Normal"}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-gray-500 mt-1">
                          {currentQty > 0 ? (
                            <>Current stock: {currentQty} {details.unit} &middot; Need: {requiredQty} {details.unit}</>
                          ) : (
                            <>Out of stock! Full amount needed.</>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
                
                {Object.entries(inventoryData).every(([ingredient, details]) => {
                  const currentQty = currentStock[ingredient]?.quantity || 0;
                  return currentQty >= details.quantity;
                }) && (
                  <div className="text-center text-green-600 py-4 border-2 border-green-200 rounded-md bg-green-50">
                    <p className="font-medium">You have sufficient stock for all ingredients!</p>
                    <p className="text-sm text-green-500">No shopping needed for the next {days} days</p>
                  </div>
                )}
                
                <div className="bg-blue-50 p-4 rounded-md text-blue-700 border border-blue-100 mt-6">
                  <h4 className="font-medium mb-2">Shopping Tips</h4>
                  <ul className="text-sm space-y-1">
                    <li>Buying ingredients in bulk can save 15-20% on costs</li>
                    <li>Check for freshness when purchasing chicken and eggs</li>
                    <li>Consider shopping at the wholesale market for better pricing</li>
                    <li>These calculations include a 20% safety margin</li>
                  </ul>
                </div>
              </>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No shopping recommendations available.
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            onClick={() => fetchData()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Refresh Data
          </Button>
          <Button 
            onClick={handleExportCSV}
            className="bg-green-600 hover:bg-green-700"
          >
            Export Shopping List
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Cost Analysis</CardTitle>
          <CardDescription>
            Estimated costs for the projected inventory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <p>Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ingredient</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Cost (NTD)</TableHead>
                      <TableHead>Total Cost (NTD)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.entries(inventoryData).map(([ingredient, details]) => {
                      // Cost assumptions
                      const unitCosts = {
                        chicken: 180, // NTD per kg
                        salted_egg: 12, // NTD per piece
                        flour: 50, // NTD per kg
                        oil: 120, // NTD per liter
                        egg: 6 // NTD per piece
                      };
                      
                      const currentQty = currentStock[ingredient]?.quantity || 0;
                      const requiredQty = details.quantity;
                      const needToBuy = Math.max(0, requiredQty - currentQty);
                      const unitCost = unitCosts[ingredient] || 0;
                      const totalCost = needToBuy * unitCost;
                      
                      return (
                        <TableRow key={ingredient}>
                          <TableCell className="font-medium">
                            {ingredient.replace('_', ' ')}
                          </TableCell>
                          <TableCell>
                            {needToBuy.toFixed(2)} {details.unit}
                          </TableCell>
                          <TableCell>
                            {unitCost} / {details.unit}
                          </TableCell>
                          <TableCell>
                            {totalCost.toFixed(0)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Estimated Cost:</span>
                  <span className="text-xl font-bold">
                    {Object.entries(inventoryData).reduce((total, [ingredient, details]) => {
                      const unitCosts = {
                        chicken: 180,
                        salted_egg: 12,
                        flour: 50,
                        oil: 120,
                        egg: 6
                      };
                      
                      const currentQty = currentStock[ingredient]?.quantity || 0;
                      const requiredQty = details.quantity;
                      const needToBuy = Math.max(0, requiredQty - currentQty);
                      const unitCost = unitCosts[ingredient] || 0;
                      
                      return total + (needToBuy * unitCost);
                    }, 0).toFixed(0)} NTD
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPlanner;