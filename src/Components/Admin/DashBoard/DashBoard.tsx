'use client';

import type { ReactNode } from 'react';
import { useEffect, useState, useSyncExternalStore } from 'react';

// ============================================================================
// Types & Helpers
// ============================================================================

interface DashBoardProps {
  children: ReactNode;
}

// No-op subscribe function for safe client-only mount detection
const emptySubscribe = (): (() => void) => () => {};

// ============================================================================
// Component
// ============================================================================

export function DashBoard({ children }: Readonly<DashBoardProps>): ReactNode {
  const [isOpen, setIsOpen] = useState<boolean>(true);

  // Detect client render without triggering React 19 `set-state-in-effect`
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Automatically collapse/expand state based on viewport width
  useEffect(() => {
    const handleResize = (): void => {
      setIsOpen(window.innerWidth >= 1024);
    };

    // Run initial check asynchronously to avoid synchronous setState in effect
    const frameId = requestAnimationFrame(handleResize);
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className='flex min-h-screen bg-[#F8F9FD]'>
      {/* Main Content Area */}
      <div className='flex-1 flex flex-col min-w-0 overflow-hidden'>
        {/* Top Sub-Header Bar */}
        {/* <header className='h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-30'>
s          <button
            type='button'
            onClick={() => setIsOpen((prev) => !prev)}
            aria-expanded={isOpen}
            aria-label={isOpen ? 'Collapse panel' : 'Expand panel'}
            className='p-2 bg-gray-50 rounded-lg text-gray-600 hover:text-rose-500 transition-all cursor-pointer'
          >
            {isOpen ? <HiChevronLeft size={24} /> : <HiMenuAlt2 size={24} />}
          </button>

          <div className='flex items-center gap-2'>
            <span className='h-2 w-2 rounded-full bg-emerald-500 animate-pulse' />
            <span className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
              Server: Live
            </span>
          </div>
        </header> */}

        {/* Main Body (uses <div> because DashboardLayout already provides <main>) */}
        <div className='p-6 md:p-10 overflow-y-auto'>
          <div className='max-w-7xl mx-auto'>{children}</div>
        </div>
      </div>
    </div>
  );
}

export default DashBoard;
