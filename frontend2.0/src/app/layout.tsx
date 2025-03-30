import type { Metadata } from "next";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Warung Bang Jul - Food Ordering App",
  description: "Order your favorite food from Warung Bang Jul",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SplashScreen />
        <main className="min-h-screen bg-gray-100">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
              <div className="flex justify-between items-center">
                <Link href="/" className="text-xl md:text-3xl font-bold text-gray-900 transition-all duration-300 hover:text-gray-700">
                  Warung Bang Jul
                </Link>
                <nav className="hidden md:block">
                  <ul className="flex space-x-8">
                    <li><Link href="/" className="text-gray-500 hover:text-orange-500">Home</Link></li>
                    <li><Link href="/dashboard" className="text-gray-500 hover:text-orange-500">Dashboard</Link></li>
                    <li><Link href="/inventory" className="text-gray-500 hover:text-orange-500">Inventory</Link></li>
                    <li><Link href="#" className="text-gray-500 hover:text-orange-500">Menu</Link></li>
                    <li><Link href="#" className="text-gray-500 hover:text-orange-500">About</Link></li>
                  </ul>
                </nav>
              </div>
            </div>
          </header>
          
          {children}
          
          <footer className="bg-white border-t mt-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="md:flex md:justify-between md:items-center">
                <p className="text-center md:text-left text-gray-500">
                  Warung Bang Jul &copy; {new Date().getFullYear()}
                </p>
                <div className="mt-4 md:mt-0 hidden md:block">
                  <ul className="flex space-x-6 justify-center">
                    <li><Link href="#" className="text-gray-500 hover:text-orange-500">Privacy Policy</Link></li>
                    <li><Link href="#" className="text-gray-500 hover:text-orange-500">Terms of Service</Link></li>
                    <li><Link href="#" className="text-gray-500 hover:text-orange-500">Contact Us</Link></li>
                  </ul>
                </div>
              </div>
            </div>
          </footer>
          
          {/* Mobile Navigation */}
          <MobileNav />
        </main>
      </body>
    </html>
  );
}
