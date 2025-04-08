import { useState } from 'react';
import { Check } from 'lucide-react';

interface InventoryItemProps {
  id: string;
  name: string;
  amount: number;
  unit: string;
  category: string;
}

export default function InventoryItem({ id, name, amount, unit, category }: InventoryItemProps) {
  const [isSelected, setIsSelected] = useState(false);

  // Get emoji based on category
  const getCategoryEmoji = (category: string) => {
    const emojis = {
      protein: '🍗',
      dairy: '🥛',
      dry: '🌾',
      spices: '🌶️',
      condiments: '🧂',
      vegetables: '🥦',
      herbs: '🌿'
    };
    return emojis[category as keyof typeof emojis] || '🔗';
  };

  const handleToggleSelect = () => {
    setIsSelected(!isSelected);
  };

  return (
    <button 
      onClick={handleToggleSelect}
      className={`w-full rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 active:scale-95
        ${isSelected ? 'bg-green-100 border-2 border-green-500' : 'bg-white border border-gray-200'}`}
    >
      <div className="flex items-center mb-3 relative">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSelected ? 'text-green-500' : 'text-gray-600'} bg-white/60`}>
          <span className="text-lg">{getCategoryEmoji(category)}</span>
        </div>
        <div className="ml-3 font-medium text-gray-800 flex items-center">
          {name}
          {isSelected && (
            <Check size={16} className="ml-2 text-green-500" />
          )}
        </div>
      </div>
      <div className="flex items-baseline">
        <span className="text-3xl font-bold text-gray-900">{amount}</span>
        <span className="ml-1 text-gray-500 text-sm">{unit}</span>
      </div>
    </button>
  );
} 