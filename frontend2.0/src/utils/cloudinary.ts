import { v2 as cloudinary } from 'cloudinary';

// This file contains two types of functions:
// 1. Server-side functions (using API keys) - only usable in Server Components or API routes
// 2. Client-side functions (using public upload preset) - safe to use in Client Components

// Initialize the Cloudinary configuration - ONLY FOR SERVER-SIDE USE
// This will only work in Server Components or API Routes
// Do NOT call this from client components
export const configureServerSideCloudinary = () => {
  // Only configure on the server side
  if (typeof window === 'undefined') {
    cloudinary.config({
      cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }
  return cloudinary;
};

// Client-side upload function - safe to use in any component
// This uses the public upload preset (unsigned) instead of API keys
export const uploadImage = async (file: File): Promise<string> => {
  // Convert file to base64
  const base64data = await readFileAsBase64(file);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', base64data);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  // Upload to Cloudinary using public upload preset (no API secret needed)
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || 'Error uploading to Cloudinary');
  }
  return data.secure_url;
};

// Helper function to convert file to base64
const readFileAsBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}; 