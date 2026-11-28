'use client';

import Link from 'next/link';
import type { FormEvent, ReactElement } from 'react';
import { useState, useSyncExternalStore } from 'react';
import { BsShieldCheck, BsTruck } from 'react-icons/bs';
import { FiArrowRight, FiMinus, FiPlus, FiShoppingBag, FiTag, FiTrash2 } from 'react-icons/fi';

// ============================================================================
// Types & Constants
// ============================================================================

export interface CartProductItem {
  _id: string;
  title: string;
  brand?: string;
  shade?: string;
  volume?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  img?: string;
}

type DeliveryZone = 'dhaka' | 'outside';

const CART_STORAGE_KEY = 'cosmetikpoint-cart';
const CART_EVENT = 'cosmetikpoint-cart-change';
const FREE_SHIPPING_THRESHOLD = 2000;

const PASTEL_BG_CLASSES = [
  'bg-card-pink',
  'bg-card-mint',
  'bg-card-sky',
  'bg-card-lavender',
] as const;

const SAMPLE_ITEMS: CartProductItem[] = [
  {
    _id: 'sample-lipstick-01',
    title: 'Luxury Matte Lipstick Set',
    brand: 'Cosmetik Point',
    shade: 'Ruby Rose',
    volume: 'Set of 5',
    price: 1250,
    originalPrice: 1550,
    quantity: 1,
  },
  {
    _id: 'sample-serum-02',
    title: 'Hydrating Snail Mucin Repair Serum',
    brand: 'K-Beauty BD',
    shade: 'Clear Essence',
    volume: '50ml',
    price: 890,
    originalPrice: 1050,
    quantity: 1,
  },
];

// ============================================================================
// External Cart Store Helpers (SSR & React 19 `useSyncExternalStore` safe)
// ============================================================================

const EMPTY_CART: CartProductItem[] = [];
let cachedRawCart: string | null = null;
let cachedParsedCart: CartProductItem[] = EMPTY_CART;

function subscribeToCart(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(CART_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(CART_EVENT, callback);
  };
}

function getCartSnapshot(): CartProductItem[] {
  const raw = window.localStorage.getItem(CART_STORAGE_KEY);
  if (raw === cachedRawCart) {
    return cachedParsedCart;
  }

  cachedRawCart = raw;
  if (!raw) {
    cachedParsedCart = EMPTY_CART;
    return cachedParsedCart;
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    cachedParsedCart = Array.isArray(parsed) ? (parsed as CartProductItem[]) : EMPTY_CART;
  } catch {
    cachedParsedCart = EMPTY_CART;
  }

  return cachedParsedCart;
}

function getServerCartSnapshot(): CartProductItem[] {
  return EMPTY_CART;
}

function saveCartItems(items: CartProductItem[]): void {
  const serialized = JSON.stringify(items);
  cachedRawCart = serialized;
  cachedParsedCart = items;
  window.localStorage.setItem(CART_STORAGE_KEY, serialized);
  window.dispatchEvent(new Event(CART_EVENT));
}

// ============================================================================
// Component
// ============================================================================

export default function ShoppingCartPage(): ReactElement {
  const cartItems = useSyncExternalStore(subscribeToCart, getCartSnapshot, getServerCartSnapshot);

  const [deliveryZone, setDeliveryZone] = useState<DeliveryZone>('dhaka');
  const [promoCode, setPromoCode] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<string>('');
  const [promoMessage, setPromoMessage] = useState<string>('');

  // Quantity & item handlers
  const handleQuantityChange = (id: string, delta: number): void => {
    const updated = cartItems.map((item) => {
      if (item._id !== id) return item;
      const nextQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: nextQty };
    });
    saveCartItems(updated);
  };

  const handleRemoveItem = (id: string): void => {
    const updated = cartItems.filter((item) => item._id !== id);
    saveCartItems(updated);
  };

  const handleClearCart = (): void => {
    saveCartItems([]);
    setAppliedPromo('');
    setPromoMessage('');
  };

  const handleLoadSampleCart = (): void => {
    saveCartItems(SAMPLE_ITEMS);
  };

  // Apply promo code (`FIRST25` -> 25% off, `COSMETIK10` -> 10% off)
  const handleApplyPromo = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const code = promoCode.trim().toUpperCase();

    if (!code) {
      setPromoMessage('Please enter a promo code.');
      return;
    }

    if (code === 'FIRST25' || code === 'COSMETIK10') {
      setAppliedPromo(code);
      setPromoMessage(
        code === 'FIRST25'
          ? '25% First Order Discount applied!'
          : '10% Cosmetik Point Discount applied!',
      );
    } else {
      setAppliedPromo('');
      setPromoMessage('Invalid code. Try FIRST25 or COSMETIK10.');
    }
  };

  // Price calculations in BDT
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const discountRate = appliedPromo === 'FIRST25' ? 0.25 : appliedPromo === 'COSMETIK10' ? 0.1 : 0;
  const promoDiscount = Math.round(subtotal * discountRate);
  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);

  const qualifiesFreeShipping = discountedSubtotal >= FREE_SHIPPING_THRESHOLD;
  const baseShippingFee = deliveryZone === 'dhaka' ? 70 : 130;
  const shippingFee = cartItems.length === 0 || qualifiesFreeShipping ? 0 : baseShippingFee;
  const grandTotal = discountedSubtotal + shippingFee;

  return (
    <main className='min-h-screen bg-surface text-ink font-sans pt-32 pb-16'>
      <div className='container mx-auto px-4'>
        {/* Top Promo Banner (Matches Reference Photo Style) */}
        <div className='rounded-3xl bg-brand-soft border border-line px-5 py-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
          <div>
            <span className='inline-block rounded-full bg-brand px-3 py-0.5 text-[11px] font-bold text-brand-foreground uppercase tracking-wider mb-1'>
              Special Offer
            </span>
            <p className='font-display text-lg sm:text-xl font-bold text-ink'>
              Up to 25% off First Order Discount
            </p>
            <p className='text-xs text-ink-muted'>
              Use code <strong className='text-brand'>FIRST25</strong> at checkout &bull; Free BD
              delivery on orders above ৳ {FREE_SHIPPING_THRESHOLD.toLocaleString()}
            </p>
          </div>
          <Link
            href='/products'
            className='inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:text-brand-hover shrink-0'
          >
            Continue Shopping <FiArrowRight />
          </Link>
        </div>

        {/* Page Title */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='font-display text-2xl sm:text-3xl font-bold text-ink'>
              Your Shopping Bag
            </h1>
            <p className='text-sm text-ink-muted mt-0.5'>
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your Cosmetik Point
              bag
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type='button'
              onClick={handleClearCart}
              className='text-xs sm:text-sm font-semibold text-brand hover:underline cursor-pointer'
            >
              Clear Bag
            </button>
          )}
        </div>

        {/* Empty State vs Populated Cart */}
        {cartItems.length === 0 ? (
          <div className='rounded-3xl border border-line bg-card-pink/50 p-10 sm:p-14 text-center max-w-2xl mx-auto my-8'>
            <div className='w-16 h-16 rounded-full bg-brand-soft text-brand mx-auto flex items-center justify-center mb-4'>
              <FiShoppingBag className='text-2xl' />
            </div>
            <h2 className='font-display text-2xl font-bold text-ink'>Your beauty bag is empty</h2>
            <p className='text-sm text-ink-muted mt-2 mb-6 max-w-md mx-auto'>
              Discover authentic skincare, matte lipsticks, serums, and gift sets delivered fast
              across Bangladesh.
            </p>
            <div className='flex flex-wrap items-center justify-center gap-3'>
              <Link
                href='/products'
                className='inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover px-6 py-3 text-sm font-semibold text-brand-foreground transition-colors'
              >
                Explore Cosmetics <FiArrowRight />
              </Link>
              <button
                type='button'
                onClick={handleLoadSampleCart}
                className='inline-flex items-center gap-2 rounded-full border border-line bg-surface hover:border-brand px-5 py-3 text-sm font-semibold text-ink hover:text-brand transition-colors cursor-pointer'
              >
                Preview Sample Items
              </button>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
            {/* Left Column: Cart Items */}
            <div className='lg:col-span-8 space-y-4'>
              {cartItems.map((item, index) => {
                const pastelBg = PASTEL_BG_CLASSES[index % PASTEL_BG_CLASSES.length];

                return (
                  <article
                    key={item._id}
                    className={`rounded-3xl border border-line ${pastelBg} p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-xs transition-all`}
                  >
                    {/* Product Thumbnail */}
                    <div className='w-24 h-24 rounded-2xl bg-surface border border-line overflow-hidden shrink-0 flex items-center justify-center'>
                      {item.img ? (
                        <img
                          src={item.img}
                          alt={item.title}
                          className='w-full h-full object-cover'
                        />
                      ) : (
                        <FiShoppingBag className='text-2xl text-brand' />
                      )}
                    </div>

                    {/* Product Info */}
                    <div className='flex-1 min-w-0'>
                      <p className='text-xs font-semibold text-brand uppercase tracking-wide'>
                        {item.brand || 'Cosmetik Point'}
                      </p>
                      <h2 className='font-display text-lg font-semibold text-ink truncate'>
                        {item.title}
                      </h2>
                      {(item.shade || item.volume) && (
                        <p className='text-xs text-ink-muted mt-0.5'>
                          {[item.shade, item.volume].filter(Boolean).join(' • ')}
                        </p>
                      )}

                      <div className='flex items-baseline gap-2 mt-2'>
                        <span className='text-base font-bold text-ink'>
                          ৳ {(item.price * item.quantity).toLocaleString()}
                        </span>
                        {item.originalPrice && item.originalPrice > item.price && (
                          <del className='text-xs text-ink-muted'>
                            ৳ {(item.originalPrice * item.quantity).toLocaleString()}
                          </del>
                        )}
                      </div>
                    </div>

                    {/* Pill Stepper & Remove Button */}
                    <div className='flex items-center gap-3 self-end sm:self-center'>
                      <div className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-2.5 py-1'>
                        <button
                          type='button'
                          aria-label={`Decrease quantity of ${item.title}`}
                          onClick={() => handleQuantityChange(item._id, -1)}
                          className='w-7 h-7 rounded-full bg-surface-muted text-ink hover:bg-brand-soft hover:text-brand flex items-center justify-center transition cursor-pointer'
                        >
                          <FiMinus className='text-xs' />
                        </button>
                        <span className='text-sm font-semibold min-w-[20px] text-center'>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          aria-label={`Increase quantity of ${item.title}`}
                          onClick={() => handleQuantityChange(item._id, 1)}
                          className='w-7 h-7 rounded-full bg-surface-muted text-ink hover:bg-brand-soft hover:text-brand flex items-center justify-center transition cursor-pointer'
                        >
                          <FiPlus className='text-xs' />
                        </button>
                      </div>

                      <button
                        type='button'
                        aria-label={`Remove ${item.title}`}
                        onClick={() => handleRemoveItem(item._id)}
                        className='p-2.5 rounded-full bg-surface border border-line text-ink-muted hover:text-red-600 hover:border-red-200 transition cursor-pointer'
                      >
                        <FiTrash2 className='text-base' />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Right Column: Order Summary */}
            <aside className='lg:col-span-4 rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-5'>
              <h2 className='font-display text-xl font-bold text-ink'>Order Summary</h2>

              {/* Delivery Zone Selector (Bangladesh) */}
              <div>
                <p className='text-xs font-semibold uppercase tracking-wide text-ink-muted mb-2'>
                  Delivery Area (Bangladesh)
                </p>
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={() => setDeliveryZone('dhaka')}
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      deliveryZone === 'dhaka'
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line bg-surface-muted text-ink-muted hover:border-brand/50'
                    }`}
                  >
                    Inside Dhaka (৳ 70)
                  </button>
                  <button
                    type='button'
                    onClick={() => setDeliveryZone('outside')}
                    className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition cursor-pointer ${
                      deliveryZone === 'outside'
                        ? 'border-brand bg-brand-soft text-brand'
                        : 'border-line bg-surface-muted text-ink-muted hover:border-brand/50'
                    }`}
                  >
                    Outside Dhaka (৳ 130)
                  </button>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className='space-y-1.5'>
                <label
                  htmlFor='promo-code'
                  className='text-xs font-semibold uppercase tracking-wide text-ink-muted flex items-center gap-1'
                >
                  <FiTag className='text-brand' /> Promo Code
                </label>
                <div className='flex gap-2'>
                  <input
                    id='promo-code'
                    type='text'
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder='FIRST25'
                    className='w-full rounded-full border border-line bg-surface-muted px-4 py-2 text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-brand/40'
                  />
                  <button
                    type='submit'
                    className='rounded-full bg-brand-soft hover:bg-brand text-brand hover:text-brand-foreground px-4 py-2 text-xs font-semibold border border-brand/30 transition shrink-0 cursor-pointer'
                  >
                    Apply
                  </button>
                </div>
                {promoMessage && (
                  <p className='text-xs text-brand font-medium pt-0.5'>{promoMessage}</p>
                )}
              </form>

              {/* Price Breakdown */}
              <div className='border-t border-line pt-4 space-y-2.5 text-sm'>
                <div className='flex justify-between text-ink-muted'>
                  <span>Subtotal</span>
                  <span className='font-medium text-ink'>৳ {subtotal.toLocaleString()}</span>
                </div>

                {promoDiscount > 0 && (
                  <div className='flex justify-between text-emerald-700'>
                    <span>Discount ({appliedPromo})</span>
                    <span className='font-semibold'>-৳ {promoDiscount.toLocaleString()}</span>
                  </div>
                )}

                <div className='flex justify-between text-ink-muted'>
                  <span className='inline-flex items-center gap-1.5'>
                    <BsTruck className='text-brand' /> Delivery Fee
                  </span>
                  <span className='font-medium text-ink'>
                    {shippingFee === 0 ? (
                      <span className='text-emerald-700 font-semibold'>Free</span>
                    ) : (
                      `৳ ${shippingFee}`
                    )}
                  </span>
                </div>

                <div className='border-t border-line pt-3 flex justify-between items-baseline'>
                  <span className='font-display text-lg font-bold text-ink'>Total</span>
                  <span className='text-2xl font-bold text-brand'>
                    ৳ {grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Checkout CTA */}
              <Link
                href='/product/payment'
                className='w-full rounded-full bg-brand hover:bg-brand-hover text-brand-foreground py-3.5 px-6 font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors'
              >
                Proceed to Checkout <FiArrowRight />
              </Link>

              {/* Trust Footer */}
              <div className='flex items-center justify-center gap-2 text-xs text-ink-muted pt-1'>
                <BsShieldCheck className='text-emerald-600 text-base shrink-0' />
                <span>Cash on Delivery &bull; SSLCommerz Secure Checkout</span>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
