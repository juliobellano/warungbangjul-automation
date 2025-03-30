'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/services/UserContext';
import { submitOrder, getOrders } from '@/services/api';
import { useApiCall } from '@/services/useApi';
import { OrderResponse, Order } from '@/services/types';
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle, AlertCircle, Clock, User, Package } from 'lucide-react';

// Menu items from the backend (normally would fetch this from API)
const MENU_ITEMS = [
  {
    code: 'SE',
    name: 'Chicken with Salted Egg',
    price: 130,
    description: 'Crispy chicken pieces tossed in a rich, creamy salted egg sauce.',
    image: 'bg-gradient-to-r from-amber-100 to-amber-200'
  },
  {
    code: 'T',
    name: 'Sunny Side Up Egg',
    price: 15,
    description: 'Simple and classic sunny side up egg, prepared to perfection.',
    image: 'bg-gradient-to-r from-yellow-100 to-yellow-200'
  }
];

type CartItem = {
  code: string;
  name: string;
  price: number;
  quantity: number;
};

export default function Home() {
  const { userName } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  
  const submitOrderApi = useApiCall<OrderResponse, [string]>(submitOrder);
  const getOrdersApi = useApiCall<Order[], [Date | null, Date | null, string | null]>(getOrders);
  
  // Fetch today's orders on component mount
  useEffect(() => {
    fetchTodaysOrders();
  }, []);
  
  // Fetch today's orders from the API
  const fetchTodaysOrders = async () => {
    try {
      // Start date: beginning of today (midnight)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // End date: end of today (23:59:59)
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const orders = await getOrdersApi.execute(today, endOfDay, null);
      if (orders && orders.length > 0) {
        console.log('Today\'s orders fetched:', orders);
        console.log('First order sample structure:', orders[0]);
        console.log('Total price property:', orders[0].total_price);
        console.log('Total amount property:', (orders[0] as any).total_amount);
        console.log('Available properties:', Object.keys(orders[0]));
        setTodaysOrders(orders);
      }
    } catch (error) {
      console.error('Error fetching today\'s orders:', error);
    }
  };
  
  // Calculate cart totals
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Reset order status when cart changes
  useEffect(() => {
    if (cart.length > 0) {
      setOrderSuccess(null);
      setError(null);
    }
  }, [cart]);
  
  // Add item to cart
  const addToCart = (menuItem: typeof MENU_ITEMS[0]) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === menuItem.code);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevCart.map(item => 
          item.code === menuItem.code 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prevCart, { 
          code: menuItem.code,
          name: menuItem.name,
          price: menuItem.price,
          quantity: 1
        }];
      }
    });
  };
  
  // Update item quantity
  const updateQuantity = (code: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(code);
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.code === code 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (code: string) => {
    setCart(prevCart => prevCart.filter(item => item.code !== code));
  };
  
  // Clear cart
  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };
  
  // Format order in the backend-compatible format
  const formatOrderForBackend = (): string => {
    if (!userName) return '';
    
    const orderItems = cart.map(item => `${item.quantity}${item.code}`).join(' + ');
    return `${userName} ${orderItems}`;
  };
  
  // Calculate total for an individual order (for the orders list)
  const calculateOrderTotalPrice = (order: Order): number => {
    if (!order || !order.items || !Array.isArray(order.items)) {
      return 0;
    }
    
    // If order has a pre-calculated total and it's not zero, use it
    if (order.total_price) {
      return order.total_price;
    }
    
    // Otherwise calculate from items
    return order.items.reduce((sum, item) => {
      if (!item) return sum;
      // Use item's total_price if available, or calculate from quantity and price_per_item
      const itemTotal = item.total_price || (item.quantity * (item.price_per_item || 0));
      return sum + (itemTotal || 0);
    }, 0);
  };
  
  // Format price for display
  const formatPrice = (price: number | undefined | null): string => {
    if (price === undefined || price === null) {
      return '0'; // Return '0' for undefined or null prices
    }
    return price.toString();
  };
  
  // Format time for display
  const formatTime = (dateString: string | undefined | null): string => {
    if (!dateString) return 'Unknown time';
    
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format as HH:MM AM/PM
      return date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };
  
  // Submit order to backend
  const handleSubmitOrder = async () => {
    if (cart.length === 0 || !userName) return;
    
    const orderText = formatOrderForBackend();
    
    try {
      const response = await submitOrderApi.execute(orderText);
      console.log('Order success response:', response);
      
      // Fix missing prices by manually updating them from our cart data
      const fixedOrderItems = response.order.items.map(item => {
        // Find the matching cart item
        const cartItem = cart.find(cartItem => cartItem.code === item.code);
        
        return {
          ...item,
          // Use cart price if API price is missing or zero
          price_per_item: item.price_per_item || (cartItem?.price || 0),
          total_price: item.total_price || (cartItem ? cartItem.price * item.quantity : 0)
        };
      });
      
      // Create fixed response with updated prices
      const fixedResponse = {
        ...response,
        order: {
          ...response.order,
          items: fixedOrderItems,
          total_price: response.order.total_price || cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        }
      };
      
      console.log('Fixed order response:', fixedResponse);
      setOrderSuccess(fixedResponse);
      clearCart();
      
      // Refresh the recent orders list after a short delay
      // to ensure the new order is included in the API response
      setTimeout(() => {
        fetchTodaysOrders();
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred while processing your order';
      setError(errorMessage);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
      {/* Personalized welcome message */}
      {userName && (
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6 mb-8 border border-orange-100 shadow-sm">
          <h2 className="text-2xl font-bold text-orange-800">
            Welcome back, {userName}!
          </h2>
          <p className="text-orange-600 mt-1">
            Ready to place some orders at Warung Bang Jul today?
          </p>
        </div>
      )}
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Order Menu</h1>
        
        {/* Cart button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-orange-500 text-white p-3 rounded-full hover:bg-orange-600 transition-colors"
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Order success message */}
      {orderSuccess && (
        <div className="mb-8 bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
          <div className="flex items-start">
            <CheckCircle className="mr-3 h-5 w-5 text-green-500 mt-0.5" />
            <div className="w-full">
              <h3 className="font-medium">Order Placed Successfully!</h3>
              <p className="mt-1 text-sm">Thank you {userName} for ordering, your order has been received.</p>
              <div className="mt-3 bg-white bg-opacity-50 p-3 rounded-md">
                <h4 className="font-medium text-sm">Order Summary:</h4>
                <ul className="mt-1 space-y-1">
                  {orderSuccess.order.items && orderSuccess.order.items.map((item, index) => {
                    const itemTotal = item.total_price || (item.quantity * (item.price_per_item || 0));
                    return (
                      <li key={index} className="text-sm flex justify-between">
                        <span>{item.quantity} x {item.name}</span>
                        <span className="font-medium">{formatPrice(itemTotal)}</span>
                      </li>
                    );
                  })}
                </ul>
                <div className="mt-2 pt-2 border-t border-green-100 flex justify-between">
                  <span className="font-bold text-sm">Total:</span>
                  <span className="font-bold text-sm">
                    {formatPrice(orderSuccess.order.total_price || calculateOrderTotalPrice(orderSuccess.order))}
                  </span>
                </div>
              </div>
              <div className="mt-2 text-xs text-gray-600">
                Order ID: {orderSuccess.order_id}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          <div className="flex">
            <AlertCircle className="mr-3 h-5 w-5 text-red-500" />
            <div>
              <h3 className="font-medium">Order Error</h3>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Menu section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MENU_ITEMS.map((item) => (
          <div 
            key={item.code}
            className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
          >
            <div className={`h-40 ${item.image} relative`}></div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <span className="font-bold text-orange-500">{item.price}</span>
              </div>
              <p className="text-gray-600 text-sm mt-1 mb-4">{item.description}</p>
              <button
                onClick={() => addToCart(item)}
                className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
              >
                <Plus size={16} className="mr-2" />
                Add to Order
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Cart modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex">
          <div className="relative bg-white w-full max-w-md m-auto rounded-lg shadow-xl">
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">Your Order</h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-4">
              {cart.length === 0 ? (
                <p className="text-center text-gray-500 py-6">Your cart is empty</p>
              ) : (
                <>
                  <ul className="divide-y">
                    {cart.map((item) => (
                      <li key={item.code} className="py-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium">{item.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.price} × {item.quantity} = {item.price * item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.code, item.quantity - 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.code, item.quantity + 1)}
                              className="p-1 rounded-full hover:bg-gray-100"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.code)}
                              className="p-1 rounded-full hover:bg-gray-100 text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{cartTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t">
              <div className="flex space-x-2">
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || !userName || submitOrderApi.isLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitOrderApi.isLoading ? 'Processing...' : 'Place Order'}
                </button>
              </div>
              
              {!userName && (
                <p className="mt-2 text-xs text-red-500">
                  Please enter your name in the welcome screen to place an order.
                </p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Your order will be submitted as: {cart.length > 0 ? formatOrderForBackend() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Today's Orders Section */}
      <div className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Today's Orders</h2>
          <button 
            onClick={fetchTodaysOrders}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            <Clock size={16} className="mr-1" />
            Refresh
          </button>
        </div>
        
        {getOrdersApi.isLoading ? (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">Loading today's orders...</p>
          </div>
        ) : todaysOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order Details
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todaysOrders.map((order) => {
                  console.log("Order object structure:", order);
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <User size={14} className="text-orange-600" />
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {order.items && order.items.map((item, index) => (
                            <span key={index} className="inline-flex items-center mr-2">
                              <Package size={14} className="mr-1 text-gray-500" />
                              {item.quantity}x {item.name}
                              {index < (order.items?.length || 0) - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {(order as any).total_amount || order.total_price || '0'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Clock size={14} className="text-gray-400 mr-1" />
                          <span className="text-sm text-gray-600">
                            {(() => {
                              try {
                                return new Date(order.created_at).toLocaleTimeString([], { 
                                  hour: '2-digit', 
                                  minute: '2-digit'
                                });
                              } catch (e) {
                                return 'Unknown time';
                              }
                            })()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No orders placed today</p>
          </div>
        )}
      </div>
    </div>
  );
}
