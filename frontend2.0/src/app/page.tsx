'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@/services/UserContext';
import { submitOrder, getOrders } from '@/services/api';
import { useApiCall } from '@/services/useApi';
import { OrderResponse, Order } from '@/services/types';
import { Minus, Plus, ShoppingCart, Trash2, CheckCircle, AlertCircle, Clock, User, Package, Loader2 } from 'lucide-react';
import Image from 'next/image';

// Menu items from the backend (normally would fetch this from API)
const MENU_ITEMS = [
  {
    code: 'SE',
    name: 'Chicken with Salted Egg',
    price: 130,
    description: 'Crispy chicken pieces tossed in a rich, creamy salted egg sauce.',
    image: 'https://res.cloudinary.com/dbxr2m5gb/image/upload/v1743312201/a63285a7a907ce7b0a64f79632ade72328db78c8bdfd7be9d5c45b6a17cc1373_v0pbli.png',
    useCloudinary: true
  },
  {
    code: 'T',
    name: 'Sunny Side Up Egg',
    price: 15,
    description: 'Simple and classic sunny side up egg, prepared to perfection.',
    image: 'https://res.cloudinary.com/dbxr2m5gb/image/upload/v1743310424/us1gayd2onmthnzwatl6.png',
    useCloudinary: true
  }
];

type CartItem = {
  code: string;
  name: string;
  price: number;
  quantity: number;
};

// Alert component for success and error messages
interface AlertProps {
  type: 'success' | 'error';
  title: string;
  message: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  children?: React.ReactNode;
}

const Alert = ({ type, title, message, icon, onDismiss, children }: AlertProps) => {
  const styles = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: icon || <CheckCircle className="mr-3 h-5 w-5 text-green-500 mt-0.5" />,
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: icon || <AlertCircle className="mr-3 h-5 w-5 text-red-500" />,
    }
  };

  const style = styles[type];

  return (
    <div className={`mb-8 ${style.bg} border ${style.border} rounded-lg p-4 ${style.text}`}>
      <div className="flex items-start">
        {style.icon}
        <div className="w-full">
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{title}</h3>
            {onDismiss && (
              <button 
                onClick={onDismiss} 
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Dismiss"
              >
                <span className="text-xl">×</span>
              </button>
            )}
          </div>
          <p className="mt-1 text-sm">{message}</p>
          {children}
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
interface SkeletonProps {
  className?: string;
}

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default function Home() {
  const { userName } = useUser();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<OrderResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(true);
  
  const submitOrderApi = useApiCall<OrderResponse, [string]>(submitOrder);
  const getOrdersApi = useApiCall<Order[], [Date | null, Date | null, string | null]>(getOrders);
  
  // Fetch today's orders on component mount
  useEffect(() => {
    fetchTodaysOrders();
    
    // Simulate menu loading for demonstration
    const timer = setTimeout(() => {
      setIsMenuLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
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
    <main className="max-w-7xl mx-auto px-4 py-6 sm:py-8 sm:px-6 md:px-8">
      {/* Personalized welcome message */}
      {userName && (
        <section className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8 border border-orange-100 shadow-sm" aria-label="Welcome message">
          <h2 className="text-xl sm:text-2xl font-bold text-orange-800">
            Welcome back, {userName}!
          </h2>
          <p className="text-orange-600 mt-1 text-sm sm:text-base">
            Ready to place some orders at Warung Bang Jul today?
          </p>
        </section>
      )}
      
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Menu</h1>
        
        {/* Cart button */}
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative bg-orange-500 text-white p-2 sm:p-3 rounded-full hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          aria-label={`Open shopping cart with ${cartItemCount} items`}
          aria-haspopup="dialog"
        >
          <ShoppingCart size={20} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full" aria-hidden="true">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
      
      {/* Order success message */}
      {orderSuccess && (
        <Alert 
          type="success" 
          title="Order Placed Successfully!" 
          message={`Thank you ${userName} for ordering, your order has been received.`}
          onDismiss={() => setOrderSuccess(null)}
        >
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
        </Alert>
      )}
      
      {/* Error message */}
      {error && (
        <Alert 
          type="error" 
          title="Order Error" 
          message={error}
          onDismiss={() => setError(null)}
        />
      )}
      
      {/* Menu section */}
      <section aria-labelledby="menu-heading" className="mb-16">
        <h2 id="menu-heading" className="sr-only">Available menu items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {isMenuLoading ? (
            // Skeleton loaders for menu items
            <>
              {[1, 2].map((index) => (
                <div key={index} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden" aria-hidden="true">
                  <Skeleton className="h-64 sm:h-72 md:h-80" />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <Skeleton className="h-7 w-1/2" />
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </div>
                    <Skeleton className="h-4 w-3/4 mt-2" />
                    <Skeleton className="h-4 w-1/2 mt-1" />
                    <Skeleton className="h-12 w-full mt-5" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            MENU_ITEMS.map((item) => (
              <article 
                key={item.code}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
              >
                {item.useCloudinary ? (
                  <div className="h-64 sm:h-72 md:h-80 relative group-hover:opacity-95 transition-opacity overflow-hidden">
                    <Image 
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-white bg-opacity-90 text-orange-500 px-4 py-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        aria-label={`Quick add ${item.name} to cart`}
                      >
                        <Plus size={18} className="mr-1 inline-block" aria-hidden="true" /> Add to Cart
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={`h-64 sm:h-72 md:h-80 ${item.image} relative group-hover:opacity-95 transition-opacity`} aria-hidden="true">
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10">
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-white bg-opacity-90 text-orange-500 px-4 py-2 rounded-full shadow-md hover:bg-orange-500 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                        aria-label={`Quick add ${item.name} to cart`}
                      >
                        <Plus size={18} className="mr-1 inline-block" aria-hidden="true" /> Add to Cart
                      </button>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-800">{item.name}</h3>
                    <span className="font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full text-sm" aria-label={`Price: ${item.price}`}>{item.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mt-2 mb-5">{item.description}</p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                    aria-label={`Add ${item.name} to order`}
                  >
                    <Plus size={16} className="mr-2" aria-hidden="true" />
                    Add to Order
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
      
      {/* Cart modal */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex" 
          onClick={() => setIsCartOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-heading"
        >
          <div className="relative bg-white w-full max-w-md m-auto rounded-lg shadow-xl flex flex-col max-h-[90vh] sm:max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b">
              <div className="flex justify-between items-center">
                <h3 id="cart-heading" className="text-xl font-bold text-gray-800">Your Order</h3>
                <button 
                  onClick={() => setIsCartOpen(false)}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none"
                  aria-label="Close cart"
                >
                  <span className="text-2xl" aria-hidden="true">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-4 overflow-y-auto flex-grow">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <ul className="divide-y">
                    {cart.map((item) => (
                      <li key={item.code} className="py-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h4 className="font-medium text-gray-800">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.price} × {item.quantity} = {item.price * item.quantity}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => updateQuantity(item.code, item.quantity - 1)}
                              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.code, item.quantity + 1)}
                              className="p-1 rounded-full hover:bg-gray-100 focus:outline-none"
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                            <button 
                              onClick={() => removeFromCart(item.code)}
                              className="p-1 rounded-full hover:bg-gray-100 text-red-500 focus:outline-none"
                              aria-label="Remove item"
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
                      <span className="text-orange-600">{cartTotal}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="p-4 border-t sticky bottom-0 bg-white shadow-md">
              <div className="flex space-x-2">
                <button
                  onClick={clearCart}
                  disabled={cart.length === 0}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-1"
                >
                  Clear
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={cart.length === 0 || !userName || submitOrderApi.isLoading}
                  className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1"
                >
                  {submitOrderApi.isLoading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
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
      
      {/* Mobile add to cart floating button - shows when items in cart */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-md md:hidden z-40" role="complementary" aria-label="Cart summary">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-orange-500 text-white px-4 py-3 rounded-md hover:bg-orange-600 transition-colors flex items-center justify-center"
            aria-label={`View order with ${cartItemCount} items totaling ${cartTotal}`}
          >
            <ShoppingCart size={18} className="mr-2" aria-hidden="true" />
            View Order ({cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}) - {cartTotal}
          </button>
        </div>
      )}
      
      {/* Today's Orders Section */}
      <section aria-labelledby="orders-heading" className="mt-16">
        <div className="flex justify-between items-center mb-6">
          <h2 id="orders-heading" className="text-2xl font-bold text-gray-900">Today's Orders</h2>
          <button 
            onClick={fetchTodaysOrders}
            disabled={getOrdersApi.isLoading}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-md px-2 py-1 disabled:opacity-50"
            aria-label="Refresh orders list"
          >
            {getOrdersApi.isLoading ? (
              <Loader2 size={16} className="mr-1 animate-spin" aria-hidden="true" />
            ) : (
              <Clock size={16} className="mr-1" aria-hidden="true" />
            )}
            {getOrdersApi.isLoading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        
        {getOrdersApi.isLoading ? (
          <div className="bg-white p-12 rounded-lg shadow-sm text-center">
            <Loader2 size={30} className="animate-spin mx-auto text-orange-500 mb-4" />
            <p className="text-gray-500">Loading today's orders...</p>
          </div>
        ) : getOrdersApi.error ? (
          <div className="bg-white p-8 rounded-lg shadow-sm">
            <div className="flex items-center justify-center flex-col text-center">
              <AlertCircle size={30} className="text-red-500 mb-2" />
              <p className="text-red-600 font-medium">Failed to load orders</p>
              <p className="text-gray-500 text-sm mt-1 mb-4">{getOrdersApi.error.message}</p>
              <button
                onClick={fetchTodaysOrders}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : todaysOrders.length > 0 ? (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
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
                          <div className="text-sm text-gray-900 max-w-[250px] lg:max-w-full overflow-hidden">
                            {order.items && order.items.map((item, index) => (
                              <span key={index} className="inline-flex items-center mr-2 mb-1">
                                <Package size={14} className="mr-1 text-gray-500 flex-shrink-0" />
                                <span className="truncate">
                                  {item.quantity}x {item.name}
                                </span>
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
                            <Clock size={14} className="text-gray-400 mr-1 flex-shrink-0" />
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

            {/* Mobile view for small screens */}
            <div className="lg:hidden mt-4 space-y-4 p-4">
              <h3 className="text-gray-500 text-xs uppercase font-medium tracking-wider mb-2">Mobile View</h3>
              {todaysOrders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <User size={14} className="text-orange-600" />
                    </div>
                    <div className="ml-3">
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-xs text-gray-500 flex items-center mt-0.5">
                        <Clock size={12} className="mr-1" />
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
                      </div>
                    </div>
                    <div className="ml-auto">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {(order as any).total_amount || order.total_price || '0'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm">
                    <div className="font-medium text-xs uppercase tracking-wider text-gray-500 mb-1">Items:</div>
                    <div className="space-y-1">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="flex items-start">
                          <Package size={12} className="mr-1 text-gray-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">
                            {item.quantity}x {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-lg shadow-sm text-center">
            <Package size={30} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">No orders placed today</p>
            <button
              onClick={fetchTodaysOrders}
              className="mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
            >
              Refresh
            </button>
          </div>
        )}
      </section>
    </main>
  );
}
