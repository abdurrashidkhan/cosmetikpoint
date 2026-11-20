'use client';

import Commitment from '@/Components/Commitment/Commitment';
import Loading from '@/Components/Common/Loading';
import Review from '@/Components/Review/Review';
import FindOne from '@/database/find/findOne/findOne';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
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

// ============================================================================
// Component
// ============================================================================

export default function FindSingleProduct(): ReactElement {
  const params = useParams();
  const pathname = usePathname();

  const rawId = params?.id;
  const productId =
    typeof rawId === 'string'
      ? rawId
      : Array.isArray(rawId)
        ? rawId[0]
        : pathname?.split('/').filter(Boolean).pop();

  const [selectedShade, setSelectedShade] = useState<string>(DEFAULT_SHADES[0].label);
  const [selectedVolume, setSelectedVolume] = useState<string>(DEFAULT_VOLUMES[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [product, setProduct] = useState<ProductRecord | null>(null);
  const [activeImage, setActiveImage] = useState<string>('');
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>('');

  useEffect(() => {
    const estimate = new Date();
    estimate.setDate(estimate.getDate() + 3);
    const formattedDate = estimate.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
    });
    const dayName = estimate.toLocaleDateString('en-US', { weekday: 'long' });
    setDeliveryEstimate(`${dayName}, ${formattedDate}`);
  }, []);

  useEffect(() => {
    if (!productId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchProduct = async () => {
      setIsLoading(true);
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
      <section className='container mx-auto px-4 pt-[8rem] pb-16 text-center'>
        <h2 className='text-2xl font-semibold text-gray-800'>Product not found</h2>
        <p className='mt-2 text-gray-600'>
          The cosmetic product you are looking for is unavailable.
        </p>
        <Link
          href='/products'
          className='mt-5 inline-block rounded bg-purple-700 px-6 py-2.5 text-white hover:bg-purple-800 transition'
        >
          Browse Products
        </Link>
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
    <section>
      <div className='container mx-auto px-2 pt-[8rem] pb-10'>
        {/* Main Container */}
        <div className='mx-auto bg-white shadow-lg rounded-lg p-6 md:flex'>
          {/* Left - Product Images */}
          <div className='md:w-1/2 border border-[#f5f4f4] rounded shadow-2xl p-3'>
            <div className='relative'>
              {mainPhoto ? (
                <img
                  src={mainPhoto}
                  width={500}
                  height={500}
                  alt={product.title || 'Cosmetik Point product image'}
                  className='mx-auto rounded object-cover max-h-[450px] w-full'
                />
              ) : (
                <div className='flex h-[380px] items-center justify-center rounded bg-gray-100 text-gray-400'>
                  No Image Available
                </div>
              )}

              <div className='absolute top-2 left-2 bg-purple-700 text-white text-xs px-2 py-1 rounded capitalize font-medium'>
                100% Authentic Beauty Product
              </div>
              <hr className='my-2' />
            </div>

            {/* Thumbnail Images */}
            {galleryImages.length > 0 && (
              <div className='flex flex-wrap gap-2 px-2'>
                {galleryImages.map((src, idx) => (
                  <button
                    key={`${src}-${idx}`}
                    type='button'
                    onClick={() => setActiveImage(src)}
                    className={`rounded-lg border-2 p-0.5 transition ${
                      mainPhoto === src
                        ? 'border-purple-600'
                        : 'border-gray-300 hover:border-purple-400'
                    }`}
                  >
                    <img
                      src={src}
                      alt={`${product.title || 'Product'} thumbnail ${idx + 1}`}
                      width={60}
                      height={60}
                      className='rounded object-cover w-[60px] h-[60px]'
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right - Product Details */}
          <div className='mt-10 sm:mt-1 md:w-1/2 md:pl-6'>
            <h1 className='text-xl font-semibold capitalize'>{product.title}</h1>

            {/* Ratings */}
            <div className='flex items-center space-x-1 mt-2 text-yellow-500'>
              {'★★★★★'.split('').map((star, i) => (
                <span key={i}>{star}</span>
              ))}
              <span className='text-gray-600 text-sm ml-2'>
                {ratingCount} Ratings | Verified Authentic
              </span>
            </div>

            {/* Price */}
            <div className='mt-3 flex items-center flex-wrap gap-2'>
              <span className='text-2xl font-bold text-orange-500'>
                ৳ {finalPrice.toLocaleString()}
              </span>
              {discountPercent > 0 && basePrice > finalPrice && (
                <>
                  <span className='text-gray-500 line-through'>৳ {basePrice.toLocaleString()}</span>
                  <span className='bg-orange-100 text-orange-600 px-2 py-1 text-xs rounded font-medium'>
                    -{discountPercent}%
                  </span>
                </>
              )}
            </div>

            {/* Subtotal & Availability */}
            <div className='flex items-center gap-5 mt-2'>
              <div className='bg-orange-100 text-orange-700 px-3 py-1 inline-block rounded text-lg font-medium'>
                Total: ৳ {(finalPrice * quantity).toLocaleString()}
              </div>
              <div className='flex items-center gap-1 text-lg'>
                <TiInputChecked className='text-green-800' />
                <span className='text-green-700'>{stockStatus}</span>
              </div>
            </div>

            {/* Shade / Color Family Selection */}
            <div className='mt-4'>
              <h3 className='text-md font-semibold'>Shade / Color: {selectedShade}</h3>
              <div className='flex space-x-2 mt-2'>
                {DEFAULT_SHADES.map((shade) => (
                  <button
                    key={shade.label}
                    type='button'
                    aria-label={`Select shade ${shade.label}`}
                    title={shade.label}
                    onClick={() => setSelectedShade(shade.label)}
                    style={{ backgroundColor: shade.hex }}
                    className={`w-9 h-9 rounded-full border-2 transition ${
                      selectedShade === shade.label
                        ? 'border-purple-600 ring-2 ring-purple-300 scale-105'
                        : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Volume / Pack Size Selection */}
            <div className='mt-4'>
              <h3 className='text-md font-semibold'>Size / Volume</h3>
              <div className='flex space-x-2 mt-2'>
                {DEFAULT_VOLUMES.map((volume) => (
                  <button
                    key={volume}
                    type='button'
                    onClick={() => setSelectedVolume(volume)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition ${
                      selectedVolume === volume
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-purple-500'
                    }`}
                  >
                    {volume}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className='mt-4'>
              <h3 className='text-md font-semibold'>Quantity</h3>
              <div className='flex items-center space-x-4 mt-2'>
                <button
                  type='button'
                  onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
                  className='bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-semibold'
                >
                  -
                </button>
                <span className='text-lg font-semibold'>{quantity}</span>
                <button
                  type='button'
                  onClick={() => setQuantity((q) => q + 1)}
                  className='bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded font-semibold'
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='mt-6 flex space-x-4'>
              <Link
                href='/product/payment'
                className='w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded text-center font-semibold transition'
              >
                Buy Now
              </Link>
              <button
                type='button'
                className='w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded font-semibold transition'
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>

        {/* Specifications & Delivery Section */}
        <div className='py-10 px-2'>
          <div className='sm:flex flex-row items-start gap-5'>
            <div className='w-full h-auto sm:border-r sm:pr-5'>
              {/* Specifications */}
              <div className='mb-12'>
                <h2 className='text-2xl font-bold mb-4'>Specifications</h2>
                <dl className='grid grid-cols-2 md:grid-cols-3 gap-4 border rounded-lg p-4'>
                  {specRows.map(([label, value]) => (
                    <div key={label} className='border-b pb-2'>
                      <dt className='text-gray-600 text-sm'>{label}</dt>
                      <dd className='font-medium'>{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Product Features */}
              {featureList.length > 0 && (
                <div className='mb-12'>
                  <h2 className='text-2xl font-bold mb-4'>About This Item</h2>
                  <ul className='space-y-3'>
                    {featureList.map((feature, index) => (
                      <li key={index} className='flex items-start gap-2'>
                        <GoDotFill className='mt-1.5 shrink-0 text-purple-600' />
                        <p className='w-full'>{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Description */}
              <div className='border-t pt-8'>
                <h3 className='text-lg font-semibold mb-4'>Product Description</h3>
                <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                  {product.description || 'No description available.'}
                </p>
              </div>
            </div>

            {/* Right Sidebar - Delivery */}
            <div className='w-full sm:w-[35%] h-auto shrink-0'>
              <h2 className='text-2xl font-bold mb-3 sm:mt-0 mt-5'>Delivery</h2>

              <div>
                {/* Price Summary */}
                <div className='mb-6'>
                  <div className='flex items-baseline gap-2'>
                    <span className='text-3xl font-bold'>৳ {finalPrice.toLocaleString()}</span>
                    {discountPercent > 0 && basePrice > finalPrice && (
                      <>
                        <span className='text-gray-500 line-through'>
                          ৳ {basePrice.toLocaleString()}
                        </span>
                        <span className='text-red-600 font-medium'>{discountPercent}% off</span>
                      </>
                    )}
                  </div>
                  <p className='text-gray-600 mt-1 text-sm'>
                    Fast delivery inside Dhaka city & all over Bangladesh (৳60 to ৳150). Cash on
                    Delivery available.
                  </p>
                </div>

                {/* Delivery Info */}
                <div className='bg-blue-50 p-4 rounded-lg mb-6'>
                  <p className='font-medium capitalize text-slate-800 mb-2'>If you order today</p>
                  {deliveryEstimate && (
                    <div className='flex items-center gap-2 mb-2'>
                      <BsTruck className='w-5 h-5 text-blue-600 shrink-0' />
                      <span className='text-[15px] font-semibold capitalize'>
                        Delivery by: {deliveryEstimate}
                      </span>
                    </div>
                  )}

                  <div className='flex items-center gap-2 mb-2'>
                    <CiLocationOn className='w-5 h-5 text-blue-700 shrink-0' />
                    <span className='text-base font-medium capitalize'>
                      Delivery across Bangladesh
                    </span>
                  </div>

                  {stockLeft > 0 && stockLeft <= 10 && (
                    <p className='text-red-600 text-sm mt-2'>
                      Only {stockLeft} left in stock — order soon.
                    </p>
                  )}
                </div>

                {/* Payment Security */}
                <div className='flex items-center gap-2 text-sm text-gray-600 mb-5'>
                  <BsShieldCheck className='w-5 h-5 text-green-600 shrink-0' />
                  <span>100% Secure Payment & Authentic Products</span>
                </div>

                {/* Action Buttons */}
                <div className='space-y-4 mb-8'>
                  <button
                    type='button'
                    className='w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition font-semibold'
                  >
                    Add to Cart
                  </button>
                  <Link
                    href='/product/payment'
                    className='w-full bg-yellow-400 text-black py-3 rounded hover:bg-yellow-500 transition inline-block text-center font-semibold'
                  >
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Other Sections */}
      <Review />
      <Commitment />
    </section>
  );
}
