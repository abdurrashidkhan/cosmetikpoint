'use client';

import { auth } from '@/app/firebase.init';
import LoginWithFb from '@/Components/authentication/Facebbok/LoginWithFb';
import LoginWithGoogle from '@/Components/authentication/Google/LoginWithGoogle';
import Loading from '@/Components/Common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { Suspense, useEffect, useState } from 'react';

// ============================================================================
// Types & Constants
// ============================================================================

interface LoginFieldErrors {
  userEmail?: string;
  password?: string;
}

const EMAIL_PATTERN =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Ensures redirect path is internal to prevent open-redirect vulnerabilities.
 */
function getSafeRedirectPath(rawFrom: string | null): string {
  if (rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//')) {
    return rawFrom;
  }
  return '/';
}

/**
 * Converts Firebase Auth error codes into user-friendly error messages.
 */
function getLoginErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-credential':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        return 'Invalid email or password. Please try again.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Login failed. Please try again.';
}

// ============================================================================
// Inner Login Component (Reads `useSearchParams` inside Suspense)
// ============================================================================

function LoginContent(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = getSafeRedirectPath(searchParams.get('from'));

  // Auth listener via our Firebase 13 + React 19 compatible custom hook
  const {
    user: currentUser,
    loading: authLoading,
    error: authStateError,
  } = useAuth();

  // Form & UI states
  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<LoginFieldErrors>({});
  const [loginError, setLoginError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Redirect already-authenticated users (wait if a form submission & DB sync is in progress)
  useEffect(() => {
    if (!authLoading && !submitting && currentUser) {
      router.replace(redirectPath);
    }
  }, [authLoading, submitting, currentUser, router, redirectPath]);

  // Validate inputs before calling Firebase Auth
  const validateForm = (): boolean => {
    const errors: LoginFieldErrors = {};
    const trimmedEmail = userEmail.trim();

    if (!trimmedEmail) {
      errors.userEmail = 'Email is required';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.userEmail = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Sign in with email and password, then sync user to MongoDB
  const handleFormSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setLoginError('');

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        userEmail.trim(),
        password
      );

      const loggedInUser = credential.user;

      if (loggedInUser) {
        // Sync user with MongoDB so existing Firebase users are also saved in DB
        if (loggedInUser.email) {
          try {
            const res = await fetch('/api/users/create-account', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                displayName: loggedInUser.displayName ?? 'Cosmetik Point User',
                userNumber: loggedInUser.phoneNumber ?? '',
                email: loggedInUser.email.toLowerCase(),
                emailVerified: loggedInUser.emailVerified,
                photoURL: loggedInUser.photoURL ?? '',
              }),
            });

            if (!res.ok) {
              console.warn('Failed to sync login user to DB:', res.status);
            }
          } catch (dbError: unknown) {
            console.warn('Database sync error on login:', dbError);
          }
        }

        router.replace(redirectPath);
      }
    } catch (error: unknown) {
      setLoginError(getLoginErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner while checking auth state or signing in
  if (authLoading || submitting) {
    return <Loading />;
  }

  const displayError = loginError || authStateError?.message || '';

  return (
    <div className='flex flex-col justify-center items-center min-h-screen pt-28 pb-10 px-4 bg-gray-50 text-black'>
      {/* Main Container */}
      <div className='bg-white border border-gray-300 p-6 w-full max-w-sm rounded-md shadow-lg'>
        {/* Cosmetik Point Brand Heading */}
        <h1 className='text-center text-3xl font-bold font-serif text-gray-900 mb-2'>
          Cosmetik Point
        </h1>
        <p className='text-center text-gray-500 text-sm mb-6'>
          Sign in to your beauty &amp; skincare account
        </p>

        {/* Login Form */}
        <form className='space-y-4' onSubmit={handleFormSubmit} noValidate>
          {/* Email Field */}
          <div>
            <input
              type='email'
              id='userEmail'
              name='userEmail'
              autoComplete='email'
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder='Email address'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900'
            />
            {fieldErrors.userEmail && (
              <p className='text-red-500 text-sm mt-1'>
                {fieldErrors.userEmail}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <input
              type='password'
              id='password'
              name='password'
              autoComplete='current-password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='Password'
              className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white text-gray-900'
            />
            {fieldErrors.password && (
              <p className='text-red-500 text-sm mt-1'>
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Firebase Error Alert */}
          {displayError && (
            <p role='alert' className='text-red-600 text-sm text-center'>
              {displayError}
            </p>
          )}

          {/* Login Button */}
          <button
            type='submit'
            disabled={submitting}
            className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50 transition-all cursor-pointer'
          >
            Log in
          </button>
        </form>

        {/* Divider */}
        <div className='flex items-center my-4'>
          <div className='grow h-px bg-gray-300' />
          <span className='text-gray-400 text-sm px-2'>OR</span>
          <div className='grow h-px bg-gray-300' />
        </div>

        {/* Social Login Buttons */}
        <div className='text-[#0095F6] font-semibold text-center flex items-center justify-center gap-5'>
          <LoginWithGoogle />
          <strong className='text-gray-400'>||</strong>
          <LoginWithFb />
        </div>
      </div>

      {/* Sign-up & Forgot Password Links */}
      <div className='mt-6 text-center flex flex-col items-center gap-2'>
        <p className='text-sm'>
          Don&apos;t have an account?{' '}
          <Link
            href='/authentication/create-account'
            className='text-blue-600 font-medium hover:underline'
          >
            Sign up
          </Link>
        </p>
        <Link
          href='/password/forget'
          className='text-sm text-blue-600 cursor-pointer hover:underline'
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}

// ============================================================================
// Exported Page Component
// Wrapped in Suspense because Next.js 16 (cacheComponents: true) requires it
// whenever `useSearchParams()` is used.
// ============================================================================

export default function Login(): ReactElement {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent />
    </Suspense>
  );
}
