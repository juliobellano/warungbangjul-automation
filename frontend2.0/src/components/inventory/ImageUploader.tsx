import { useState, useRef } from 'react';
import { Upload, Camera, AlertCircle, Loader } from 'lucide-react';

interface ImageUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  error: string | null;
}

export default function ImageUploader({ onUpload, isUploading, error }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Display preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the file
    await onUpload(file);
  };

  const handleCameraClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col items-center space-y-4">
        {/* Preview area */}
        {preview && (
          <div className="relative w-full h-64 bg-gray-100 rounded-lg overflow-hidden">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Upload area */}
        <div 
          className="w-full p-6 border-2 border-dashed rounded-lg border-blue-300 bg-blue-50
                     cursor-pointer hover:bg-blue-100 hover:border-blue-400 transition-colors"
          onClick={handleCameraClick}
        >
          <div className="flex flex-col items-center">
            {isUploading ? (
              <Loader className="h-12 w-12 text-blue-500 animate-spin mb-4" />
            ) : (
              <Camera className="h-12 w-12 text-blue-500 mb-4" />
            )}
            <p className="mb-2 text-sm font-semibold text-gray-700">
              {isUploading ? 'Uploading...' : 'Capture Inventory Image'}
            </p>
            <p className="text-xs text-gray-500">
              Take a clear photo of ingredients for automatic detection
            </p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
            disabled={isUploading}
          />
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full p-4 bg-red-50 rounded-lg flex items-start">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}