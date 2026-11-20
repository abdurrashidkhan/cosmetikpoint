'use client';

import Loading from '@/Components/Common/Loading';
import { auth } from '@/app/firebase.init';
import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ChangeEvent, FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import FacebookLogin from '../FacebookLogin/FacebookLogin';
import SocialLogin from '../SocialLogin/SocialLogin';

// ============================================================================
// Types & Constants
// ============================================================================

interface SignUpFormErrors {
  userName?: string;
  email?: string;
  password?: string;
}

// Change to '/login' if your login route is `src/app/login/page.tsx`
const LOGIN_ROUTE = '/authentication/login';

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Requires at least 6 characters, including 1 letter and 1 number (allows symbols)
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Maps Firebase Auth registration error codes to readable messages.
 */
function getSignUpErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Use at least 6 characters with letters and numbers.';
      default:
        return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Account creation failed. Please try again.';
}

// ============================================================================
// Component
// ============================================================================

export default function SignUp(): ReactElement {
  const router = useRouter();

  // Form field states
  const [userName, setUserName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [agree, setAgree] = useState<boolean>(false);

  // UI & feedback states
  const [fieldErrors, setFieldErrors] = useState<SignUpFormErrors>({});
  const [authError, setAuthError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Validate user inputs before calling Firebase
  const validateForm = (): boolean => {
    const errors: SignUpFormErrors = {};
    const trimmedName = userName.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      errors.userName = 'Please enter your name';
    } else if (trimmedName.length < 3) {
      errors.userName = 'Name must be at least 3 characters';
    }

    if (!trimmedEmail) {
      errors.email = 'Please enter your email';
    } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
      errors.email = 'Enter a valid email address';
    }

    if (!password) {
      errors.password = 'Please enter your password';
    } else if (password.length < 6) {
      errors.password = 'Minimum 6 characters required';
    } else if (!PASSWORD_PATTERN.test(password)) {
      errors.password = 'Include at least one letter and one number';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle terms checkbox toggle
  const handleAgreeChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setAgree(event.target.checked);
  };

  // Handle account creation, profile update, verification email & DB sync
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAuthError('');
    setSuccessMessage('');

    if (!agree || !validateForm()) {
      return;
    }

    const trimmedName = userName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      // 1. Create Firebase Auth user
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      // 2. Save display name to Firebase profile
      await updateProfile(credential.user, {
        displayName: trimmedName,
      });

      // 3. Send verification email
      await sendEmailVerification(credential.user);

      // 4. Save user record to Cosmetik Point MongoDB API (non-blocking if API isn't created yet)
      try {
        await fetch('/api/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: trimmedEmail,
            displayName: trimmedName,
            emailVerified: credential.user.emailVerified,
            photoURL: credential.user.photoURL ?? '',
            role: 'user',
          }),
        });
      } catch (dbError: unknown) {
        console.warn('Failed to sync user to database:', dbError);
      }

      setSuccessMessage('Account created! Please check your email for verification.');

      // Redirect to login page (or change to '/' if you prefer auto-login redirect)
      router.replace(LOGIN_ROUTE);
    } catch (error: unknown) {
      setAuthError(getSignUpErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner during signup request
  if (loading) {
    return <Loading />;
  }

  return (
    <section className='container mx-auto px-4 py-8'>
      <div className='min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-md w-full bg-slate-200 p-6 rounded-lg shadow-lg'>
          {/* Heading */}
          <div>
            <h1 className='mt-1 font-serif text-center text-3xl font-extrabold text-gray-900'>
              Sign Up to Cosmetik Point
            </h1>
          </div>

          {/* Registration Form */}
          <form className='mt-8 space-y-5' onSubmit={handleFormSubmit} noValidate>
            <div className='rounded-md space-y-3'>
              {/* User Name Input */}
              <div>
                <label htmlFor='userName' className='block text-slate-700 text-sm font-medium mb-1'>
                  Full Name
                </label>
                <input
                  id='userName'
                  name='userName'
                  type='text'
                  autoComplete='name'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white'
                  placeholder='Your Full Name'
                />
                {fieldErrors.userName && (
                  <p className='text-red-600 text-sm pt-1'>{fieldErrors.userName}</p>
                )}
              </div>

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
                  <p className='text-red-600 text-sm pt-1'>{fieldErrors.email}</p>
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
                  autoComplete='new-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className='appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white'
                  placeholder='Password'
                />
                {fieldErrors.password && (
                  <p className='text-red-600 text-sm pt-1'>{fieldErrors.password}</p>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className='flex items-center'>
              <input
                id='agree'
                name='agree'
                type='checkbox'
                checked={agree}
                onChange={handleAgreeChange}
                className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer'
              />
              <label htmlFor='agree' className='ml-2 block text-sm text-gray-900 cursor-pointer'>
                I agree to the terms and conditions
              </label>
            </div>

            {/* Auth Feedback Messages */}
            {authError && (
              <p role='alert' className='text-red-600 text-sm text-center'>
                {authError}
              </p>
            )}
            {successMessage && (
              <p role='status' className='text-green-700 text-sm text-center'>
                {successMessage}
              </p>
            )}

            {/* Submit Button */}
            <div>
              <button
                type='submit'
                disabled={!agree || loading}
                className='group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm rounded-md text-white bg-blue-800 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 font-bold hoverBtnSpacing cursor-pointer transition'
              >
                Create Account
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className='mt-5 text-center'>
            <Link
              className='text-blue-700 hover:text-blue-900 text-sm font-medium'
              href={LOGIN_ROUTE}
            >
              Already have an account? Login
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
