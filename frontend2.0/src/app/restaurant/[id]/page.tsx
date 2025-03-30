'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

// Mock restaurant data - in a real app you would fetch this from an API
const getRestaurantData = (id: string) => {
  const restaurants = {
    '1': {
      id: '1',
      name: 'Tasty Treat Gallery',
      description: 'A cozy restaurant serving delicious treats and comfort food.',
      rating: 4.7,
      deliveryFee: 'Free',
      deliveryTime: '20 min',
      image: '/images/restaurant1.jpg',
      address: '123 Main St, San Francisco',
      cuisine: 'American, Italian',
      products: [
        { id: '1', name: 'Pizza Calzone European', price: 32, image: '/images/pizza1.jpg' },
        { id: '2', name: 'Burger Bistro', price: 40, image: '/images/burger1.jpg' }
      ]
    },
    '2': {
      id: '2',
      name: 'Burger Palace',
      description: 'Specialty burger restaurant with unique flavors and premium ingredients.',
      rating: 4.5,
      deliveryFee: 'Free',
      deliveryTime: '25 min',
      image: '/images/restaurant2.jpg',
      address: '456 Burger Ave, New York',
      cuisine: 'American, Burgers',
      products: [
        { id: '2', name: 'Burger Bistro', price: 40, image: '/images/burger1.jpg' },
        { id: '5', name: 'Bullseye Burgers', price: 94, image: '/images/burger4.jpg' }
      ]
    },
    '3': {
      id: '3',
      name: 'Warung Bang Jul',
      description: 'Authentic Indonesian cuisine with a focus on flavorful dishes and fresh ingredients.',
      rating: 4.8,
      deliveryFee: 'Free',
      deliveryTime: '15 min',
      image: '/images/restaurant3.jpg',
      address: '789 Spice Road, Jakarta',
      cuisine: 'Indonesian, Asian',
      products: [
        { id: '3', name: 'Chicken Salted Egg', price: 45, image: '/images/chicken1.jpg' },
        { id: '4', name: 'Sunny Side Up Egg', price: 15, image: '/images/egg1.jpg' }
      ]
    }
  };
  
  return restaurants[id as keyof typeof restaurants];
};

export default function RestaurantDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const restaurant = getRestaurantData(params.id);
  
  if (!restaurant) {
    return <div className="p-6 text-center">Restaurant not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto bg-white min-h-screen p-6">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => router.back()}
          className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-colors mr-4"
        >
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold">{restaurant.name}</h1>
      </div>
      
      <div className="relative h-64 w-full rounded-lg bg-gray-300 mb-6">
        {/* Image would go here */}
      </div>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">{restaurant.description}</p>
        
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Rating: {restaurant.rating} ★
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Delivery: {restaurant.deliveryFee}
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            Time: {restaurant.deliveryTime}
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {restaurant.cuisine}
          </div>
        </div>
        
        <div className="text-gray-600 mb-6">
          <p>{restaurant.address}</p>
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">Menu</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurant.products.map(product => (
          <Link 
            key={product.id} 
            href={`/product/${product.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-1">
              <div className="relative h-40 bg-gray-300">
                {/* Image would go here */}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-lg">{product.name}</h3>
                <p className="text-orange-500 font-semibold mt-1">${product.price}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
} 