'use client';

import { auth } from '@/app/firebase.init';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useEffect, useState } from 'react';

// ============================================================================
// Types
// ============================================================================

export interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

// ============================================================================
// Custom Hook: Subscribes to Firebase Auth state changes
// Compatible with Next.js 16, React 19, React Compiler, and Firebase 13+
// ============================================================================

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Subscribe to Firebase auth state listener on mount
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setError(null);
        setLoading(false);
      },
      (authError) => {
        // Ensure loading stops even if the auth listener throws an error
        setError(authError);
        setLoading(false);
      }
    );

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  return { user, loading, error };
}

// Default export so both `import useAuth` and `import { useAuth }` work
export default useAuth;