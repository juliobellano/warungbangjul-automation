import Image from 'next/image';
import Link from 'next/link';

interface FoodCardProps {
  id: string;
  name: string;
  restaurant: string;
  price: number;
  image: string;
}

export default function FoodCard({ id, name, restaurant, price, image }: FoodCardProps) {
  return (
    <Link href={`/product/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover-pulse">
        <div className="relative h-20 bg-gray-300">
          {/* Uncomment when images are available */}
          {/* <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          /> */}
        </div>
        <div className="p-2">
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-gray-500">{restaurant}</p>
          <div className="flex justify-between items-center mt-2">
            <span className="font-medium">${price}</span>
            <button 
              onClick={(e) => {
                // Stop event propagation to prevent navigation when clicking the button
                e.preventDefault();
                e.stopPropagation();
              }} 
              className="bg-orange-400 text-white p-1 rounded-full transition-transform duration-200 hover:scale-110 hover:bg-orange-500 active:scale-95"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
} 