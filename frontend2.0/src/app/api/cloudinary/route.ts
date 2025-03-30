import { NextRequest, NextResponse } from 'next/server';
import { configureServerSideCloudinary } from '@/utils/cloudinary';

// This is a server-side API route that can safely use the Cloudinary API keys
// Example of a server-side operation that requires the API key and secret

export async function GET(request: NextRequest) {
  try {
    // Only configure cloudinary on the server side
    const cloudinary = configureServerSideCloudinary();
    
    // Get a URL parameter, e.g., /api/cloudinary?folder=my-folder
    const searchParams = request.nextUrl.searchParams;
    const folder = searchParams.get('folder') || '';
    
    // Example: List resources in a folder (requires API credentials)
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 10
    });
    
    // Return the result to the client (safe because we're not exposing credentials)
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json(
      { error: 'Error accessing Cloudinary' },
      { status: 500 }
    );
  }
}

// Example of a POST endpoint for server-side uploads if needed
export async function POST(request: NextRequest) {
  try {
    const cloudinary = configureServerSideCloudinary();
    const data = await request.json();
    
    // Only accept data from authenticated users (add your auth check here)
    // For example: if (!isAuthenticated(request)) return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    
    if (!data.image) {
      return NextResponse.json(
        { error: 'No image data provided' },
        { status: 400 }
      );
    }
    
    // Upload to Cloudinary using server-side credentials
    // This is more secure than client-side uploads
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        data.image,
        {
          folder: data.folder || 'uploads',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Error uploading to Cloudinary' },
      { status: 500 }
    );
  }
} 