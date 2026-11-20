'use client';

import Loading from '@/Components/Common/Loading';
import { auth } from '@/app/firebase.init';
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
function getGoogleErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Google sign-in popup was closed.';
      case 'auth/cancelled-popup-request':
        return 'Sign-in request was cancelled. Please try again.';
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

export function SocialLogin(): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  // Handle Google OAuth popup sign-in and sync user with backend
  const handleGoogleSignIn = async (): Promise<void> => {
    setErrorMessage('');
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const signedInUser = result.user;

      if (signedInUser) {
        // Prepare user payload matching `src/models/usersSchema.ts`
        const userData = {
          displayName: signedInUser.displayName ?? 'Cosmetik Point User',
          userNumber: signedInUser.phoneNumber ?? '',
          email: signedInUser.email ?? '',
          emailVerified: signedInUser.emailVerified,
          photoURL: signedInUser.photoURL ?? '',
          role: 'user',
        };

        // Sync user with Cosmetik Point backend (non-blocking if API route is not built yet)
        if (signedInUser.email) {
          try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch('/api/users', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
              },
              body: JSON.stringify(userData),
            });

            if (response.ok) {
              const data = (await response.json()) as { token?: string };
              if (data?.token) {
                localStorage.setItem('token', data.token);
              }
            }
          } catch (syncError: unknown) {
            console.warn('Failed to sync Google user with backend:', syncError);
          }
        }

        // Redirect to Cosmetik Point homepage after successful login
        router.replace('/');
      }
    } catch (error: unknown) {
      setErrorMessage(getGoogleErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while Google sign-in popup is active
  if (loading) {
    return <Loading />;
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      {/* Accessible Google Sign-In Button */}
      <button
        type='button'
        onClick={handleGoogleSignIn}
        disabled={loading}
        aria-label='Sign in with Google'
        title='Sign in with Google'
        className='inline-flex items-center justify-center rounded-full p-1 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 cursor-pointer'
      >
        <FcGoogle className='text-4xl' />
      </button>

      {/* Display error message if Google login fails */}
      {errorMessage && (
        <p role='alert' className='text-sm text-red-600 text-center'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// Default export so `import SocialLogin from '...'` works cleanly
export default SocialLogin;
