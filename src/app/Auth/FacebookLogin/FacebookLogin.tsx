'use client';

import Loading from '@/Components/Common/Loading';
import { auth } from '@/app/firebase.init';
import { FirebaseError } from 'firebase/app';
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import type { ReactElement } from 'react';
import { useState } from 'react';
import { BsFacebook } from 'react-icons/bs';

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Firebase Facebook Auth error codes into readable messages.
 */
function getFacebookErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/popup-closed-by-user':
        return 'Facebook sign-in popup was closed.';
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
  return 'Facebook login failed. Please try again.';
}

// ============================================================================
// Component
// ============================================================================

export function FacebookLogin(): ReactElement {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const router = useRouter();

  // Trigger Facebook OAuth popup sign-in
  const handleFacebookSignIn = async (): Promise<void> => {
    setErrorMessage('');
    setLoading(true);

    try {
      const provider = new FacebookAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Redirect to Cosmetik Point homepage after successful login
      if (result.user) {
        router.replace('/');
      }
    } catch (error: unknown) {
      setErrorMessage(getFacebookErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while popup authentication is in progress
  if (loading) {
    return <Loading />;
  }

  return (
    <div className='flex flex-col items-center gap-2'>
      {/* Accessible Facebook Sign-In Button */}
      <button
        type='button'
        onClick={handleFacebookSignIn}
        disabled={loading}
        aria-label='Sign in with Facebook'
        title='Sign in with Facebook'
        className='inline-flex items-center justify-center rounded-full p-1 transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#2655ee] disabled:opacity-50 cursor-pointer'
      >
        <BsFacebook className='text-4xl text-[#2655ee]' />
      </button>

      {/* Display error message if Facebook login fails */}
      {errorMessage && (
        <p role='alert' className='text-sm text-red-600 text-center'>
          {errorMessage}
        </p>
      )}
    </div>
  );
}

// Default export so `import FacebookLogin from '...'` works cleanly
export default FacebookLogin;
