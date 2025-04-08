import { useState } from 'react';
import { uploadImageForDetection, getDetectionResults, confirmDetectionUpdate } from '@/services/api';
import { DetectedIngredient, DetectionResult } from '@/services/types';

export const useDetection = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [detectionId, setDetectionId] = useState<string | null>(null);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isLoadingResult, setIsLoadingResult] = useState(false);
  const [resultError, setResultError] = useState<string | null>(null);
  const [adjustedIngredients, setAdjustedIngredients] = useState<DetectedIngredient[]>([]);
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  // Upload an image for detection
  const uploadImage = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    setDetectionId(null);
    setDetectionResult(null);
    setAdjustedIngredients([]);
    setConfirmSuccess(false);
    
    try {
      const result = await uploadImageForDetection(file);
      setDetectionId(result.detection_id);
      return result.detection_id;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload image');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch detection results
  const fetchDetectionResult = async (id: string) => {
    setIsLoadingResult(true);
    setResultError(null);
    
    try {
      const result = await getDetectionResults(id);
      setDetectionResult(result);
      // Initialize adjusted ingredients with the detected ones
      setAdjustedIngredients(result.ingredients.map((ing: DetectedIngredient) => ({...ing, isAdjusted: false})));      return result;
    } catch (error) {
      setResultError(error instanceof Error ? error.message : 'Failed to get detection results');
      return null;
    } finally {
      setIsLoadingResult(false);
    }
  };

  // Update quantity for a detected ingredient
  const updateIngredientQuantity = (ingredientName: string, newQuantity: number) => {
    setAdjustedIngredients(prev => 
      prev.map(ing => 
        ing.ingredient_name === ingredientName 
          ? { ...ing, suggested_quantity: newQuantity, isAdjusted: true } 
          : ing
      )
    );
  };

  // Confirm the inventory update with the adjusted quantities
  const confirmUpdate = async () => {
    if (!detectionId) return;
    
    setIsConfirming(true);
    setConfirmError(null);
    
    try {
      const result = await confirmDetectionUpdate(detectionId, adjustedIngredients);
      setConfirmSuccess(true);
      return result;
    } catch (error) {
      setConfirmError(error instanceof Error ? error.message : 'Failed to update inventory');
      return null;
    } finally {
      setIsConfirming(false);
    }
  };

  return {
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
  };
};