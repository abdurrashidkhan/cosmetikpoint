'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import {
  HiOutlineCog,
  HiOutlineCube,
  HiOutlineFolderAdd,
  HiOutlineLogout,
  HiOutlineShoppingCart,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from 'react-icons/hi';
import { MdOutlineRateReview } from 'react-icons/md';
import { SiGoogleanalytics } from 'react-icons/si';

// ============================================================================
// Types
// ============================================================================

interface SidebarProps {
  isOpen?: boolean;
  onNavigate?: () => void;
}

interface SidebarMenuItem {
  name: string;
  href: string;
  icon: ReactElement;
  color: string;
}

// ============================================================================
// Constants
// ============================================================================

const DASHBOARD_ROOT = '/authentication/dashboard';

const MENU_ITEMS: SidebarMenuItem[] = [
  {
    name: 'Analytics',
    href: '/authentication/dashboard',
    icon: <SiGoogleanalytics />,
    color: 'text-blue-500',
  },
  {
    name: 'Orders',
    href: '/authentication/dashboard/orders',
    icon: <HiOutlineShoppingCart />,
    color: 'text-orange-500',
  },
  {
    name: 'Products',
    href: '/authentication/dashboard/products',
    icon: <HiOutlineCube />,
    color: 'text-purple-500',
  },
  {
    name: 'Add Item',
    href: '/authentication/dashboard/add-item',
    icon: <HiOutlineFolderAdd />,
    color: 'text-green-500',
  },
  {
    name: 'Customers',
    href: '/authentication/dashboard/customers',
    icon: <HiOutlineUsers />,
    color: 'text-teal-500',
  },
  {
    name: 'Reviews',
    href: '/authentication/dashboard/reviews',
    icon: <MdOutlineRateReview />,
    color: 'text-amber-500',
  },
  {
    name: 'Profile',
    href: '/authentication/dashboard/profile',
    icon: <HiOutlineUserCircle />,
    color: 'text-brand',
  },
  {
    name: 'Settings',
    href: '/authentication/dashboard/settings',
    icon: <HiOutlineCog />,
    color: 'text-gray-500',
  },
];

// ============================================================================
// Component
// ============================================================================

export function Sidebar({ isOpen = true, onNavigate }: SidebarProps): ReactElement {
  const pathname = usePathname();

  return (
    <div
      className={`bg-surface shadow-2xl h-full flex flex-col transition-all duration-300 ease-in-out sticky top-0 left-0 z-50 shrink-0 ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      {/* Cosmetik Point Brand Logo Area */}
      <div className='h-20 flex items-center justify-center border-b border-line shrink-0'>
        <Link href={DASHBOARD_ROOT} onClick={onNavigate} className='flex items-center gap-3 px-4'>
          <div className='h-10 w-10 bg-brand rounded-xl flex items-center justify-center text-brand-foreground shadow-md shrink-0'>
            <span className='text-lg font-black font-display italic'>CP</span>
          </div>
          {isOpen && (
            <div className='transition-all duration-300'>
              <h2 className='font-display text-lg font-bold text-ink tracking-tight leading-none'>
                Cosmetik Point
              </h2>
              <span className='text-[9px] font-bold text-brand uppercase tracking-widest'>
                Admin Panel
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation Menu */}
      <nav
        aria-label='Admin sidebar navigation'
        className='flex-1 overflow-y-auto py-5 px-3 space-y-1.5 custom-scrollbar'
      >
        {MENU_ITEMS.map((item) => {
          // Exact match for dashboard root, prefix match for nested sub-routes
          const isActive =
            item.href === DASHBOARD_ROOT
              ? pathname === item.href
              : pathname === item.href || pathname?.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              onClick={onNavigate}
              aria-current={isActive ? 'page' : undefined}
              className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-300 group ${
                isOpen ? '' : 'justify-center px-0'
              } ${
                isActive
                  ? 'bg-brand text-brand-foreground shadow-sm'
                  : 'text-ink-muted hover:bg-brand-soft/60 hover:text-ink'
              }`}
            >
              <span
                className={`text-xl shrink-0 ${isActive ? 'text-brand-foreground' : item.color}`}
              >
                {item.icon}
              </span>
              {isOpen && (
                <span className='text-sm font-semibold tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300'>
                  {item.name}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Back to Storefront */}
      <div className='p-3 border-t border-line shrink-0'>
        <Link
          href='/'
          onClick={onNavigate}
          title='Back to Shop'
          className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-ink-muted hover:bg-brand-soft hover:text-brand transition-all group ${
            isOpen ? '' : 'justify-center px-0'
          }`}
        >
          <HiOutlineLogout className='text-xl shrink-0 group-hover:-translate-x-1 transition-transform' />
          {isOpen && <span className='text-sm font-semibold whitespace-nowrap'>Back to Shop</span>}
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
