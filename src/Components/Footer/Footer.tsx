'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement, ReactNode } from 'react';
import { AiFillFacebook, AiFillInstagram, AiOutlineTwitter } from 'react-icons/ai';
import { BsMessenger } from 'react-icons/bs';
import { IoLogoWhatsapp } from 'react-icons/io';
import FooterInfo from './FooterInfo';

// ============================================================================
// Types & Constants
// ============================================================================

interface SocialLinkItem {
  label: string;
  href: string;
  icon: ReactElement;
  spacingClass?: string;
}

interface FooterLinkItem {
  label: string;
  href: string;
}

interface FooterColumn {
  heading: string;
  links: FooterLinkItem[];
}

const SOCIAL_LINKS: SocialLinkItem[] = [
  {
    label: 'Cosmetik Point on Facebook',
    href: '#',
    icon: (
      <AiFillFacebook className='text-3xl rounded text-[#2E3A5B] hover:text-[#202020] transition-colors' />
    ),
  },
  {
    label: 'Cosmetik Point on X (Twitter)',
    href: '#',
    icon: (
      <AiOutlineTwitter className='text-3xl rounded text-[#2E3A5B] hover:text-[#202020] transition-colors' />
    ),
    spacingClass: 'ml-3',
  },
  {
    label: 'Cosmetik Point on Instagram',
    href: '#',
    icon: (
      <AiFillInstagram className='text-3xl rounded text-[#2E3A5B] hover:text-[#202020] transition-colors' />
    ),
    spacingClass: 'ml-3',
  },
  {
    label: 'Chat on Messenger',
    href: '#',
    icon: (
      <BsMessenger className='text-3xl rounded text-[#2E3A5B] hover:text-[#202020] transition-colors' />
    ),
    spacingClass: 'ml-3',
  },
  {
    label: 'Chat on WhatsApp',
    href: '#',
    icon: (
      <IoLogoWhatsapp className='text-3xl rounded text-[#2E3A5B] hover:text-[#202020] transition-colors' />
    ),
    spacingClass: 'ml-3',
  },
];

const FOOTER_COLUMNS: FooterColumn[] = [
  {
    heading: 'Shopping with us',
    links: [
      { label: 'Making payments', href: '/support' },
      { label: 'Delivery options', href: '/support' },
      { label: 'Return policy', href: '/support' },
      { label: '100% Authentic Guarantee', href: '/products' },
    ],
  },
  {
    heading: 'Customer service',
    links: [
      { label: 'Help Center', href: '/support' },
      { label: 'Transaction Services Agreement', href: '/support' },
      { label: 'Terms and Conditions', href: '/support' },
      { label: 'Privacy Policy', href: '/support' },
      { label: 'Take our feedback survey', href: '/support' },
    ],
  },
  {
    heading: 'Collaborate with us',
    links: [
      { label: 'Partnerships', href: '/support' },
      { label: 'Affiliate program', href: '/support' },
      { label: 'Brand Authentic Hub', href: '/products' },
      { label: '24/7 Support', href: '/support' },
    ],
  },
];

// ============================================================================
// Component
// ============================================================================

export function Footer(): ReactNode {
  const pathname = usePathname();

  // Hide storefront Footer inside Admin Dashboard routes
  if (pathname?.startsWith('/authentication/dashboard')) {
    return null;
  }

  return (
    <footer className='bg-[#ececec] py-5'>
      <div className='container mx-auto px-4 mt-[25px]'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-6'>
          {/* Left Side: Social Media Links */}
          <div>
            <h2 className='text-2xl font-semibold text-[#2E3A5B]'>Stay connected</h2>
            <p className='text-xs text-slate-600 mt-1'>
              Cosmetik Point — Authentic Cosmetics &amp; Skincare in Bangladesh
            </p>
            <div className='flex items-center justify-between'>
              <ul className='py-4'>
                {SOCIAL_LINKS.map((social) => (
                  <li key={social.label} className={`inline-block ${social.spacingClass ?? ''}`}>
                    <a href={social.href} aria-label={social.label} title={social.label}>
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side: Navigation Columns */}
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {FOOTER_COLUMNS.map((column) => (
              <div key={column.heading}>
                <h2 className='text-[20px] font-semibold text-[#2E3A5B]'>{column.heading}</h2>
                <ul className='mt-4 space-y-1'>
                  {column.links.map((linkItem) => (
                    <li key={linkItem.label}>
                      <Link
                        href={linkItem.href}
                        className='text-slate-600 hover:underline hover:text-[#313131] my-1 duration-300 ease-in-out text-sm inline-block'
                      >
                        {linkItem.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Copyright / Info Bar */}
      <FooterInfo />
    </footer>
  );
}

export default Footer;
