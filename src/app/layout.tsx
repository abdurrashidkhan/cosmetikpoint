// app/layout.tsx
import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const serif = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

// Ensure NEXT_PUBLIC_SITE_URL is set in your .env file (e.g., https://cosmetikpoint.com)
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cosmetikpoint.com';

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Cosmetik Point | Authentic Skincare, Makeup & Beauty Essentials',
    template: '%s | Cosmetik Point',
  },
  description:
    'Shop authentic skincare, makeup, and beauty essentials at Cosmetik Point. Discover dermatologist-tested serums, hydrating creams, and everyday glow favorites.',
  keywords: [
    'Cosmetik Point',
    'authentic cosmetics',
    'skincare products',
    'makeup online',
    'hydrating serum',
    'beauty essentials',
  ],
  authors: [{ name: 'Cosmetik Point' }],
  creator: 'Cosmetik Point',
  publisher: 'Cosmetik Point',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Cosmetik Point',
    title: 'Cosmetik Point | Authentic Skincare, Makeup & Beauty Essentials',
    description:
      'Shop authentic skincare, makeup, and beauty essentials at Cosmetik Point. Discover dermatologist-tested serums, creams, and everyday beauty favorites.',
    images: [
      {
        url: '/og-default.jpg', // Place a 1200x630px branded banner in /public/og-default.jpg
        width: 1200,
        height: 630,
        alt: 'Cosmetik Point — Authentic Skincare & Beauty Collection',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cosmetik Point | Authentic Skincare & Makeup',
    description: 'Shop authentic skincare, makeup, and beauty essentials at Cosmetik Point.',
    images: ['/og-default.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Cosmetik Point',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      // Replace with your active social URLs
      'https://www.facebook.com/cosmetikpoint',
      'https://www.instagram.com/cosmetikpoint',
    ],
  };

  return (
    <html lang='en' className={`${sans.variable} ${serif.variable}`}>
      <body className='min-h-screen bg-white text-neutral-900 antialiased selection:bg-rose-100 selection:text-rose-900'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />

        <div className='flex min-h-screen flex-col'>
          {/* <Navbar /> */}
          <main id='main-content' className='flex-1'>
            {children}
          </main>
          {/* <Footer /> */}
        </div>
      </body>
    </html>
  );
}
