'use client';

import AdminCheck from '@/app/Auth/Admin/AdminCheck';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from 'firebase/auth';
import type { FormEvent, ReactNode } from 'react';
import { useState, useSyncExternalStore } from 'react';
import type { IconType } from 'react-icons';
import { FiEdit2 } from 'react-icons/fi';
import {
    HiOutlineCamera,
    HiOutlineLocationMarker,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineShieldCheck,
} from 'react-icons/hi';

// ============================================================================
// Types & Helpers
// ============================================================================

interface ContactInfoItem {
  icon: IconType;
  label: string;
  val: string;
}

// No-op subscribe function for safe client-only mount detection
const emptySubscribe = (): (() => void) => () => {};

const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

// ============================================================================
// Component
// ============================================================================

export default function AdminProfile(): ReactNode {
  const { user, loading } = useAuth();

  // Client-only check without triggering React 19 `set-state-in-effect`
  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  // Editable form states (empty string until user types, falling back to Firebase values)
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [fullNameInput, setFullNameInput] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [bioInput, setBioInput] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isClient || loading) {
    return (
      <div className='flex justify-center items-center h-64'>
        <div
          role='status'
          aria-label='Loading profile'
          className='animate-spin rounded-full h-8 w-8 border-b-2 border-[#f8426a]'
        />
      </div>
    );
  }

  const displayName = fullNameInput ?? user?.displayName ?? '';

  // Common Input Styles for consistency
  const inputBaseClass =
    'w-full px-4 py-2.5 rounded-xl border border-gray-200 transition-all duration-300 ease-in-out';
  const editFieldClass = `${inputBaseClass} ${
    isEditing
      ? 'bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent'
      : 'bg-gray-50 text-gray-600 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent'
  }`;
  const disabledFieldClass = `${inputBaseClass} bg-gray-100 text-gray-400 cursor-not-allowed`;

  const contactItems: ContactInfoItem[] = [
    {
      icon: HiOutlineMail,
      label: 'Email',
      val: user?.email || 'Not available',
    },
    {
      icon: HiOutlinePhone,
      label: 'Phone',
      val: phoneInput.trim() || '+880 1XXX-XXXXXX',
    },
    {
      icon: HiOutlineLocationMarker,
      label: 'Location',
      val: 'Dhaka, Bangladesh',
    },
  ];

  // Handle profile form save (updates Firebase displayName)
  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setStatusMessage('');
    setErrorMessage('');

    if (!user) {
      setErrorMessage('You must be logged in to update your profile.');
      return;
    }

    const trimmedName = displayName.trim();
    if (!trimmedName) {
      setErrorMessage('Full Name cannot be empty.');
      return;
    }

    setSaving(true);
    try {
      await updateProfile(user, { displayName: trimmedName });
      setIsEditing(false);
      setStatusMessage('Profile updated successfully.');
    } catch (error: unknown) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminCheck>
      {/* Note: If rendered inside DashboardLayout, you can reduce `pt-36` to `pt-4` */}
      <div className='max-w-5xl mx-auto space-y-6 animate-fadeIn pt-36'>
        {/* Header Section */}
        <div className='bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative'>
          <div className='h-40 md:h-48 bg-linear-to-r from-rose-500 to-pink-600 relative'>
            <button
              type='button'
              className='absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 cursor-pointer'
            >
              <HiOutlineCamera /> Change Cover
            </button>
          </div>

          <div className='px-6 md:px-10 pb-8'>
            <div className='flex flex-col md:flex-row items-start md:items-end gap-4 md:gap-6 -mt-16 md:-mt-20'>
              <div className='relative group cursor-pointer'>
                <img
                  src={user?.photoURL || DEFAULT_AVATAR}
                  alt={user?.displayName || 'Cosmetik Point Admin'}
                  className='w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg object-cover bg-white'
                />
              </div>

              <div className='flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2'>
                <div>
                  <h1 className='text-2xl md:text-3xl font-bold text-gray-800'>
                    {displayName || 'Admin'}
                  </h1>
                  <span className='bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full uppercase flex items-center gap-1 w-max mt-1'>
                    <HiOutlineShieldCheck /> Super Admin
                  </span>
                </div>

                <button
                  type='button'
                  onClick={() => setIsEditing((prev) => !prev)}
                  className='bg-rose-50 hover:bg-rose-100 text-rose-600 px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 border border-rose-200 transition cursor-pointer'
                >
                  <FiEdit2 /> {isEditing ? 'Editing Active' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Form Section */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Contact Info (Left) */}
          <div className='bg-white p-6 rounded-3xl shadow-sm border border-gray-100'>
            <h3 className='text-lg font-bold text-gray-800 mb-5'>Contact Info</h3>
            <div className='space-y-4'>
              {contactItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <div key={item.label} className='flex items-start gap-4'>
                    <div className='p-3 bg-gray-50 text-gray-600 rounded-xl'>
                      <IconComponent className='text-xl' />
                    </div>
                    <div>
                      <p className='text-xs font-semibold text-gray-400 uppercase'>{item.label}</p>
                      <p className='text-sm font-medium text-gray-800 break-all'>{item.val}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Personal Details Form (Right) */}
          <div className='lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100'>
            <h3 className='text-lg font-bold text-gray-800 mb-6'>Personal Details</h3>

            <form onSubmit={handleSaveProfile} className='space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
                {/* Full Name */}
                <div>
                  <label
                    htmlFor='admin-full-name'
                    className='block text-sm font-semibold text-gray-600 mb-1'
                  >
                    Full Name
                  </label>
                  <input
                    id='admin-full-name'
                    type='text'
                    value={displayName}
                    onChange={(e) => setFullNameInput(e.target.value)}
                    className={editFieldClass}
                  />
                </div>

                {/* Email (Read-only) */}
                <div>
                  <label
                    htmlFor='admin-email'
                    className='block text-sm font-semibold text-gray-600 mb-1'
                  >
                    Email Address
                  </label>
                  <input
                    id='admin-email'
                    type='email'
                    disabled
                    value={user?.email || ''}
                    className={disabledFieldClass}
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label
                    htmlFor='admin-phone'
                    className='block text-sm font-semibold text-gray-600 mb-1'
                  >
                    Phone
                  </label>
                  <input
                    id='admin-phone'
                    type='tel'
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder='+880 1XXX-XXXXXX'
                    className={editFieldClass}
                  />
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label
                    htmlFor='admin-role'
                    className='block text-sm font-semibold text-gray-600 mb-1'
                  >
                    Role
                  </label>
                  <input
                    id='admin-role'
                    type='text'
                    disabled
                    value='Super Admin'
                    className={disabledFieldClass}
                  />
                </div>
              </div>

              {/* Bio / Notes (`rows` must be a number in TypeScript) */}
              <div>
                <label
                  htmlFor='admin-bio'
                  className='block text-sm font-semibold text-gray-600 mb-1'
                >
                  Bio / Notes
                </label>
                <textarea
                  id='admin-bio'
                  rows={3}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  className={`${editFieldClass} resize-none`}
                  placeholder='Write something...'
                />
              </div>

              {/* Feedback Messages */}
              {errorMessage && (
                <p role='alert' className='text-sm text-red-600'>
                  {errorMessage}
                </p>
              )}
              {statusMessage && (
                <p role='status' className='text-sm text-emerald-600'>
                  {statusMessage}
                </p>
              )}

              {/* Submit Button */}
              <div className='flex justify-end pt-4 border-t border-gray-200'>
                <button
                  type='submit'
                  disabled={saving}
                  className='bg-[#f8426a] hover:bg-rose-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all cursor-pointer'
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminCheck>
  );
}
