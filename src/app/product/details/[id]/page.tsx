'use client';

import Commitment from '@/Components/Commitment/Commitment';
import Loading from '@/Components/Common/Loading';
import Review from '@/Components/Review/Review';
import FindOne from '@/database/find/findOne/findOne';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { Suspense, useEffect, useState, useSyncExternalStore } from 'react';
import { BsShieldCheck, BsTruck } from 'react-icons/bs';
import { CiLocationOn } from 'react-icons/ci';
import { GoDotFill } from 'react-icons/go';
import { TiInputChecked } from 'react-icons/ti';

// ============================================================================
// Types (Supports both legacy DB fields & new Amazon-style productsSchema)
// ============================================================================

interface ProductPriceObject {
  basePrice?: number;
  discountPrice?: number;
  currency?: string;
}

interface ProductFeatureItem {
  facture?: string;
}

interface ProductSpecification {
  key?: string;
  value?: string;
}

interface ProductVariant {
  sku?: string;
  attributes?: {
    color?: string;
    shade?: string;
    size?: string;
    volume?: string;
    finish?: string;
  };
  price?: number;
  stock?: number;
  images?: string[];
}

interface ProductRecord {
  _id?: string;
  title?: string;
  brand?: string;
  sku?: string;
  description?: string;
  status?: string;
  inventoryStatus?: string;
  stock?: number;

  // Media (legacy & new schema)
  img?: string;
  mainImage?: string;
  gallery?: string[];

  // Pricing (legacy number or new object)
  price?: number | ProductPriceObject;
  productDiscount?: number;

  // Details & Specs
  productFacture?: ProductFeatureItem[];
  bulletPoints?: string[];
  specifications?: ProductSpecification[];
  cosmeticsDetails?: {
    skinType?: string[];
    ingredients?: string;
    howToUse?: string;
    countryOfOrigin?: string;
    shelfLifeMonths?: number;
    isAuthentic?: boolean;
  };
  ratings?: {
    average?: number;
    count?: number;
  };
  variants?: ProductVariant[];
}

interface ShadeOption {
  label: string;
  hex: string;
}

const DEFAULT_SHADES: ShadeOption[] = [
  { label: 'Ruby Rose', hex: '#be123c' },
  { label: 'Nude Peach', hex: '#e19b82' },
  { label: 'Berry Plum', hex: '#701a75' },
];

const DEFAULT_VOLUMES = ['30ml', '50ml', '100ml'];

// No-op subscribe for client-only date calculation without SSR mismatch
const emptySubscribe = (): (() => void) => () => {};

// ============================================================================
// Inner Component (Reads runtime URL hooks inside <Suspense>)
// ============================================================================

function FindSingleProductContent(): ReactElement {
  const params = useParams();
  const pathname = usePathname();

  const rawId = params?.id;
  const productId =
    typeof rawId === 'string'
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : pathname?.split('/').filter(Boolean).pop();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );

  const [selectedShade, setSelectedShade] = useState<string>(DEFAULT_SHADES[0].label);
  const [selectedVolume, setSelectedVolume] = useState<string>(DEFAULT_VOLUMES[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');

  // Calculate delivery estimate safely on client only
  let deliveryEstimate = '';
  if (isClient) {
    const estimate = new Date();
    estimate.setDate(estimate.getDate() + 3);
    const formattedDate = estimate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
    });
    const dayName = estimate.toLocaleDateString('en-US', { weekday: 'long' });
    deliveryEstimate = `${dayName}, ${formattedDate}`;
  }

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async (): Promise<void> => {
      if (!productId) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const result = (await FindOne(productId)) as {
          product?: ProductRecord;
        } | null;

        if (!isMounted) return;

        const fetched = result?.product ?? null;
        setProduct(fetched);

        if (fetched) {
          const primaryImg = fetched.mainImage || fetched.img || '';
          setActiveImage(primaryImg);

          const firstVariant = fetched.variants?.[0];
          if (firstVariant?.attributes?.shade || firstVariant?.attributes?.color) {
            setSelectedShade(
              firstVariant.attributes.shade ||
                firstVariant.attributes.color ||
                DEFAULT_SHADES[0].label,
            );
          }
          if (firstVariant?.attributes?.volume || firstVariant?.attributes?.size) {
            setSelectedVolume(
              firstVariant.attributes.volume || firstVariant.attributes.size || DEFAULT_VOLUMES[0],
            );
          }
        }
      } catch (error: unknown) {
        console.error('Error fetching product:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return <Loading />;
  }

  if (!product) {
    return (
      <section className='container mx-auto px-4 pt-32 pb-16 text-center font-sans'>
        <div className='max-w-md mx-auto rounded-3xl border border-line bg-brand-soft/60 p-8'>
          <h2 className='font-display text-2xl font-bold text-ink'>Product not found</h2>
          <p className='mt-2 text-sm text-ink-muted'>
            The cosmetic product you are looking for is unavailable.
          </p>
          <Link
            href='/products'
            className='mt-5 inline-block rounded-full bg-brand hover:bg-brand-hover px-6 py-2.5 text-sm font-semibold text-brand-foreground transition-colors'
          >
            Browse Products
          </Link>
        </div>
      </section>
    );
  }

  // Normalize pricing across legacy & new schema formats
  const basePrice =
    typeof product.price === 'number' ? product.price : Number(product.price?.basePrice ?? 0);

  const schemaDiscountPrice =
    typeof product.price === 'object' ? product.price?.discountPrice : undefined;

  const legacyDiscountPercent = Number(product.productDiscount ?? 0);

  const finalPrice =
    typeof schemaDiscountPrice === 'number' &&
    schemaDiscountPrice > 0 &&
    schemaDiscountPrice < basePrice
      ? schemaDiscountPrice
      : legacyDiscountPercent > 0
        ? Math.round(basePrice - (basePrice * legacyDiscountPercent) / 100)
        : basePrice;

  const discountPercent =
    basePrice > 0 && finalPrice < basePrice
      ? Math.round(((basePrice - finalPrice) / basePrice) * 100)
      : legacyDiscountPercent;

  // Normalize media gallery
  const mainPhoto = activeImage || product.mainImage || product.img || '';
  const galleryImages = Array.from(
    new Set(
      [product.mainImage || product.img, ...(product.gallery ?? [])].filter((src): src is string =>
        Boolean(src),
      ),
    ),
  );

  // Normalize features ("About This Item")
  const featureList =
    product.bulletPoints && product.bulletPoints.length > 0
      ? product.bulletPoints
      : (product.productFacture ?? [])
          .map((item) => item.facture)
          .filter((text): text is string => Boolean(text));

  // Normalize specifications (Cosmetics & Amazon-style fallback)
  const specRows: [string, string][] =
    product.specifications && product.specifications.length > 0
      ? product.specifications
          .filter((s): s is { key: string; value: string } => Boolean(s.key && s.value))
          .map((s) => [s.key, s.value])
      : [
          ['Brand', product.brand || 'Cosmetik Point'],
          ['Product Type', 'Cosmetics & Skincare'],
          ['Skin Type', product.cosmeticsDetails?.skinType?.join(', ') || 'All Skin Types'],
          ['Origin', product.cosmeticsDetails?.countryOfOrigin || 'Imported / Authentic'],
          [
            'Authenticity',
            product.cosmeticsDetails?.isAuthentic === false ? 'Standard' : '100% Authentic',
          ],
          ['SKU', product.sku || product._id?.slice(-8).toUpperCase() || 'CP-01'],
        ];

  const stockStatus = product.inventoryStatus || product.status || 'In Stock';
  const ratingCount = product.ratings?.count ?? 54;
  const stockLeft = typeof product.stock === 'number' ? product.stock : 5;

  return (
    <section className='font-sans bg-surface text-ink'>
      <div className='container mx-auto px-4 pt-32 pb-12'>
        {/* Main Product Card (Pattern matches reference design 3rd screen) */}
        <div className='mx-auto bg-surface border border-line shadow-sm rounded-3xl p-5 md:p-8 md:flex gap-8'>
          {/* Left - Product Images */}
          <div className='md:w-1/2 rounded-3xl bg-card-pink/60 border border-line p-4'>
            <div className='relative overflow-hidden rounded-2xl bg-surface'>
              {mainPhoto ? (
                <img
                  src={mainPhoto}
                  width={500}
                  height={500}
                  alt={product.title || 'Cosmetik Point product image'}
                  className='mx-auto rounded-2xl object-cover max-h-[440px] w-full'
                />
              ) : (
                <div className='flex h-[380px] items-center justify-center rounded-2xl bg-surface-muted text-ink-muted'>
                  No Image Available
                </div>
              )}

              <div className='absolute top-3 left-3 rounded-full bg-brand text-brand-foreground text-xs px-3 py-1 font-semibold shadow-xs'>
                100% Authentic Beauty Product
              </div>
            </div>

            {/* Thumbnail Images */}
            {galleryImages.length > 0 && (
              <div className='flex flex-wrap gap-2.5 pt-4'>
                {galleryImages.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type='button'
                    onClick={() => setActiveImage(src)}
                    className={`rounded-2xl border-2 p-0.5 transition cursor-pointer ${
                      mainPhoto === src
                        ? 'border-brand shadow-xs'
                        : 'border-line hover:border-brand/50'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.title || 'Product'} thumbnail ${idx + 1}`}
                      width={60}
                      height={60}
                      className='rounded-xl object-cover w-[60px] h-[60px]'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Details */}
          <div className='mt-8 md:mt-0 md:w-1/2 flex flex-col justify-between'>
            <div>
              {/* Brand Badge */}
              <span className='inline-block rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand mb-2'>
                {product.brand || 'Cosmetik Point'}
              </span>

              <h1 className='font-display text-2xl sm:text-3xl font-bold text-ink capitalize'>
                {product.title}
              </h1>

              {/* Ratings */}
              <div className='flex items-center space-x-1 mt-2 text-amber-400'>
                {'★★★★★'.split('').map((star, i) => (
                  <span key={i}>{star}</span>
                ))}
                <span className='text-ink-muted text-sm ml-2'>
                  {ratingCount} Ratings &bull; Verified Authentic
                </span>
              </div>

              {/* Price */}
              <div className='mt-4 flex items-center flex-wrap gap-2.5'>
                <span className='text-3xl font-bold text-brand'>
                  ৳ {finalPrice.toLocaleString()}
                </span>
                {discountPercent > 0 && basePrice > finalPrice && (
                  <>
                    <span className='text-ink-muted line-through text-base'>
                      ৳ {basePrice.toLocaleString()}
                    </span>
                    <span className='bg-brand-soft text-brand px-3 py-1 text-xs rounded-full font-semibold'>
                      -{discountPercent}% Off
                    </span>
                  </>
                )}
              </div>

              {/* Subtotal & Availability */}
              <div className='flex flex-wrap items-center gap-4 mt-3'>
                <div className='bg-brand-soft text-ink px-4 py-1.5 rounded-full text-sm font-semibold border border-line'>
                  Total: ৳ {(finalPrice * quantity).toLocaleString()}
                </div>
                <div className='flex items-center gap-1 text-sm font-medium text-emerald-700'>
                  <TiInputChecked className='text-lg text-emerald-600' />
                  <span>{stockStatus}</span>
                </div>
              </div>

              {/* Shade / Color Family Selection */}
              <div className='mt-5'>
                <h3 className='text-sm font-semibold text-ink'>
                  Shade / Color: <span className='text-brand'>{selectedShade}</span>
                </h3>
                <div className='flex space-x-2.5 mt-2'>
                  {DEFAULT_SHADES.map((shade) => (
                    <button
                      key={shade.label}
                      type='button'
                      aria-label={`Select shade ${shade.label}`}
                      title={shade.label}
                      onClick={() => setSelectedShade(shade.label)}
                      style={{ backgroundColor: shade.hex }}
                      className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                        selectedShade === shade.label
                          ? 'border-brand ring-2 ring-brand/30 scale-105'
                          : 'border-line'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Volume / Pack Size Selection */}
              <div className='mt-5'>
                <h3 className='text-sm font-semibold text-ink'>Size / Volume</h3>
                <div className='flex flex-wrap gap-2 mt-2'>
                  {DEFAULT_VOLUMES.map((volume) => (
                    <button
                      key={volume}
                      type='button'
                      onClick={() => setSelectedVolume(volume)}
                      className={`px-4 py-1.5 rounded-full border text-sm font-medium transition cursor-pointer ${
                        selectedVolume === volume
                          ? 'bg-brand text-brand-foreground border-brand shadow-xs'
                          : 'bg-surface text-ink-muted border-line hover:border-brand hover:text-brand'
                      }`}
                    >
                      {volume}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quantity Stepper & Action Buttons (Matches Reference Photo Bottom Bar) */}
            <div className='mt-7 pt-5 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center gap-3'>
              <div className='inline-flex items-center justify-between rounded-full border border-line bg-surface-muted px-3 py-1.5 gap-4'>
                <button
                  type='button'
                  aria-label='Decrease quantity'
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  className='w-7 h-7 rounded-full bg-surface border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center font-bold transition cursor-pointer'
                >
                  -
                </button>
                <span className='text-base font-semibold min-w-[20px] text-center'>{quantity}</span>
                <button
                  type='button'
                  aria-label='Increase quantity'
                  onClick={() => setQuantity((q) => q + 1)}
                  className='w-7 h-7 rounded-full bg-surface border border-line text-ink hover:border-brand hover:text-brand flex items-center justify-center font-bold transition cursor-pointer'
                >
                  +
                </button>
              </div>

              <button
                type='button'
                className='flex-1 rounded-full bg-brand hover:bg-brand-hover text-brand-foreground py-3 px-6 font-semibold shadow-sm transition cursor-pointer'
              >
                Add to Cart
              </button>

              <Link
                href='/product/payment'
                className='flex-1 rounded-full border border-brand bg-brand-soft hover:bg-brand text-brand hover:text-brand-foreground py-3 px-6 text-center font-semibold transition'
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>

        {/* Specifications & Delivery Section */}
        <div className='py-10'>
          <div className='lg:flex flex-row items-start gap-6'>
            {/* Left - Specs, Bullet Points & Description */}
            <div className='w-full space-y-8'>
              {/* Specifications */}
              <div className='rounded-3xl border border-line bg-surface p-6'>
                <h2 className='font-display text-2xl font-bold text-ink mb-4'>Specifications</h2>
                <dl className='grid grid-cols-2 md:grid-cols-3 gap-4'>
                  {specRows.map(([label, value]) => (
                    <div
                      key={label}
                      className='rounded-2xl bg-surface-muted border border-line p-3'
                    >
                      <dt className='text-ink-muted text-xs uppercase tracking-wide'>{label}</dt>
                      <dd className='font-semibold text-ink mt-1 text-sm'>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Product Features */}
              {featureList.length > 0 && (
                <div className='rounded-3xl border border-line bg-card-mint/50 p-6'>
                  <h2 className='font-display text-2xl font-bold text-ink mb-4'>About This Item</h2>
                  <ul className='space-y-3'>
                    {featureList.map((feature, index) => (
                      <li key={index} className='flex items-start gap-2.5'>
                        <GoDotFill className='mt-1.5 shrink-0 text-brand' />
                        <p className='w-full text-ink-muted'>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className='rounded-3xl border border-line bg-surface p-6'>
                <h3 className='font-display text-xl font-semibold text-ink mb-3'>Description</h3>
                <p className='text-ink-muted leading-relaxed whitespace-pre-line text-sm sm:text-base'>
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Right Sidebar - Delivery */}
            <aside className='w-full lg:w-[36%] shrink-0 mt-6 lg:mt-0 rounded-3xl border border-line bg-surface p-6 shadow-xs'>
              <h2 className='font-display text-2xl font-bold text-ink mb-3'>Delivery</h2>

              {/* Price Summary */}
              <div className='mb-5'>
                <div className='flex items-baseline gap-2'>
                  <span className='text-3xl font-bold text-brand'>
                    ৳ {finalPrice.toLocaleString()}
                  </span>
                  {discountPercent > 0 && basePrice > finalPrice && (
                    <>
                      <span className='text-ink-muted line-through text-sm'>
                        ৳ {basePrice.toLocaleString()}
                      </span>
                      <span className='text-brand font-semibold text-sm'>
                        {discountPercent}% off
                      </span>
                    </>
                  )}
                </div>
                <p className='text-ink-muted mt-1 text-sm'>
                  Fast delivery inside Dhaka city &amp; all over Bangladesh (৳60 to ৳150). Cash on
                  Delivery available.
                </p>
              </div>

              {/* Delivery Info Card */}
              <div className='bg-brand-soft border border-line p-4 rounded-2xl mb-5'>
                <p className='font-semibold text-ink mb-2 text-sm'>If you order today</p>
                {deliveryEstimate && (
                  <div className='flex items-center gap-2 mb-2'>
                    <BsTruck className='w-5 h-5 text-brand shrink-0' />
                    <span className='text-sm font-semibold text-ink'>
                      Delivery by: {deliveryEstimate}
                    </span>
                  </div>
                )}

                <div className='flex items-center gap-2 mb-2'>
                  <CiLocationOn className='w-5 h-5 text-brand shrink-0' />
                  <span className='text-sm font-medium text-ink'>Delivery across Bangladesh</span>
                </div>

                {stockLeft > 0 && stockLeft <= 10 && (
                  <p className='text-brand text-xs font-semibold mt-2'>
                    Only {stockLeft} left in stock — order soon.
                  </p>
                )}
              </div>

              {/* Payment Security */}
              <div className='flex items-center gap-2 text-xs text-ink-muted mb-5'>
                <BsShieldCheck className='w-5 h-5 text-emerald-600 shrink-0' />
                <span>100% Secure Payment &amp; Authentic Products</span>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3'>
                <button
                  type='button'
                  className='w-full rounded-full bg-brand hover:bg-brand-hover text-brand-foreground py-3 transition font-semibold cursor-pointer'
                >
                  Add to Cart
                </button>
                <Link
                  href='/product/payment'
                  className='w-full rounded-full border border-brand bg-brand-soft hover:bg-brand text-brand hover:text-brand-foreground py-3 transition inline-block text-center font-semibold'
                >
                  Buy Now
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Other Sections */}
      <Review />
      <Commitment />
    </section>
  );
}

// ============================================================================
// Exported Page Component
// Wrapped in Suspense because Next.js 16 (cacheComponents: true) requires it
// when using `useParams()` / `usePathname()` on dynamic `[id]` routes.
// ============================================================================

export default function FindSingleProduct(): ReactElement {
  return (
    <Suspense fallback={<Loading />}>
      <FindSingleProductContent />
    </Suspense>
  );
}
