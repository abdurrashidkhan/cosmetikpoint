import DashboardShell from '@/Components/Admin/DashBoard/DashboardShell/DashboardShell';
import type { Metadata } from 'next';
import type { ReactElement, ReactNode } from 'react';

// ============================================================================
// Metadata (Inherits `| Cosmetik Point` template from root layout)
// ============================================================================

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Manage products, orders, and payments for Cosmetik Point.',
  robots: {
    index: false,
    follow: false,
  },
};

// ============================================================================
// Layout Component
// ============================================================================

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>): ReactElement {
  return <DashboardShell>{children}</DashboardShell>;
}
