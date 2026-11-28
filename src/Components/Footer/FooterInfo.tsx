import Link from 'next/link';
import type { ReactElement } from 'react';

// ============================================================================
// Types & Constants
// ============================================================================

interface InfoLinkItem {
  label: string;
  href: string;
}

const HELP_LINKS: InfoLinkItem[] = [
  { label: 'Help Center', href: '/support' },
  { label: 'Order Tracking', href: '/support' },
  { label: 'Disputes & Report', href: '/support' },
  { label: 'Buyer Protection', href: '/support' },
  { label: 'Authenticity Policy', href: '/support' },
  { label: 'Return & Refund', href: '/support' },
];

const CATEGORY_LINKS: InfoLinkItem[] = [
  { label: 'Skincare', href: '/products?category=skincare' },
  { label: 'Makeup', href: '/products?category=makeup' },
  { label: 'Haircare', href: '/products?category=haircare' },
  { label: 'Fragrances', href: '/products?category=fragrances' },
  { label: 'New Arrivals', href: '/new-arrivals' },
  { label: 'Today Deals', href: '/today-deals' },
];

// ============================================================================
// Component
// ============================================================================

export function FooterInfo(): ReactElement {
  return (
    <div className='container mx-auto px-4 py-4 border-t border-gray-300 mt-4'>
      <div className='grid gap-6 grid-cols-1 md:grid-cols-2'>
        {/* Left Column: Help & Cosmetics Categories */}
        <div className='pt-4'>
          <div>
            <h2 className='text-xl font-semibold text-[#2E3A5B]'>Help</h2>
            <div className='flex flex-wrap gap-x-3 gap-y-1 mt-1'>
              {HELP_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className='text-sm text-slate-700 hover:text-[#F84D73] transition-colors'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className='mt-5'>
            <h2 className='text-xl font-semibold text-[#2E3A5B]'>Shop by Category</h2>
            <div className='flex flex-wrap gap-x-3 gap-y-1 mt-1'>
              {CATEGORY_LINKS.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className='text-sm text-slate-700 hover:text-[#F84D73] transition-colors'
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Region & About Cosmetik Point */}
        <div className='pt-4'>
          <div>
            <h2 className='text-xl font-semibold text-[#2E3A5B]'>Region &amp; Language</h2>
            <p className='pt-1 text-slate-600 text-sm'>Bangladesh (BDT ৳) — English</p>
          </div>

          <div className='mt-8'>
            <Link
              className='text-xl font-semibold text-[#2E3A5B] hover:text-[#F84D73] transition-colors'
              href='/products'
            >
              About Cosmetik Point
            </Link>
            <p className='text-slate-600 text-sm pt-1 leading-relaxed'>
              Your trusted online cosmetics shop in Bangladesh for 100% authentic skincare, makeup,
              haircare, and beauty essentials with fast nationwide delivery.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className='mt-6 pt-4 border-t border-gray-300 text-center text-xs text-slate-600'>
        &copy; 2026 Cosmetik Point. All rights reserved.
      </div>
    </div>
  );
}

export default FooterInfo;
