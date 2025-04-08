import { AlertTriangle, CheckCircle, Loader, X } from 'lucide-react';
import { DetectedIngredient } from '@/services/types';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  ingredients: DetectedIngredient[];
  onConfirm: () => Promise<void>;
  isConfirming: boolean;
  error: string | null;
  success: boolean;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  ingredients,
  onConfirm,
  isConfirming,
  error,
  success
}: ConfirmationModalProps) {
  if (!isOpen) return null;
  
  // Format ingredient name for display
  const formatIngredientName = (name: string): string => {
    return name.replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-medium text-lg text-gray-800">Confirm Inventory Update</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isConfirming}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {success ? (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">Inventory Updated!</h4>
              <p className="text-gray-600">
                {ingredients.length} ingredients have been successfully updated in your inventory.
              </p>
            </div>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                Please review the following ingredients before updating your inventory:
              </p>
              
              <div className="space-y-2 mb-4">
                {ingredients.map((ing, index) => (
                  <div key={`${ing.ingredient_name}-${index}`} className="flex justify-between p-2 border-b border-gray-100">
                    <div className="font-medium text-gray-800">
                      {formatIngredientName(ing.ingredient_name)}
                    </div>
                    <div className="text-blue-600">
                      {ing.suggested_quantity} {ing.unit}
                    </div>
                  </div>
                ))}
              </div>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 rounded-lg flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 border-t flex justify-end space-x-3">
          {success ? (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                disabled={isConfirming}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
                disabled={isConfirming}
              >
                {isConfirming ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Confirm Update'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}