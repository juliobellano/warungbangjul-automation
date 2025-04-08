'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Camera, CheckCircle, Loader } from 'lucide-react';
import { useDetection } from '@/hooks/useDetection';
import ImageUploader from '@/components/inventory/ImageUploader';
import DetectionResultCard from '@/components/inventory/DectectionResultCard';
import IngredientAdjuster from '@/components/inventory/IngridientAdjuster'
import  ConfirmationModal  from '@/components/inventory/ConfimationModal';


export default function InventoryDetectionPage() {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const {
    isUploading,
    uploadError,
    detectionId,
    detectionResult,
    isLoadingResult,
    resultError,
    adjustedIngredients,
    isConfirming,
    confirmError,
    confirmSuccess,
    uploadImage,
    fetchDetectionResult,
    updateIngredientQuantity,
    confirmUpdate
  } = useDetection();

  // Handle image upload
  const handleUpload = async (file: File) => {
    const id = await uploadImage(file);
    if (id) {
      await fetchDetectionResult(id);
    }
  };

  // Confirm the inventory update
  const handleConfirmUpdate = async () => {
    await confirmUpdate();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => router.push('/inventory')}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Back to Inventory</span>
        </button>
      </div>
      
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Inventory Detection</h1>
      
      <div className="space-y-8">
        {/* Step 1: Upload Image */}
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <Camera size={20} className="mr-2 text-blue-500" />
            Step 1: Upload Inventory Image
          </h2>
          
          <ImageUploader 
            onUpload={handleUpload}
            isUploading={isUploading}
            error={uploadError}
          />
        </section>
        
        {/* Step 2: Review Detection */}
        {(detectionResult || isLoadingResult) && (
          <section className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Step 2: Review Detection
            </h2>
            
            {isLoadingResult ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                <p className="text-gray-600">Processing image...</p>
              </div>
            ) : resultError ? (
              <div className="p-8 bg-red-50 rounded-lg text-center">
                <p className="text-red-700 mb-2 font-medium">Error processing image</p>
                <p className="text-red-600">{resultError}</p>
              </div>
            ) : detectionResult && (
              <div className="space-y-6">
                <DetectionResultCard 
                  imageId={detectionResult.image_url.split('/').pop() || ''}
                  timestamp={detectionResult.timestamp}
                  ingredientsCount={detectionResult.ingredients.length}
                />
                
                <div className="mt-6">
                  <IngredientAdjuster 
                    ingredients={adjustedIngredients}
                    onUpdateQuantity={updateIngredientQuantity}
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
                  >
                    <CheckCircle size={18} className="mr-2" />
                    Update Inventory
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal 
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        ingredients={adjustedIngredients}
        onConfirm={handleConfirmUpdate}
        isConfirming={isConfirming}
        error={confirmError}
        success={confirmSuccess}
      />
    </div>
  );
}