'use client';

import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';
import { MdOutlineRedeem } from 'react-icons/md';
import { SiNewbalance } from 'react-icons/si';
import { TfiReload } from 'react-icons/tfi';
import Commitment from '@/Components/Commitment/Commitment';
import Loading from '@/Components/Common/Loading';
import GiftCard from '@/Components/GiftCard/GiftCard';
import Review from '@/Components/Review/Review';
import findAllNewArrivalsProducts from '@/database/find/allNewArrivalsProducts/findAllNewArrivalsProducts';

// ============================================================================
// Types & Constants
// ============================================================================

interface ProductPriceObject {
  basePrice?: number;
  discountPrice?: number;
}

interface GiftSetProductItem {
  _id: string;
  title?: string;
  img?: string;
  mainImage?: string;
  price?: number | ProductPriceObject;
  productDiscount?: number;
}

interface GiftToolCard {
  label: string;
  href: string;
  pastelClass: string;
  icon: ReactElement;
}

// Change to 'gift-sets' if your database products use 'gift-sets' as sectionName
const SECTION_NAME = 'registry-gifting';

// Pastel card rotation matching the design reference pattern
const PASTEL_CARD_CLASSES = [
  'bg-card-pink',
  'bg-card-mint',
  'bg-card-sky',
  'bg-card-lavender',
  'bg-card-cream',
] as const;

const GIFT_TOOLS: GiftToolCard[] = [
  {
    label: 'Redeem Beauty Gift Cards',
    href: '/products',
    pastelClass: 'bg-card-pink',
    icon: <MdOutlineRedeem className='mx-auto mb-3 text-3xl text-brand' />,
  },
  {
    label: 'Check Gift Card Balance',
    href: '/products',
    pastelClass: 'bg-card-mint',
    icon: <SiNewbalance className='mx-auto mb-3 text-3xl text-brand' />,
  },
  {
    label: 'Custom Gift Set Boxes',
    href: '/products',
    pastelClass: 'bg-card-lavender',
    icon: <TfiReload className='mx-auto mb-3 text-3xl text-brand' />,
  },
];

// ============================================================================
// Helpers
// ============================================================================

function getProductPricing(product: GiftSetProductItem): {
  basePrice: number;
  finalPrice: number;
  discountPercent: number;
} {
  const basePrice =
    typeof product.price === 'number'
      ? product.price
      : Number(product.price?.basePrice ?? 0);

  const objectDiscountPrice =
    typeof product.price === 'object' ? product.price?.discountPrice : undefined;

  const legacyDiscount = Number(product.productDiscount ?? 0);

  if (
    typeof objectDiscountPrice === 'number' &&
    objectDiscountPrice > 0 &&
    objectDiscountPrice < basePrice
  ) {
    const discountPercent = Math.round(
      ((basePrice - objectDiscountPrice) / basePrice) * 100
    );
    return { basePrice, finalPrice: objectDiscountPrice, discountPercent };
  }

  if (legacyDiscount > 0 && basePrice > 0) {
    const finalPrice = Math.round(basePrice - (basePrice * legacyDiscount) / 100);
    return { basePrice, finalPrice, discountPercent: legacyDiscount };
  }

  return { basePrice, finalPrice: basePrice, discountPercent: 0 };
}

// ============================================================================
// Component
// ============================================================================

export default function GiftSets(): ReactElement {
  const [products, setProducts] = useState<GiftSetProductItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);

  // Fetch gift set products safely without triggering React 19 `set-state-in-effect`
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async (): Promise<void> => {
      try {
        const response = (await findAllNewArrivalsProducts(
          SECTION_NAME,
          page
        )) as { data?: GiftSetProductItem[] } | null;

        if (isMounted) {
          setProducts(response?.data ?? []);
        }
      } catch (error: unknown) {
        console.error('Error fetching gift sets:', error);
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [page]);

  const handlePageChange = (nextPage: number): void => {
    setIsLoading(true);
    setPage(nextPage);
  };

  if (isLoading) {
    return <Loading />;
  }

  const totalPages = Math.ceil(products.length / 7);

  return (
    <section className='font-sans bg-surface text-ink'>
      {/* Hero Gift Set Banner */}
      <GiftCard />

      <div className='container mx-auto px-4 pt-6 pb-12'>
        {/* Section Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <span className='inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand mb-1.5'>
              Curated Beauty Boxes
            </span>
            <h1 className='font-display text-2xl sm:text-3xl font-bold text-ink capitalize'>
              Gift Sets
            </h1>
          </div>

          <Link
            href='/products'
            className='text-sm font-semibold text-brand hover:text-brand-hover hover:underline capitalize'
          >
            See all
          </Link>
        </div>

        {/* Gift Sets Grid or Clean Empty State */}
        {products.length === 0 ? (
          <div className='rounded-3xl border border-line bg-brand-soft/60 p-10 text-center my-6'>
            <h2 className='font-display text-xl font-semibold text-ink'>
              No gift sets available right now
            </h2>
            <p className='text-sm text-ink-muted mt-2 mb-5'>
              Explore our skincare, lipstick, and fragrance collections at
              Cosmetik Point.
            </p>
            <Link
              href='/products'
              className='inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors'
            >
              Browse All Cosmetics <FiArrowRight />
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5'>
            {products.map((product, index) => {
              const { basePrice, finalPrice, discountPercent } =
                getProductPricing(product);
              const imageUrl = product.mainImage || product.img || '';
              const titleText = product.title || 'Cosmetik Point Gift Set';
              const pastelClass =
                PASTEL_CARD_CLASSES[index % PASTEL_CARD_CLASSES.length];

              return (
                <article
                  key={product._id}
                  className={`group rounded-3xl border border-line ${pastelClass} p-3 shadow-xs hover:shadow-lg hover:border-brand/50 transition-all duration-300 flex flex-col`}
                >
                  <Link
                    href={`/product/details/${product._id}`}
                    className='flex flex-col flex-1'
                  >
                    {/* Product Image Wrapper */}
                    <div className='relative overflow-hidden rounded-2xl bg-surface'>
                      {discountPercent > 0 && (
                        <span className='absolute top-2.5 left-2.5 z-10 rounded-full bg-brand px-3 py-1 text-xs font-bold text-brand-foreground shadow-xs'>
                          {discountPercent}% Off
                        </span>
                      )}

                      {imageUrl ? (
                        <img
                          className='w-full h-[230px] object-cover group-hover:scale-105 transition-transform duration-300'
                          src={imageUrl}
                          alt={titleText}
                          loading='lazy'
                        />
                      ) : (
                        <div className='w-full h-[230px] flex items-center justify-center bg-surface-muted text-xs text-ink-muted'>
                          No Image Available
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className='pt-3 px-1 flex-1 flex flex-col justify-between text-start'>
                      <h2 className='font-display text-base font-semibold text-ink capitalize line-clamp-2 mb-3'>
                        {titleText.length > 48
                          ? `${titleText.slice(0, 48)}...`
                          : titleText}
                      </h2>

                      <div className='flex items-center justify-between gap-2 pt-1'>
                        <div>
                          {basePrice > 0 ? (
                            <div className='flex items-baseline gap-2'>
                              <span className='text-base font-bold text-ink'>
                                &#2547; {finalPrice.toLocaleString()}
                              </span>
                              {discountPercent > 0 && basePrice > finalPrice && (
                                <del className='text-xs text-ink-muted'>
                                  &#2547; {basePrice.toLocaleString()}
                                </del>
                              )}
                            </div>
                          ) : (
                            <span className='text-sm font-semibold text-brand'>
                              Coming Soon
                            </span>
                          )}
                        </div>

                        {/* Circular Action Pill */}
                        <span
                          aria-hidden='true'
                          className='inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-brand-foreground group-hover:bg-brand-hover transition-colors shrink-0'
                        >
                          <FiArrowRight className='text-sm' />
                        </span>
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {products.length > 7 && (
          <div className='flex justify-center gap-2 my-8'>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type='button'
                onClick={() => handlePageChange(n)}
                className={`h-9 w-9 rounded-full text-sm font-semibold transition-colors cursor-pointer ${
                  page === n
                    ? 'bg-brand text-brand-foreground shadow-sm'
                    : 'bg-surface border border-line text-ink-muted hover:border-brand hover:text-brand'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}

        {/* Cosmetics Gift Set Tools */}
        <div className='pt-10'>
          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5'>
            {GIFT_TOOLS.map((tool) => (
              <Link
                key={tool.label}
                href={tool.href}
                className={`block text-center rounded-3xl border border-line ${tool.pastelClass} py-9 px-4 shadow-xs hover:shadow-md hover:border-brand/50 transition-all`}
              >
                {tool.icon}
                <span className='font-display text-base font-semibold text-ink hover:text-brand transition-colors'>
                  {tool.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews & Commitments */}
      <Review />
      <Commitment />
    </section>
  );
}
