import Link from 'next/link';
import type { ReactElement } from 'react';
import { BsFillTelephoneFill } from 'react-icons/bs';
import { HiOutlineMail } from 'react-icons/hi';

// ============================================================================
// Component: Top announcement & contact bar above the main Navbar
// ============================================================================

export function TopBar(): ReactElement {
  return (
    <div className='bg-[#0F3460] py-3'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between'>
          {/* Left: Store Phone & Support Email */}
          <div className='flex items-center gap-3 md:gap-8'>
            <a
              href='tel:+8801617000000'
              className='text-white hover:text-rose-200 transition-colors flex items-center text-sm sm:text-base gap-2.5'
            >
              <BsFillTelephoneFill className='shrink-0' />
              <span>+8801617-XXXXXX</span>
            </a>

            <a
              href='mailto:support@Cosmetik Point.com'
              className='text-white hover:text-rose-200 transition-colors flex items-center text-sm sm:text-base gap-2.5'
            >
              <HiOutlineMail className='text-[22px] shrink-0' />
              <span>support@Cosmetik Point.com</span>
            </a>
          </div>

          {/* Right: Quick Help Links (Desktop) */}
          <div className='hidden md:flex items-center gap-8 text-white text-sm'>
            <Link href='/support' className='hover:text-rose-200 transition-colors'>
              FAQ&apos;s
            </Link>
            <Link href='/support' className='hover:text-rose-200 transition-colors'>
              Need Help?
            </Link>
            <span>BD | EN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TopBar;
