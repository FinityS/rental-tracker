import { Outfit } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";

import MobileNav from "./components/MobileNav";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "Car Rental Tracker",
  description: "Track rentals, tolls, and revenue",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`} suppressHydrationWarning>
        <div className="flex min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
          <Sidebar />
          <MobileNav />
          <main className="flex-1 p-4 md:p-8 overflow-y-auto relative z-10 pt-16 md:pt-8">
            {children}
          </main>
          {/* Background Gradient Mesh */}
          <div className="fixed inset-0 z-0 pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-900/20 blur-[120px]" />
          </div>
        </div>
      </body>
    </html>
  );
}
