'use client';

import Loading from '@/Components/Common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect } from 'react';

// ============================================================================
// Constants & Types
// ============================================================================

// Verify this matches your login page route inside `src/app/` (e.g. `/authentication/login`)
const LOGIN_ROUTE = '/authentication/login';

interface RequireAuthProps {
  children: ReactNode;
}

// ============================================================================
// Component: Protects client routes by requiring an authenticated Firebase user
// ============================================================================

export function RequireAuth({ children }: Readonly<RequireAuthProps>): ReactNode {
  // Check Firebase auth state using our React 19 & Firebase 13 safe custom hook
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Redirect unauthenticated users to login (guard avoids redirect loop on login page)
    if (!loading && !user && pathname !== LOGIN_ROUTE) {
      const currentPath = pathname || '/';
      router.replace(`${LOGIN_ROUTE}?from=${encodeURIComponent(currentPath)}`);
    }
  }, [user, loading, router, pathname]);

  // Keep showing the loading spinner while checking auth or redirecting
  if (loading || !user) {
    return <Loading />;
  }

  // Render protected children only when the user is authenticated
  return <>{children}</>;
}

export default RequireAuth;
