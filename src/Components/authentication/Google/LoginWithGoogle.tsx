'use client';

import { auth } from '@/app/firebase.init';
import Loading from '@/Components/Common/Loading';
import { FirebaseError } from 'firebase/app';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Firebase Google Auth error codes into user-friendly messages.
 */
function getGoogleAuthError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in was cancelled. Please try again.';
      case 'auth/account-exists-with-different-credential':
        return 'An account already exists with this email using another sign-in method.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Google login failed. Please try again.';
}

// ============================================================================
// Component
// ============================================================================

export function LoginWithGoogle(): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  // Handle Google popup sign-in and sync user profile to MongoDB
  const handleGoogleLogin = async (): Promise<void> => {
    setErrorMessage('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      const signedInUser = credential.user;

      if (signedInUser) {
        // Sync user with Cosmetik Point database if email is available
        if (signedInUser.email) {
          const userInfo = {
            displayName: signedInUser.displayName ?? 'Cosmetik Point User',
            userNumber: signedInUser.phoneNumber ?? '',
            email: signedInUser.email.toLowerCase(),
            emailVerified: signedInUser.emailVerified,
            photoURL: signedInUser.photoURL ?? '',
            role: 'user',
          };

          try {
            const res = await fetch('/api/users/create-account', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(userInfo),
            });

            if (!res.ok) {
              console.warn('Failed to sync Google user:', res.status);
            }
          } catch (dbError: unknown) {
            console.warn('Database sync error:', dbError);
          }
        }

        // Redirect after DB sync completes
        router.replace('/');
      }
    } catch (error: unknown) {
      setErrorMessage(getGoogleAuthError(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className='flex flex-col items-center gap-1'>
      {/* Accessible Google Sign-In Button */}
      <button
        type='button'
        onClick={handleGoogleLogin}
        disabled={loading}
        aria-label='Sign in with Google'
        title='Sign in with Google'
        className='inline-flex items-center justify-center rounded-full p-1 hover:scale-110 transition-transform disabled:opacity-50 cursor-pointer'
      >
        <FcGoogle className='text-2xl' />
      </button>

      {/* Keep button visible so user can retry on error */}
      {errorMessage && (
        <p role='alert' className='text-xs text-red-600 text-center max-w-44'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

export default LoginWithGoogle;
