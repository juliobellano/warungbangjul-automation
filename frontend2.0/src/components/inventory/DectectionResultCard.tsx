import { useState } from 'react';
import { AlertCircle, Eye, Download } from 'lucide-react';
import { getAnnotatedImageUrl } from '@/services/api';

interface DetectionResultCardProps {
  imageId: string;
  timestamp: string;
  ingredientsCount: number;
}

export default function DetectionResultCard({ 
  imageId, 
  timestamp, 
  ingredientsCount 
}: DetectionResultCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageUrl = getAnnotatedImageUrl(imageId);

  // Handle image loading
  const handleImageLoad = () => {
    setIsLoading(false);
  };

  const handleImageError = () => {
    setIsLoading(false);
    setError('Failed to load annotated image');
  };

  // Format the timestamp
  const formattedTime = new Date(timestamp).toLocaleString();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b border-gray-100">
        <h3 className="font-medium text-gray-800">Detection Result</h3>
        <p className="text-sm text-gray-500">{formattedTime}</p>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse w-8 h-8 rounded-full bg-blue-400"></div>
          </div>
        )}
        
        {error ? (
          <div className="p-8 bg-red-50 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <p className="text-red-700">{error}</p>
          </div>
        ) : (
          <img 
            src={imageUrl} 
            alt="Annotated inventory image" 
            className="w-full object-contain max-h-96"
            onLoad={handleImageLoad}
            onError={handleImageError}
          />
        )}
      </div>
      
      <div className="p-4 bg-blue-50">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-900">
              Detected {ingredientsCount} ingredients
            </p>
            <p className="text-xs text-blue-700">
              Please review and adjust quantities below
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button 
              className="p-2 bg-white rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
              aria-label="View fullsize image"
              onClick={() => window.open(imageUrl, '_blank')}
            >
              <Eye size={16} />
            </button>
            
            <button 
              className="p-2 bg-white rounded-full text-blue-500 hover:bg-blue-100 transition-colors"
              aria-label="Download image"
              onClick={() => {
                const link = document.createElement('a');
                link.href = imageUrl;
                link.download = `detection-${imageId}.jpg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              <Download size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}