import Footer from '@/Components/Footer/Footer';
import Navbar from '@/Components/Navbar/Navbar';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactElement, ReactNode } from 'react';
import './globals.css';

// ============================================================================
// Fonts
// ============================================================================

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

// ============================================================================
// SEO Metadata (Cosmetik Point - Bangladesh)
// ============================================================================

export const metadata: Metadata = {
  applicationName: 'Cosmetik Point',
  publisher: 'Cosmetik Point',
  title: {
    default: 'Cosmetik Point | Authentic Cosmetics & Skincare Shop in Bangladesh',
    template: '%s | Cosmetik Point',
  },
  description:
    'Shop 100% authentic cosmetics, skincare, makeup, haircare, and fragrances at Cosmetik Point. Enjoy fast delivery across Bangladesh, cash on delivery, and secure online payments.',
  keywords: [
    'Cosmetik Point',
    'Cosmetik Point',
    'cosmetics shop in Bangladesh',
    'online beauty store Bangladesh',
    'authentic makeup BD',
    'skincare products Bangladesh',
    'haircare',
    'fragrances',
    'cosmetics online BD',
  ],
  openGraph: {
    title: 'Cosmetik Point | Authentic Cosmetics & Skincare Shop in Bangladesh',
    description:
      'Discover 100% authentic skincare, makeup, haircare, and beauty essentials with fast nationwide delivery in Bangladesh.',
    siteName: 'Cosmetik Point',
    locale: 'en_BD',
    type: 'website',
  },
};

// ============================================================================
// Root Layout
// ============================================================================

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: Readonly<RootLayoutProps>): ReactElement {
  return (
    <html lang='en' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
