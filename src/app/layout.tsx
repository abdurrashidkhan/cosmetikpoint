import Footer from '@/Components/Footer/Footer';
import Navbar from '@/Components/Navbar/Navbar';
import { ThemeProvider } from '@/context/ThemeContext/ThemeContext';
import type { Metadata } from 'next';
import { Geist_Mono, Playfair_Display, Plus_Jakarta_Sans, Poppins } from 'next/font/google';
import { Suspense, type ReactElement, type ReactNode } from 'react';
import './globals.css';

// ============================================================================
// Dynamic Theme Fonts (Switched automatically via CSS variables)
// ============================================================================

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  weight: ['500', '600', '700'],
});

const jakarta = Plus_Jakarta_Sans({
  variable: '--font-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

const poppins = Poppins({
  variable: '--font-poppins',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    template: '%s | CosmetikPoint',
  },
  description:
    'Shop 100% authentic cosmetics, skincare, makeup, haircare, and fragrances at Cosmetik Point. Enjoy fast delivery across Bangladesh, cash on delivery, and secure online payments.',
  keywords: [
    'CosmetikPoint',
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
    <html lang='en' data-cp-theme='rose-blossom' suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${playfair.variable} ${jakarta.variable} ${poppins.variable} ${geistMono.variable} antialiased bg-surface text-ink`}
      >
        <ThemeProvider>
          {/* Wrap client URL-hook components in Suspense for Next.js 16 cacheComponents */}
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>

          {children}

          <Suspense fallback={null}>
            <Footer />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
