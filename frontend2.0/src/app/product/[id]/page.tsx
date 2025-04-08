'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Heart, Check } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Recipe ingredient interface
interface Ingredient {
  name: string;
  quantity: number;
  unit: string;
}

// Mock product data - in a real app you would fetch this from an API
const getProductData = (id: string) => {
  const products = {
    '1': {
      id: '1',
      name: 'Pizza Calzone European',
      restaurant: 'Uttora Coffe House',
      description: 'Prosciutto e funghi is a pizza variety that is topped with tomato sauce.',
      rating: 4.7,
      deliveryFee: 'Free',
      deliveryTime: '20 min',
      price: 32,
      image: '/images/pizza1.jpg',
      sizes: ['10"', '14"', '16"'],
      defaultSize: '14"',
      ingredients: [
        { name: 'flour', quantity: 200, unit: 'g' },
        { name: 'cheese', quantity: 150, unit: 'g' },
        { name: 'tomato sauce', quantity: 100, unit: 'g' },
        { name: 'mushrooms', quantity: 80, unit: 'g' },
        { name: 'ham', quantity: 70, unit: 'g' }
      ]
    },
    '2': {
      id: '2',
      name: 'Burger Bistro',
      restaurant: 'Rose Garden',
      description: 'A juicy beef patty with lettuce, tomato, and special sauce on a brioche bun.',
      rating: 4.5,
      deliveryFee: 'Free',
      deliveryTime: '25 min',
      price: 40,
      image: '/images/burger1.jpg',
      sizes: ['Small', 'Medium', 'Large'],
      defaultSize: 'Medium',
      ingredients: [
        { name: 'beef patty', quantity: 150, unit: 'g' },
        { name: 'brioche bun', quantity: 1, unit: 'piece' },
        { name: 'cheese', quantity: 30, unit: 'g' },
        { name: 'lettuce', quantity: 20, unit: 'g' },
        { name: 'tomato', quantity: 30, unit: 'g' }
      ]
    },
    '3': {
      id: '3',
      name: 'Chicken Salted Egg',
      restaurant: 'Warung Bang Jul',
      description: 'Crispy chicken pieces tossed in a rich, creamy salted egg sauce.',
      rating: 4.8,
      deliveryFee: 'Free',
      deliveryTime: '15 min',
      price: 45,
      image: '/images/chicken1.jpg',
      sizes: ['Small', 'Medium', 'Large'],
      defaultSize: 'Medium',
      ingredients: [
        { name: 'chicken_breast', quantity: 150, unit: 'grams' },
        { name: 'salted_egg_yolk', quantity: 1.33, unit: 'pieces' },
        { name: 'flour_marinade', quantity: 10, unit: 'grams' },
        { name: 'flour_batter', quantity: 66.67, unit: 'grams' },
        { name: 'salt_marinade', quantity: 0.83, unit: 'grams' },
        { name: 'salt_batter', quantity: 1.67, unit: 'grams' },
        { name: 'fish_sauce', quantity: 2.5, unit: 'grams' },
        { name: 'msg', quantity: 0.83, unit: 'grams' },
        { name: 'garlic', quantity: 2.5, unit: 'grams' },
        { name: 'baking_powder', quantity: 0.83, unit: 'grams' },
        { name: 'white_pepper', quantity: 0.83, unit: 'grams' },
        { name: 'oyster_sauce', quantity: 2.5, unit: 'grams' },
        { name: 'condensed_milk', quantity: 3.33, unit: 'grams' },
        { name: 'chili_big', quantity: 1, unit: 'pieces' },
        { name: 'chili_small', quantity: 0.33, unit: 'pieces' },
        { name: 'lime_leaves', quantity: 1, unit: 'pieces' },
        { name: 'butter', quantity: 5, unit: 'grams' },
        { name: 'chicken_powder', quantity: 1.25, unit: 'grams' },
        { name: 'milk', quantity: 50, unit: 'mL' }
      ]
    },
    '4': {
      id: '4',
      name: 'Sunny Side Up Egg',
      restaurant: 'Warung Bang Jul',
      description: 'Simple and classic sunny side up egg.',
      rating: 4.3,
      deliveryFee: 'Free',
      deliveryTime: '10 min',
      price: 15,
      image: '/images/egg1.jpg',
      sizes: ['1 pc', '2 pcs', '3 pcs'],
      defaultSize: '1 pc',
      ingredients: [
        { name: 'chicken egg', quantity: 1, unit: 'piece' },
        { name: 'oil', quantity: 5, unit: 'ml' }
      ]
    }
  };
  
  return products[id as keyof typeof products];
};

export default function ProductDetail({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = getProductData(params.id);
  const [quantity, setQuantity] = useState(2);
  const [selectedSize, setSelectedSize] = useState(product?.defaultSize || product?.sizes[0]);
  const [selectedIngredients, setSelectedIngredients] = useState<number[]>([]);
  
  if (!product) {
    return <div className="p-6 text-center">Product not found</div>;
  }

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    setQuantity(quantity + 1);
  };

  const toggleIngredient = (index: number) => {
    setSelectedIngredients(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <button 
            onClick={() => router.back()}
            className="bg-gray-200 p-3 rounded-full hover:bg-gray-300 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-medium">Details</h1>
          <div className="w-10"></div> {/* Spacer for alignment */}
        </div>
        
        <div className="relative h-64 w-full rounded-xl bg-gray-300 mb-6 overflow-hidden">
          {/* Uncomment when you have actual images */}
          {/* <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
          /> */}
          <button className="absolute right-3 bottom-3 bg-white/80 p-2 rounded-full hover:bg-white transition-colors">
            <Heart size={22} className="text-gray-500" />
          </button>
        </div>
        
        <div className="mb-6">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm mb-3">
            <div className="w-6 h-6 rounded-full bg-red-500 mr-2"></div>
            <span>{product.restaurant}</span>
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
          <p className="text-gray-600 mb-4">{product.description}</p>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center text-orange-400">
              <span>★</span>
              <span className="ml-1">{product.rating}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <span>{product.deliveryFee}</span>
            </div>
            <div className="flex items-center text-orange-400">
              <span>{product.deliveryTime}</span>
            </div>
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="uppercase text-gray-500 text-sm font-medium mb-3">SIZE:</h3>
          <div className="flex space-x-4">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`h-14 w-14 rounded-full flex items-center justify-center transition-colors ${
                  selectedSize === size 
                    ? 'bg-orange-400 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <h3 className="uppercase text-gray-500 text-sm font-medium mb-3">INGREDIENTS</h3>
            {product.id === '3' && (
              <Link href="/product/4" className="text-blue-500 text-sm">
                See Sunny Side Up Egg →
              </Link>
            )}
            {product.id === '4' && (
              <Link href="/product/3" className="text-blue-500 text-sm">
                See Chicken Salted Egg →
              </Link>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {product.ingredients.map((ingredient, index) => {
              const isSelected = selectedIngredients.includes(index);
              return (
                <button 
                  key={index}
                  onClick={() => toggleIngredient(index)}
                  className={`relative w-24 h-24 rounded-lg flex flex-col items-center justify-center p-2 transition-all duration-300 
                    ${isSelected ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}
                    hover:shadow-md active:scale-95`}
                  title={`${ingredient.name.replace(/_/g, ' ')} (${ingredient.quantity} ${ingredient.unit})`}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <Check size={16} className="text-green-500" />
                    </div>
                  )}
                  
                  <div className="text-2xl mb-2">
                    {isSelected ? '✓' : ingredient.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="text-xs text-center line-clamp-2 mt-1">
                    {ingredient.name.split('_').join(' ')}
                  </div>
                  
                  <div className="text-xs text-gray-500 mt-1">
                    {ingredient.quantity} {ingredient.unit}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-white p-6 flex items-center justify-between">
          <div className="text-3xl font-bold">${product.price}</div>
          
          <div className="flex items-center">
            <div className="bg-gray-900 rounded-full flex items-center mr-4">
              <button 
                onClick={handleDecrement}
                className="h-10 w-10 flex items-center justify-center text-white"
              >
                -
              </button>
              <span className="text-white px-2">{quantity}</span>
              <button 
                onClick={handleIncrement}
                className="h-10 w-10 flex items-center justify-center text-white"
              >
                +
              </button>
            </div>
            
            <button className="bg-orange-400 hover:bg-orange-500 text-white py-3 px-6 rounded-full transition-colors">
              ADD TO CART
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 