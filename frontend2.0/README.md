# Warung Bang Jul Food Ordering App

This is a Next.js project for a food ordering application, built with:

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Features

- Food browsing by category
- Restaurant listings
- Modern UI with responsive design

## Project Structure

```
/src
  /app
    layout.tsx - Main layout
    page.tsx - Home page with food listings
    globals.css - Global styles
  /components
    FoodCard.tsx - Reusable food item card
    RestaurantCard.tsx - Reusable restaurant card
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deployment on Vercel

### Environment Variable Setup

When deploying to Vercel, make sure to set up the following environment variables:

#### Public Variables (Exposed to Browser)
These are automatically included in the client bundle and can be accessed on the client side:
- `NEXT_PUBLIC_API_URL` - Your production API URL
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` - Your Cloudinary upload preset for client-side uploads

#### Private Variables (Server-side Only)
These are only available in Server Components, API Routes, and server-side code:
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

To set these up in Vercel:
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with the appropriate value
4. Make sure to toggle "Production" for production deployment
5. Click "Save" to apply your changes

### Deployment Steps

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables as above
4. Deploy!
