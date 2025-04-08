'use client';

import { useState } from 'react';
import Image from 'next/image';
import { uploadImage } from '../utils/cloudinary';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  className?: string;
}

export default function ImageUpload({ onImageUploaded, className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploading(true);
      setError(null);
      
      // Upload to Cloudinary
      const imageUrl = await uploadImage(file);
      
      // Call callback with the image URL
      onImageUploaded(imageUrl);
      
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {preview && (
        <div className="relative w-40 h-40 overflow-hidden rounded-md">
          <Image 
            src={preview} 
            alt="Preview" 
            fill 
            className="object-cover" 
          />
        </div>
      )}
      
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 border-gray-300">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-500">
            <span className="font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</span>
          </p>
          <p className="text-xs text-gray-500">PNG, JPG or WebP (MAX. 5MB)</p>
        </div>
        <input 
          id="dropzone-file" 
          type="file" 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
          disabled={uploading}
        />
      </label>
      
      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
} 