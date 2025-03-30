import { v2 as cloudinary } from 'cloudinary';

// Initialize the Cloudinary configuration
// When using CLOUDINARY_URL env var, the SDK automatically picks it up
// No manual configuration needed
cloudinary.config(true);

export default cloudinary;

// Helper function to upload an image to Cloudinary
export const uploadImage = async (file: File): Promise<string> => {
  // Convert file to base64
  const base64data = await readFileAsBase64(file);
  
  // Create form data
  const formData = new FormData();
  formData.append('file', base64data);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');

  // Upload to Cloudinary
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await response.json();
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