import Image from 'next/image';
import Link from 'next/link';

interface RestaurantCardProps {
  id: string;
  name: string;
  rating: number;
  deliveryFee: string;
  deliveryTime: string;
  image: string;
}

export default function RestaurantCard({ 
  id,
  name, 
  rating, 
  deliveryFee, 
  deliveryTime, 
  image 
}: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${id}`} className="block">
      <div className="bg-white rounded-lg overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1 hover-pulse">
        <div className="relative h-36 md:h-48 bg-gray-300 overflow-hidden group">
          {/* Uncomment when images are available */}
          {/* <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, 50vw"
          /> */}
        </div>
        <div className="p-3 md:p-4">
          <h3 className="font-medium text-lg group-hover:text-blue-600 transition-colors">{name}</h3>
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center text-orange-400 transition-all hover:text-orange-500 hover:scale-105">
              <span>★</span>
              <span className="ml-1">{rating}</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm">{deliveryFee}</span>
            </div>
            <div className="flex items-center text-orange-400 transition-all hover:text-orange-500 hover:scale-105">
              <span className="text-sm">{deliveryTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
} 