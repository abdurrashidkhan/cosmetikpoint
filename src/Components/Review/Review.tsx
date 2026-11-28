'use client';

import type { KeyboardEvent, ReactElement } from 'react';
import { useEffect, useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// ============================================================================
// Types & Constants
// ============================================================================

interface ReviewItem {
  id: number;
  name: string;
  initials: string;
  location: string;
  rating: number;
  content: string;
  pastelBgClass: string;
}

const REVIEWS: ReviewItem[] = [
  {
    id: 1,
    name: 'Nusrat Jahan',
    initials: 'NJ',
    location: 'Dhaka, Bangladesh',
    rating: 5,
    content:
      '100% authentic Korean skincare! Received my serum and sunscreen within 24 hours in Dhaka with cash on delivery. Packaging was super neat.',
    pastelBgClass: 'bg-card-pink',
  },
  {
    id: 2,
    name: 'Tasnim Akter',
    initials: 'TA',
    location: 'Chattogram, Bangladesh',
    rating: 5,
    content:
      'Finally found a reliable online cosmetics shop in Bangladesh. The lipsticks and moisturizers are completely original and reasonably priced.',
    pastelBgClass: 'bg-card-mint',
  },
  {
    id: 3,
    name: 'Rabbi Hosain',
    initials: 'RH',
    location: 'Sylhet, Bangladesh',
    rating: 5,
    content:
      'Ordered a skincare gift set for my sister. Customer support was very helpful and delivery reached Sylhet right on time!',
    pastelBgClass: 'bg-card-lavender',
  },
];

// ============================================================================
// Component
// ============================================================================

export function Review(): ReactElement {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-advance highlighted review every 3.5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = (): void => {
    setActiveIndex((prev) => (prev - 1 + REVIEWS.length) % REVIEWS.length);
  };

  const handleNext = (): void => {
    setActiveIndex((prev) => (prev + 1) % REVIEWS.length);
  };

  const handleCardKeyDown = (
    event: KeyboardEvent<HTMLElement>,
    index: number
  ): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setActiveIndex(index);
    }
  };

  return (
    <section
      aria-label='Customer reviews'
      className='container mx-auto px-4 my-12 font-sans'
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header & Controls */}
      <div className='flex items-center justify-between mb-6'>
        <div>
          <span className='inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand mb-2'>
            Customer Love
          </span>
          <h2 className='font-display text-2xl sm:text-3xl font-bold text-ink'>
            Happy Clients
          </h2>
          <p className='text-sm text-ink-muted mt-0.5'>
            Verified customer feedback across Bangladesh
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={handlePrev}
            aria-label='Previous review'
            className='p-2.5 rounded-full border border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft hover:text-brand transition cursor-pointer'
          >
            <FiChevronLeft className='text-lg' />
          </button>
          <button
            type='button'
            onClick={handleNext}
            aria-label='Next review'
            className='p-2.5 rounded-full border border-line bg-surface text-ink hover:border-brand hover:bg-brand-soft hover:text-brand transition cursor-pointer'
          >
            <FiChevronRight className='text-lg' />
          </button>
        </div>
      </div>

      {/* Reviews Grid (Soft Pastel Cards matching theme pattern) */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {REVIEWS.map((review, index) => {
          const isActive = index === activeIndex;

          return (
            <article
              key={review.id}
              tabIndex={0}
              onClick={() => setActiveIndex(index)}
              onKeyDown={(e) => handleCardKeyDown(e, index)}
              className={`${
                isActive ? 'flex' : 'hidden lg:flex'
              } flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-5 p-6 rounded-3xl border transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand/40 ${
                review.pastelBgClass
              } ${
                isActive
                  ? 'border-brand shadow-lg ring-1 ring-brand/25 lg:-translate-y-1'
                  : 'border-line shadow-xs opacity-90 hover:opacity-100'
              }`}
            >
              {/* Initials Avatar using Dynamic Theme Brand Token */}
              <div
                className={`w-18 h-18 rounded-2xl shrink-0 flex items-center justify-center text-xl font-bold font-display shadow-sm transition-colors ${
                  isActive
                    ? 'bg-brand text-brand-foreground'
                    : 'bg-surface text-brand border border-line'
                }`}
              >
                {review.initials}
              </div>

              {/* Review Content */}
              <div className='flex-1 text-center sm:text-left lg:text-center xl:text-left'>
                {/* 5-Star Rating */}
                <div
                  className='flex items-center justify-center sm:justify-start lg:justify-center xl:justify-start gap-1 mb-2 text-amber-400'
                  aria-label={`${review.rating} out of 5 stars`}
                >
                  {Array.from({ length: review.rating }).map((_, starIdx) => (
                    <FaStar key={starIdx} className='text-sm' />
                  ))}
                </div>

                <h3 className='font-display text-lg font-semibold text-ink'>
                  {review.name}
                </h3>
                <p className='text-xs text-brand font-medium mb-2'>
                  {review.location}
                </p>
                <p className='text-sm text-ink-muted leading-relaxed'>
                  &ldquo;{review.content}&rdquo;
                </p>
              </div>
            </article>
          );
        })}
      </div>

      {/* Pagination Pill Dots */}
      <div className='flex items-center justify-center gap-2 mt-6'>
        {REVIEWS.map((review, index) => (
          <button
            key={review.id}
            type='button'
            onClick={() => setActiveIndex(index)}
            aria-label={`Show review by ${review.name}`}
            className={`h-2.5 rounded-full transition-all cursor-pointer ${
              index === activeIndex
                ? 'w-7 bg-brand'
                : 'w-2.5 bg-line hover:bg-brand/40'
            }`}
          />
        ))}
      </div>
    </section>
  );
}

export default Review;
