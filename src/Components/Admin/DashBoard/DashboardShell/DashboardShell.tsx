'use client';

import AdminNavbar from '@/Components/Admin/DashBoard/AdminNavbar/AdminNavbar';
import Sidebar from '@/Components/Admin/DashBoard/Sidebar/Sidebar';
import type { ReactElement, ReactNode } from 'react';
import { Suspense, useEffect, useState } from 'react';
import { FiX } from 'react-icons/fi';

// ============================================================================
// Types
// ============================================================================

interface DashboardShellProps {
  children: ReactNode;
}

// ============================================================================
// Component: Smooth Animated Desktop Collapse & Mobile Slide-Over Drawer
// ============================================================================

export function DashboardShell({ children }: Readonly<DashboardShellProps>): ReactElement {
  const [isDesktopOpen, setIsDesktopOpen] = useState<boolean>(true);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  // Close mobile drawer when pressing Escape
  useEffect(() => {
    if (!isMobileOpen) return;

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileOpen]);

  // Open drawer on mobile (<768px) or collapse/expand sidebar on desktop
  const handleMenuClick = (): void => {
    const isMobileViewport = window.matchMedia('(max-width: 767px)').matches;
    if (isMobileViewport) {
      setIsMobileOpen((prev) => !prev);
    } else {
      setIsDesktopOpen((prev) => !prev);
    }
  };

  return (
    <div className='flex h-screen bg-[#F8F9FD] overflow-hidden'>
      {/* Desktop Sidebar (Smooth width transition handled inside Sidebar.tsx) */}
      <aside className='hidden md:block shrink-0 border-r border-line bg-surface'>
        <Suspense fallback={null}>
          <Sidebar isOpen={isDesktopOpen} />
        </Suspense>
      </aside>

      {/* Mobile Slide-Over Sidebar Drawer (Kept mounted so both open & close animate smoothly) */}
      <div
        role='dialog'
        aria-modal={isMobileOpen}
        aria-hidden={!isMobileOpen}
        aria-label='Mobile admin navigation'
        className={`fixed inset-0 z-[999] flex md:hidden ${
          isMobileOpen
            ? 'visible pointer-events-auto'
            : 'invisible pointer-events-none transition-[visibility] duration-0 delay-300'
        }`}
      >
        {/* Smooth Fade Backdrop */}
        <button
          type='button'
          tabIndex={isMobileOpen ? 0 : -1}
          aria-label='Close sidebar backdrop'
          onClick={() => setIsMobileOpen(false)}
          className={`fixed inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-300 ease-out cursor-pointer ${
            isMobileOpen ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Smooth Slide-In / Slide-Out Drawer Panel */}
        <div
          className={`relative z-10 flex h-full bg-surface shadow-2xl transform transition-transform duration-300 ease-out ${
            isMobileOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <Suspense fallback={null}>
            <Sidebar isOpen={true} onNavigate={() => setIsMobileOpen(false)} />
          </Suspense>

          <button
            type='button'
            tabIndex={isMobileOpen ? 0 : -1}
            aria-label='Close sidebar menu'
            onClick={() => setIsMobileOpen(false)}
            className='absolute top-4 right-3 p-2 rounded-full bg-surface-muted text-ink-muted hover:text-brand border border-line cursor-pointer z-50 transition-colors'
          >
            <FiX className='text-lg' />
          </button>
        </div>
      </div>

      {/* Right Main Content Area */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Top Admin Header */}
        <header className='h-16 shrink-0 bg-surface border-b border-line flex items-center px-4 sm:px-6'>
          <AdminNavbar onMenuClick={handleMenuClick} />
        </header>

        {/* Main Dynamic Dashboard Content */}
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6'>{children}</main>
      </div>
    </div>
  );
}

export default DashboardShell;
