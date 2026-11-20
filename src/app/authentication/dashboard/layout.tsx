import AdminNavbar from '@/Components/Admin/DashBoard/AdminNavbar/AdminNavbar';
import Sidebar from '@/Components/Admin/DashBoard/Sidebar/Sidebar';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

// ============================================================================
// Metadata (Inherits `| Cosmetik Point` template from root layout)
// ============================================================================

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage products, orders, and payments for Cosmetik Point.',
  // Prevent search engines from indexing private admin dashboard routes
  robots: {
    index: false,
    follow: false,
  },
};

// ============================================================================
// Types
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
}

// ============================================================================
// Layout Component
// ============================================================================

export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>): ReactElement {
  return (
    <div className='flex h-screen bg-[#F8F9FD]'>
      {/* Left Sidebar Navigation (Desktop) */}
      <aside className='w-68 shrink-0 hidden md:block border-r border-gray-200 bg-white'>
        <Sidebar isOpen={true} />
      </aside>

      {/* Right Main Content Area */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        {/* Top Admin Header (Search, Notifications, Profile) */}
        <header className='h-16 shrink-0 bg-white border-b border-gray-200 flex items-center px-6'>
          <AdminNavbar />
        </header>

        {/* Main Dynamic Dashboard Content */}
        <main className='flex-1 overflow-x-hidden overflow-y-auto p-6'>{children}</main>
      </div>
    </div>
  );
}
