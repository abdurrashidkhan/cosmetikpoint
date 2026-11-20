'use client';

import Loading from '@/Components/Common/Loading';
import UseToken from '@/Components/Hook/UseToken';
import { auth } from '@/app/firebase.init';
import { FirebaseError } from 'firebase/app';
import {
    browserLocalPersistence,
    browserSessionPersistence,
    setPersistence,
    signInWithEmailAndPassword,
    type UserCredential,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { Suspense, useState } from 'react';
import FacebookLogin from '../FacebookLogin/FacebookLogin';
import SocialLogin from '../SocialLogin/SocialLogin';
import './Login.css';

// ============================================================================
// Types & Constants
// ============================================================================

interface LoginFormErrors {
  email?: string;
  password?: string;
}

// Standard email validation regex
const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Prevents open-redirect attacks by ensuring redirect paths are internal.
 */
function getSafeRedirectPath(rawFrom: string | null): string {
  if (rawFrom && rawFrom.startsWith('/') && !rawFrom.startsWith('//')) {
    return rawFrom;
  }
  return '/';
}

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
function getFirebaseErrorMessage(error: unknown): string {
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
// Inner Login Component (Reads searchParams inside Suspense)
// ============================================================================

function LoginContent(): ReactElement {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read `?from=/some-page` safely in Next.js App Router
  const redirectPath = getSafeRedirectPath(searchParams.get('from'));

  // Form & Auth states
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [fieldErrors, setFieldErrors] = useState<LoginFormErrors>({});
  const [authError, setAuthError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [userCredential, setUserCredential] = useState<UserCredential | null>(null);

  // Sync Firebase user with backend JWT / MongoDB user collection
  UseToken(userCredential);

  // Validate form inputs before calling Firebase
  const validateForm = (): boolean => {
    const errors: LoginFormErrors = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email is required';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    // Only check length on login so existing passwords with symbols still work
    if (!password) {
      errors.password = 'Please enter your password';
    } else if (password.length < 6) {
      errors.password = 'Minimum 6 characters required';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle email & password sign-in
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Keep user signed in across browser restarts only if "Remember me" is checked
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);

      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      setUserCredential(credential);

      // Redirect to intended page after successful sign-in
      if (credential.user) {
        router.replace(redirectPath);
      }
    } catch (error: unknown) {
      setAuthError(getFirebaseErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during authentication
  if (loading) {
    return <Loading />;
  }

  return (
    <section style={{ paddingTop: '2rem' }} className='container mx-auto px-4'>
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full bg-slate-200 p-6 rounded-lg shadow-lg'>
          {/* Brand Logo & Heading */}
          <div>
            <div className='user_icon'>
              <img
                className='mx-auto h-20 w-auto'
                src='https://i.ibb.co/Ct43kdn/image-removebg-preview-6.png'
                alt='Cosmetik Point Login'
              />
            </div>
            <h1 className='mt-2 font-serif text-center text-3xl font-extrabold text-gray-900'>
              Login to Cosmetik Point
            </h1>
          </div>

          {/* Login Form */}
          <form className='mt-8 space-y-6' onSubmit={handleFormSubmit} noValidate>
            <div className='rounded-md shadow-sm space-y-3'>
              {/* Email Input */}
              <div>
                <label htmlFor='email' className='block text-slate-700 text-sm font-medium mb-1'>
                  Email address
                </label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  autoComplete='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white'
                  placeholder='Email address'
                />
                {fieldErrors.email && (
                  <p className='text-red-500 text-sm pt-1'>{fieldErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor='password' className='block text-slate-700 text-sm font-medium mb-1'>
                  Password
                </label>
                <input
                  id='password'
                  name='password'
                  type='password'
                  autoComplete='current-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white'
                  placeholder='Password'
                />
                {fieldErrors.password && (
                  <p className='text-red-500 text-sm pt-1'>{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className='block sm:flex items-center justify-between'>
              <div className='flex items-center'>
                <input
                  id='remember-me'
                  name='remember-me'
                  type='checkbox'
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                />
                <label htmlFor='remember-me' className='ml-2 block text-sm text-gray-900'>
                  Remember me
                </label>
              </div>

              <div className='text-sm pt-2 md:p-0'>
                <Link
                  href='/forgot-password'
                  className='font-medium text-indigo-600 hover:text-indigo-500'
                >
                  Forgot your password?
                </Link>
              </div>
            </div>

            {/* Firebase Auth Error Alert */}
            {authError && (
              <p role='alert' className='text-red-600 text-sm text-center'>
                {authError}
              </p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={loading}
                className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm rounded-md text-white bg-blue-700 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-bold hoverBtnSpacing disabled:opacity-50 cursor-pointer'
              >
                Sign In
              </button>
            </div>
          </form>

          {/* Signup Redirect */}
          <div className='mt-5 text-center'>
            <Link className='text-blue-700 hover:text-blue-900 text-sm font-medium' href='/signup'>
              Create a new account?
            </Link>
          </div>

          {/* Social Login Options */}
          <div className='flex items-center gap-6 justify-center py-4'>
            <SocialLogin />
            <span>|</span>
            <FacebookLogin />
          </div>
        </div>
      </div>
    </section>
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
