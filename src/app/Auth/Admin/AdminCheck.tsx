'use client';

import { auth } from '@/app/firebase.init';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

interface AdminCheckProps {
  children: ReactNode;
}

export default function AdminCheck({
  children,
}: Readonly<AdminCheckProps>): ReactNode {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (!currentUser) {
        router.replace('/authentication/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div
        role='status'
        aria-live='polite'
        className='flex justify-center items-center h-screen text-gray-700 font-medium'
      >
        Loading...
      </div>
    );
  }

  // Only render children when an authenticated user is present
  return user ? <>{children}</> : null;
}
