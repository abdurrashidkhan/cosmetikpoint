'use client';

import { auth } from '@/app/firebase.init';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from 'firebase/auth';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useRef, useState } from 'react';
import { FiBell, FiChevronDown, FiHelpCircle, FiMenu, FiSearch } from 'react-icons/fi';

// ============================================================================
// Types & Constants
// ============================================================================

interface AdminNavbarProps {
  onMenuClick?: () => void;
}

const DEFAULT_AVATAR =
  'https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436188.jpg';

// ============================================================================
// Component
// ============================================================================

export function AdminNavbar({ onMenuClick }: AdminNavbarProps): ReactElement {
  const [showProfile, setShowProfile] = useState<boolean>(false);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const router = useRouter();

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };

    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setShowProfile(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  // Sign out from Firebase Auth and redirect to login page
  const handleLogout = async (): Promise<void> => {
    setLoggingOut(true);
    try {
      await signOut(auth);
      setShowProfile(false);
      router.replace('/authentication/login');
    } catch (error: unknown) {
      console.error('Failed to sign out:', error);
    } finally {
      setLoggingOut(false);
    }
  };

  const displayName = user?.displayName || 'Abdur Rashid';
  const avatarSrc = user?.photoURL || DEFAULT_AVATAR;

  return (
    <div className='w-full flex items-center justify-between'>
      {/* Left side: Sidebar menu toggle & Search box */}
      <div className='flex items-center gap-4 flex-1'>
        <button
          type='button'
          onClick={() => onMenuClick?.()}
          aria-label='Toggle sidebar menu'
          className='p-2 hover:bg-gray-100 rounded-lg cursor-pointer shrink-0'
        >
          <FiMenu className='text-xl text-gray-600' />
        </button>

        <div className='relative w-full max-w-md hidden sm:block'>
          <span className='absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none'>
            <FiSearch />
          </span>
          <input
            type='search'
            aria-label='Search analytics and orders'
            placeholder='Search analytics, orders...'
            className='w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all'
          />
        </div>
      </div>

      {/* Right side: Support, Notifications & User Profile */}
      <div className='flex items-center gap-2 md:gap-5'>
        <Link
          href='/support'
          className='hidden lg:flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors'
        >
          <FiHelpCircle />
          <span>Need Help?</span>
        </Link>

        <button
          type='button'
          aria-label='Notifications'
          className='relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-all cursor-pointer'
        >
          <FiBell className='text-xl' />
          <span className='absolute top-1.5 right-1.5 h-2 w-2 bg-brand rounded-full border-2 border-white' />
        </button>

        <div className='h-8 w-px bg-gray-200 mx-2 hidden sm:block' />

        {/* User Profile Dropdown */}
        <div className='relative' ref={dropdownRef}>
          <button
            type='button'
            onClick={() => setShowProfile((prev) => !prev)}
            aria-expanded={showProfile}
            aria-haspopup='menu'
            className='flex items-center gap-3 p-1 hover:bg-gray-50 rounded-xl transition-all cursor-pointer'
          >
            <div className='text-right hidden sm:block'>
              <p className='text-sm font-semibold text-gray-800 leading-tight'>{displayName}</p>
              <p className='text-[11px] text-brand font-medium uppercase tracking-tighter'>
                Super Admin
              </p>
            </div>

            <div className='relative h-10 w-10 rounded-xl overflow-hidden border-2 border-brand/20'>
              <Image
                src={avatarSrc}
                alt={`${displayName} profile`}
                fill
                sizes='40px'
                className='object-cover'
              />
            </div>

            <FiChevronDown
              className={`text-gray-400 transition-transform ${showProfile ? 'rotate-180' : ''}`}
            />
          </button>

          {/* Dropdown Menu */}
          {showProfile && (
            <div
              role='menu'
              className='absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-xl py-2 z-50'
            >
              <div className='px-4 py-2 border-b border-gray-50 mb-1'>
                <p className='text-xs text-gray-400'>Manage Account</p>
              </div>

              <Link
                href='/authentication/dashboard/profile'
                role='menuitem'
                onClick={() => setShowProfile(false)}
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-soft hover:text-brand transition-colors'
              >
                Profile Settings
              </Link>

              <Link
                href='/authentication/dashboard/settings'
                role='menuitem'
                onClick={() => setShowProfile(false)}
                className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-brand-soft hover:text-brand transition-colors'
              >
                Settings
              </Link>

              <hr className='my-1 border-gray-100' />

              <button
                type='button'
                role='menuitem'
                onClick={handleLogout}
                disabled={loggingOut}
                className='w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors font-medium cursor-pointer'
              >
                {loggingOut ? 'Logging out...' : 'Log Out'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminNavbar;
