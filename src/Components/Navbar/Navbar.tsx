'use client';

import { auth } from '@/app/firebase.init';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { FormEvent, ReactNode } from 'react';
import { useState, useSyncExternalStore } from 'react';
import { AiOutlineUser } from 'react-icons/ai';
import { BiSearchAlt } from 'react-icons/bi';
import { FiX } from 'react-icons/fi';
import './style.css';
import TopBar from './TopBar';

// ============================================================================
// Types & Constants
// ============================================================================

interface CartItem {
  _id?: string;
  price?: number;
  quantity?: number;
}

interface NavRoute {
  path: string;
  name: string;
}

const NAV_ROUTES: NavRoute[] = [
  { path: '/', name: 'Home' },
  { path: '/products', name: 'Products' },
  { path: '/new-arrivals', name: 'New Arrivals' },
  { path: '/today-deals', name: 'Today Deals' },
  { path: '/registry-gifting', name: 'Registry & Gifting' },
  { path: '/support', name: 'Support' },
];

// No-op subscribe function for safe client-only mount detection
const emptySubscribe = (): (() => void) => () => {};

// ============================================================================
// Component
// ============================================================================

export function Navbar(): ReactNode {
  const pathname = usePathname();
  const router = useRouter();

  const [cartItems] = useState<CartItem[]>([]);
  const [showSearch, setShowSearch] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Uses our React 19 & Firebase 13 safe auth hook
  const { user, loading, error } = useAuth();

  // Client-only check without triggering React 19 `set-state-in-effect`
  const isMounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Hide storefront Navbar inside Admin Dashboard routes
  if (pathname?.startsWith('/authentication/dashboard')) {
    return null;
  }

  if (error) {
    console.error('Auth Error:', error.message);
  }

  // Safe cart subtotal calculation in BDT
  const productPrice = cartItems.reduce(
    (total, item) => total + Math.floor(item.price || 0) * Math.max(item.quantity || 1, 1),
    0,
  );

  // Sign out from Firebase Auth
  const handleLogout = async (): Promise<void> => {
    try {
      await signOut(auth);
      router.refresh();
    } catch (logoutError: unknown) {
      console.error('Logout Error:', logoutError);
    }
  };

  // Navigate to products page with search query
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = searchQuery.trim();
    setShowSearch(false);
    if (trimmed) {
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    } else {
      router.push('/products');
    }
  };

  return (
    <nav className='bg-white shadow-2xl z-[99999] fixed w-full'>
      {/* Top Announcement Bar */}
      <TopBar />

      <div className='container mx-auto px-4'>
        <div className='navbar'>
          {/* Navbar Start: Mobile Menu & Cosmetik Point Brand */}
          <div className='navbar-start'>
            <div className='dropdown'>
              <label tabIndex={0} className='btn btn-ghost lg:hidden'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth='2'
                    d='M4 6h16M4 12h8m-8 6h16'
                  />
                </svg>
              </label>
              <ul
                tabIndex={0}
                className='menu menu-compact dropdown-content mt-3 p-2 shadow-2xl bg-base-100 rounded w-52'
              >
                {NAV_ROUTES.map((route) => (
                  <li key={route.path}>
                    <Link
                      className={`${
                        pathname === route.path ? 'text-[#F96988]' : 'text-slate-600'
                      } font-semibold`}
                      href={route.path}
                    >
                      {route.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href='/'
              className='normal-case text-sm sm:text-xl font-extrabold font-serif text-[#f8426a]'
            >
              Cosmetik Point
            </Link>
          </div>

          {/* Navbar Center: Desktop Links */}
          <div className='navbar-center hidden lg:flex'>
            <ul className='menu menu-horizontal p-0'>
              {NAV_ROUTES.map((route) => (
                <li key={route.path}>
                  <Link
                    className={`${
                      pathname === route.path ? 'text-[#F96988]' : 'text-slate-600'
                    } font-semibold`}
                    href={route.path}
                  >
                    {route.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navbar End: Search, Cart & User Menu */}
          <div className='navbar-end'>
            <div className='flex-none'>
              {/* Search Trigger */}
              <div className='dropdown dropdown-end'>
                <button
                  type='button'
                  aria-label='Open product search'
                  onClick={() => setShowSearch((prev) => !prev)}
                  className='btn btn-ghost btn-circle'
                >
                  <div className='indicator'>
                    <BiSearchAlt className='text-2xl' />
                  </div>
                </button>
              </div>

              {/* Cart Dropdown */}
              <div className='dropdown dropdown-end'>
                <label tabIndex={0} className='btn btn-ghost btn-circle'>
                  <div className='indicator'>
                    <svg
                      xmlns='http://www.w3.org/2000/svg'
                      className='h-6 w-6 text-slate-700'
                      fill='none'
                      viewBox='0 0 24 24'
                      stroke='currentColor'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth='2'
                        d='M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z'
                      />
                    </svg>
                    <span className='badge badge-sm indicator-item'>{cartItems.length}</span>
                  </div>
                </label>

                <div
                  tabIndex={0}
                  className='mt-3 z-[1] card card-compact dropdown-content w-52 shadow-2xl text-slate-700 bg-white rounded'
                >
                  <div className='card-body'>
                    <span className='font-bold text-lg'>{cartItems.length} Items Selected</span>
                    <span className='text-[#DB1F3E]'>Subtotal: ৳ {productPrice}</span>
                    <div className='text-center'>
                      <Link
                        href='/card/overview/page=1'
                        className='w-full text-slate-700 tracking-[2px] mt-2 py-1 bg-[#00000011] shadow-2xl hover:text-[#DB1F3E] rounded inline-block'
                      >
                        View Cart
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Menu / Avatar */}
              <div className='dropdown dropdown-end'>
                <label tabIndex={0} className='btn btn-ghost btn-circle avatar'>
                  <div className='w-8 h-8 rounded-full flex items-center justify-center overflow-hidden'>
                    {!isMounted || loading ? (
                      <div className='w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin' />
                    ) : user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        referrerPolicy='no-referrer'
                        alt={user.displayName || 'User Profile'}
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <AiOutlineUser className='w-6 h-6 text-slate-700' />
                    )}
                  </div>
                </label>

                <ul
                  tabIndex={0}
                  className='menu menu-compact dropdown-content p-2 shadow-2xl rounded bg-base-100 w-52 mt-4'
                >
                  <li>
                    <Link href='/authentication/dashboard/profile' className='justify-between'>
                      Profile <span className='badge'>New</span>
                    </Link>
                  </li>
                  <li>
                    <Link href='/card/overview/page=1'>Overview</Link>
                  </li>
                  <li>
                    <Link href='/authentication/dashboard'>Dashboard</Link>
                  </li>
                  <li>
                    {isMounted && user ? (
                      <button type='button' onClick={handleLogout}>
                        Log Out
                      </button>
                    ) : (
                      <Link href='/authentication/login'>Log In</Link>
                    )}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Inline Search Bar Overlay (Replaces missing <Search /> component) */}
      {showSearch && (
        <div className='border-t border-gray-200 bg-white px-4 py-3 shadow-md'>
          <form
            onSubmit={handleSearchSubmit}
            className='container mx-auto flex items-center gap-2 max-w-2xl'
          >
            <input
              type='search'
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search cosmetics, skincare, makeup...'
              className='flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f8426a]'
            />
            <button
              type='submit'
              className='px-4 py-2 bg-[#f8426a] hover:bg-rose-600 text-white text-sm font-semibold rounded-lg transition cursor-pointer'
            >
              Search
            </button>
            <button
              type='button'
              aria-label='Close search'
              onClick={() => setShowSearch(false)}
              className='p-2 text-gray-500 hover:text-gray-800 cursor-pointer'
            >
              <FiX className='text-xl' />
            </button>
          </form>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
