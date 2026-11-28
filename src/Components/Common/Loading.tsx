import type { ReactElement } from 'react';
import './Loading.css';

// ============================================================================
// Types
// ============================================================================

interface LoadingProps {
  message?: string;
}

// ============================================================================
// Component (Works in both Server Components & Client Components)
// ============================================================================

export function Loading({ message = 'Loading...' }: LoadingProps): ReactElement {
  return (
    <div
      id='loading_fixed'
      role='status'
      aria-live='polite'
      aria-label={message}
      className='my-6 text-center z-[1111111]'
    >
      {/* Animated Gradient Spinner */}
      <div className='flex justify-center items-center'>
        <div className='relative w-20 h-20 animate-spin rounded-full bg-linear-to-r from-purple-400 via-blue-700 to-[#E94560]'>
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[69px] h-[69px] bg-gray-200 rounded-full border-2 border-white' />
        </div>
      </div>

      {/* Loading Label */}
      <p className='text-[19px] font-bold pt-2 text-gray-800'>{message}</p>
    </div>
  );
}

export default Loading;
