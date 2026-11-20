'use client';

import { auth } from '@/app/firebase.init';
import LoginWithFb from '@/Components/authentication/Facebbok/LoginWithFb';
import LoginWithGoogle from '@/Components/authentication/Google/LoginWithGoogle';
import Loading from '@/Components/Common/Loading';
import { useAuth } from '@/hooks/useAuth';
import { FirebaseError } from 'firebase/app';
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { FormEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';

// ============================================================================
// Types & Constants
// ============================================================================

interface SignUpFieldErrors {
  userName?: string;
  userNumber?: string;
  userEmail?: string;
  password?: string;
}

const EMAIL_PATTERN = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Matches standard Bangladesh mobile numbers (e.g. 017XXXXXXXX or +88017XXXXXXXX)
const BD_PHONE_PATTERN = /^(?:\+?88)?01[3-9]\d{8}$/;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Converts Firebase registration errors into readable user-facing messages.
 */
function getSignUpErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Password is too weak. Please use at least 6 characters.';
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
  const { user: currentUser, loading: authLoading } = useAuth();

  // Form field states
  const [userName, setUserName] = useState<string>('');
  const [userNumber, setUserNumber] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  // UI & feedback states
  const [fieldErrors, setFieldErrors] = useState<SignUpFieldErrors>({});
  const [authError, setAuthError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Redirect already-authenticated users to homepage
  useEffect(() => {
    if (!authLoading && currentUser) {
      router.replace('/');
    }
  }, [authLoading, currentUser, router]);

  // Validate form inputs before calling Firebase
  const validateForm = (): boolean => {
    const errors: SignUpFieldErrors = {};
    const trimmedName = userName.trim();
    const trimmedPhone = userNumber.trim();
    const trimmedEmail = userEmail.trim();

    if (!trimmedName) {
      errors.userName = 'Name is required';
    } else if (trimmedName.length < 3) {
      errors.userName = 'Name must be at least 3 characters';
    }

    if (!trimmedPhone) {
      errors.userNumber = 'Mobile number is required';
    } else if (!BD_PHONE_PATTERN.test(trimmedPhone)) {
      errors.userNumber = 'Enter a valid Bangladesh mobile number (e.g. 017XXXXXXXX)';
    }

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

  // Create Firebase account, update display name, and sync user to MongoDB
  const handleFormSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setAuthError('');

    if (!validateForm()) {
      return;
    }

    const trimmedName = userName.trim();
    const trimmedPhone = userNumber.trim();
    const trimmedEmail = userEmail.trim().toLowerCase();

    setSubmitting(true);
    try {
      // 1. Create account in Firebase Auth
      const credential = await createUserWithEmailAndPassword(auth, trimmedEmail, password);

      // 2. Update display name on Firebase profile
      await updateProfile(credential.user, {
        displayName: trimmedName,
      });

      // 3. Send verification email (optional non-blocking)
      try {
        await sendEmailVerification(credential.user);
      } catch (verifyError: unknown) {
        console.warn('Could not send verification email:', verifyError);
      }

      // 4. Sync safe user profile to MongoDB (do NOT send raw password)
      const userInfo = {
        displayName: trimmedName,
        userNumber: trimmedPhone,
        email: trimmedEmail,
        emailVerified: credential.user.emailVerified,
        photoURL: credential.user.photoURL ?? '',
        role: 'user',
      };

      try {
        const res = await fetch('/api/users/create-account', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userInfo),
        });

        if (!res.ok) {
          console.warn('Backend user sync returned status:', res.status);
        }
      } catch (dbError: unknown) {
        console.warn('Failed to insert user info:', dbError);
      }

      // 5. Clear form and redirect to Cosmetik Point homepage
      setUserName('');
      setUserNumber('');
      setUserEmail('');
      setPassword('');
      router.replace('/');
    } catch (error: unknown) {
      setAuthError(getSignUpErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading spinner during initial auth check or account creation
  if (authLoading || submitting) {
    return <Loading />;
  }

  return (
    <section>
      <div className='container mx-auto bg-gray-50 px-2'>
        <div className='flex justify-center items-center min-h-screen py-8'>
          {/* Main Container */}
          <div className='bg-white border border-gray-300 p-6 w-full max-w-sm rounded-md shadow-sm'>
            {/* Cosmetik Point Brand Heading */}
            <h1 className='text-center text-3xl font-bold font-serif text-gray-900 mb-2'>
              Cosmetik Point
            </h1>

            {/* Subtitle */}
            <p className='text-center text-gray-500 text-sm mb-5'>
              Create your account to shop authentic cosmetics &amp; skincare in Bangladesh.
            </p>

            {/* Social Login Buttons */}
            <div className='text-[#0095F6] font-semibold text-center flex items-center justify-center gap-5'>
              <LoginWithGoogle />
              <strong className='text-gray-400'>||</strong>
              <LoginWithFb />
            </div>

            {/* Divider */}
            <div className='flex items-center my-4'>
              <div className='flex-grow h-px bg-gray-300' />
              <span className='text-gray-400 text-sm px-2'>OR</span>
              <div className='flex-grow h-px bg-gray-300' />
            </div>

            {/* Sign Up Form */}
            <form onSubmit={handleFormSubmit} className='space-y-3' noValidate>
              {/* Full Name */}
              <div>
                <input
                  type='text'
                  name='userName'
                  autoComplete='name'
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder='Full Name'
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900'
                />
                {fieldErrors.userName && (
                  <p className='text-red-500 text-sm mt-1'>{fieldErrors.userName}</p>
                )}
              </div>

              {/* Mobile Number (`type="tel"` preserves leading 0 in BD numbers) */}
              <div>
                <input
                  type='tel'
                  name='userNumber'
                  autoComplete='tel'
                  value={userNumber}
                  onChange={(e) => setUserNumber(e.target.value)}
                  placeholder='Mobile Number (e.g. 017XXXXXXXX)'
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900'
                />
                {fieldErrors.userNumber && (
                  <p className='text-red-500 text-sm mt-1'>{fieldErrors.userNumber}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <input
                  type='email'
                  name='userEmail'
                  autoComplete='email'
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder='Email address'
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900'
                />
                {fieldErrors.userEmail && (
                  <p className='text-red-500 text-sm mt-1'>{fieldErrors.userEmail}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <input
                  type='password'
                  name='password'
                  autoComplete='new-password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Password'
                  className='block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900'
                />
                {fieldErrors.password && (
                  <p className='text-red-500 text-sm mt-1'>{fieldErrors.password}</p>
                )}
              </div>

              {/* Firebase Error Message */}
              {authError && (
                <p role='alert' className='text-red-600 text-sm text-center'>
                  {authError}
                </p>
              )}

              <button
                type='submit'
                disabled={submitting}
                className='w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all cursor-pointer'
              >
                Sign up
              </button>
            </form>

            {/* Terms and Policies */}
            <div>
              <p className='text-xs text-gray-500 text-center mt-4'>
                By creating an account with Cosmetik Point, your details are kept secure for order
                updates and delivery across Bangladesh.
              </p>
              <p className='text-xs text-gray-500 text-center mt-2'>
                By signing up, you agree to our{' '}
                <Link href='/terms' className='text-blue-500 hover:underline'>
                  Terms
                </Link>
                ,{' '}
                <Link href='/privacy' className='text-blue-500 hover:underline'>
                  Privacy Policy
                </Link>
                , and{' '}
                <Link href='/cookies' className='text-blue-500 hover:underline'>
                  Cookies Policy
                </Link>
                .
              </p>
            </div>

            {/* Footer Section */}
            <div className='mt-6 text-center'>
              <p className='text-sm'>
                Have an account?{' '}
                <Link
                  href='/authentication/login'
                  className='text-blue-500 font-medium hover:underline'
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
