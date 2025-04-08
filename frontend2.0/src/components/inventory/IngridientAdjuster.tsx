import { useState } from 'react';
import { Check, AlertTriangle, Plus, Minus } from 'lucide-react';
import { DetectedIngredient } from '@/services/types';

interface IngredientAdjusterProps {
  ingredients: DetectedIngredient[];
  onUpdateQuantity: (ingredientName: string, newQuantity: number) => void;
}

export default function IngredientAdjuster({ 
  ingredients, 
  onUpdateQuantity 
}: IngredientAdjusterProps) {
  // Format ingredient name
  const formatIngredientName = (name: string): string => {
    return name.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  return (
    <div className="w-full">
      <h3 className="font-medium text-gray-800 mb-4">Detected Ingredients</h3>
      
      {ingredients.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-lg">
          <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <p className="text-gray-600">No ingredients detected</p>
        </div>
      ) : (
        <div className="space-y-4">
          {ingredients.map((ingredient, index) => (
            <IngredientItem 
              key={`${ingredient.ingredient_name}-${index}`}
              ingredient={ingredient}
              onUpdateQuantity={onUpdateQuantity}
              formatIngredientName={formatIngredientName}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface IngredientItemProps {
  ingredient: DetectedIngredient;
  onUpdateQuantity: (ingredientName: string, newQuantity: number) => void;
  formatIngredientName: (name: string) => string;
}

function IngredientItem({ 
  ingredient, 
  onUpdateQuantity,
  formatIngredientName
}: IngredientItemProps) {
  const [quantity, setQuantity] = useState(ingredient.suggested_quantity);
  const isConfident = ingredient.confidence >= 0.7;
  
  const handleQuantityChange = (newValue: number) => {
    if (newValue >= 0) {
      setQuantity(newValue);
      onUpdateQuantity(ingredient.ingredient_name, newValue);
    }
  };
  
  return (
    <div className={`p-4 rounded-lg border ${
      ingredient.isAdjusted 
        ? 'border-blue-300 bg-blue-50' 
        : isConfident 
          ? 'border-green-200 bg-green-50'
          : 'border-yellow-200 bg-yellow-50'
    }`}>
      <div className="flex justify-between">
        <div className="flex items-start">
          <div className={`p-1 rounded-full mr-2 ${
            isConfident ? 'bg-green-200' : 'bg-yellow-200'
          }`}>
            {isConfident ? (
              <Check size={16} className="text-green-700" />
            ) : (
              <AlertTriangle size={16} className="text-yellow-700" />
            )}
          </div>
          <div>
            <h4 className="font-medium text-gray-800">
              {formatIngredientName(ingredient.ingredient_name)}
            </h4>
            <div className="flex items-center mt-1">
              <span className="text-xs bg-white px-2 py-1 rounded text-gray-600">
                Confidence: {(ingredient.confidence * 100).toFixed(0)}%
              </span>
              {ingredient.count && (
                <span className="text-xs bg-white px-2 py-1 rounded text-gray-600 ml-2">
                  Count: {ingredient.count}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity - 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Minus size={14} />
          </button>
          
          <div className="flex items-center mx-2">
            <input
              type="number"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseFloat(e.target.value) || 0)}
              className="w-16 p-1 text-center border border-gray-300 rounded"
              min="0"
              step="1"
            />
            <span className="ml-1 text-gray-600">{ingredient.unit}</span>
          </div>
          
          <button
            type="button"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}