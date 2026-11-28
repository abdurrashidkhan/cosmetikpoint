'use client';

import type { FormEvent, ReactElement } from 'react';
import { useState } from 'react';
import {
  FiCheck,
  FiCheckCircle,
  FiDroplet,
  FiGlobe,
  FiRotateCcw,
  FiSave,
  FiShield,
  FiTruck,
} from 'react-icons/fi';
import AdminCheck from '@/app/Auth/Admin/AdminCheck';
import { buildGradientFromHex, useTheme } from '@/context/ThemeContext/ThemeContext';

// ============================================================================
// Types & Defaults
// ============================================================================

interface StoreSettings {
  storeName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  dhakaDeliveryFee: string;
  outsideDhakaFee: string;
  freeShippingMin: string;
  enableCod: boolean;
  enableSslcommerz: boolean;
  showFirstOrderBanner: boolean;
  maintenanceMode: boolean;
}

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Cosmetik Point',
  tagline: 'Authentic Cosmetics & Skincare Shop in Bangladesh',
  supportEmail: 'support@cosmetikpoint.com',
  supportPhone: '+8801617-XXXXXX',
  dhakaDeliveryFee: '70',
  outsideDhakaFee: '130',
  freeShippingMin: '2000',
  enableCod: true,
  enableSslcommerz: true,
  showFirstOrderBanner: true,
  maintenanceMode: false,
};

const SETTINGS_STORAGE_KEY = 'cosmetikpoint-store-settings';

function loadInitialSettings(): StoreSettings {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return {
      ...DEFAULT_SETTINGS,
      ...(JSON.parse(raw) as Partial<StoreSettings>),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// ============================================================================
// Component
// ============================================================================

export default function SettingsPage(): ReactElement {
  const { theme, customColor, setTheme, setCustomColor, themes } = useTheme();
  const [settings, setSettings] = useState<StoreSettings>(loadInitialSettings);
  const [savedNotice, setSavedNotice] = useState<string>('');

  const handleFieldChange = <K extends keyof StoreSettings>(
    key: K,
    value: StoreSettings[K],
  ): void => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    if (savedNotice) setSavedNotice('');
  };

  const handleSaveSettings = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
    setSavedNotice('Store settings & theme preferences saved successfully!');
  };

  const handleResetDefaults = (): void => {
    setSettings(DEFAULT_SETTINGS);
    setTheme('rose-blossom');
    window.localStorage.removeItem(SETTINGS_STORAGE_KEY);
    setSavedNotice('Settings reset to Cosmetik Point defaults.');
  };

  const inputClass =
    'mt-1.5 w-full rounded-2xl border border-line bg-surface-muted px-4 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition';
  const labelClass = 'block text-xs font-semibold uppercase tracking-wide text-ink-muted';

  return (
    <AdminCheck>
      <section className='max-w-5xl mx-auto font-sans pb-12 space-y-6'>
        {/* Page Header */}
        <div className='rounded-3xl border border-line bg-brand-soft/60 px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
          <div>
            <span className='inline-block rounded-full bg-brand px-3 py-0.5 text-[11px] font-bold text-brand-foreground uppercase tracking-wider mb-1'>
              Store Configuration
            </span>
            <h1 className='font-display text-2xl sm:text-3xl font-bold text-ink'>
              Cosmetik Point Settings
            </h1>
            <p className='text-sm text-ink-muted mt-0.5'>
              Customize your live store theme, linear gradient, fonts, Bangladesh delivery rates,
              and payment options.
            </p>
          </div>

          <button
            type='button'
            onClick={handleResetDefaults}
            className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-semibold text-ink-muted hover:border-brand hover:text-brand transition cursor-pointer shrink-0'
          >
            <FiRotateCcw /> Reset Defaults
          </button>
        </div>

        <form onSubmit={handleSaveSettings} className='space-y-6'>
          {/* 1. Dynamic Theme, Linear Gradient & Custom Color Picker */}
          <div className='rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-5'>
            <div className='flex items-center gap-2.5 border-b border-line pb-3'>
              <div className='p-2 rounded-xl bg-brand-soft text-brand'>
                <FiDroplet className='text-lg' />
              </div>
              <div>
                <h2 className='font-display text-lg font-bold text-ink'>
                  Appearance, Linear Gradient &amp; Color Picker
                </h2>
                <p className='text-xs text-ink-muted'>
                  Choose the default photo-matched gradient, 3 preset themes, or pick any custom
                  color.
                </p>
              </div>
            </div>

            {/* Live Linear Gradient Banner Preview */}
            <div className='bg-brand-gradient rounded-3xl p-6 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
              <div>
                <p className='text-[11px] font-bold uppercase tracking-widest opacity-90'>
                  Live Gradient Preview
                </p>
                <h3 className='font-display text-2xl font-bold mt-1'>Your Beauty, Perfected.</h3>
                <p className='text-xs opacity-90 mt-1'>
                  Cosmetik Point &bull; Active Theme:{' '}
                  <span className='font-bold uppercase'>{theme}</span>
                </p>
              </div>
              <span className='inline-block rounded-full bg-white text-ink px-5 py-2 text-xs font-bold shadow-xs shrink-0 text-center'>
                Get Started
              </span>
            </div>

            {/* 4 Preset Linear Gradient Theme Cards */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3'>
              {themes.map((item) => {
                const isSelected = theme === item.id;

                return (
                  <button
                    key={item.id}
                    type='button'
                    onClick={() => setTheme(item.id)}
                    aria-pressed={isSelected}
                    className={`relative rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand bg-brand-soft/70 ring-2 ring-brand/25 shadow-xs'
                        : 'border-line bg-surface-muted/60 hover:border-brand/50'
                    }`}
                  >
                    <div className='flex items-center justify-between mb-3'>
                      <span
                        className='h-9 w-16 rounded-full border border-black/10 shadow-xs'
                        style={{ backgroundImage: item.previewGradient }}
                      />
                      {isSelected && (
                        <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand text-brand-foreground text-xs'>
                          <FiCheck />
                        </span>
                      )}
                    </div>

                    <p className='font-display text-sm font-bold text-ink'>{item.name}</p>
                    <p className='text-[11px] text-ink-muted mt-0.5'>{item.fontLabel}</p>
                  </button>
                );
              })}
            </div>

            {/* Custom Color Picker */}
            <div
              className={`rounded-2xl border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition ${
                theme === 'custom'
                  ? 'border-brand bg-brand-soft/60 ring-2 ring-brand/20'
                  : 'border-line bg-surface-muted/50'
              }`}
            >
              <div className='flex items-center gap-3'>
                <span
                  className='h-10 w-10 rounded-full border border-black/10 shrink-0 shadow-xs'
                  style={{ backgroundImage: buildGradientFromHex(customColor) }}
                />
                <div>
                  <p className='font-display text-sm font-bold text-ink'>
                    Custom Brand Color Picker
                  </p>
                  <p className='text-xs text-ink-muted'>
                    Pick any color to auto-generate a matching linear gradient across the site.
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-3'>
                <label
                  htmlFor='custom-color-picker'
                  className='inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-semibold text-ink cursor-pointer hover:border-brand'
                >
                  <input
                    id='custom-color-picker'
                    type='color'
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className='h-6 w-6 cursor-pointer rounded-full border-0 bg-transparent p-0'
                  />
                  <span className='font-mono uppercase'>{customColor}</span>
                </label>
              </div>
            </div>
          </div>

          {/* 2. General Store Information */}
          <div className='rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-4'>
            <div className='flex items-center gap-2.5 border-b border-line pb-3'>
              <div className='p-2 rounded-xl bg-brand-soft text-brand'>
                <FiGlobe className='text-lg' />
              </div>
              <div>
                <h2 className='font-display text-lg font-bold text-ink'>Store Information</h2>
                <p className='text-xs text-ink-muted'>
                  Basic contact details shown in TopBar, Footer, and order receipts.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label htmlFor='storeName' className={labelClass}>
                  Store Name
                </label>
                <input
                  id='storeName'
                  type='text'
                  value={settings.storeName}
                  onChange={(e) => handleFieldChange('storeName', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor='tagline' className={labelClass}>
                  Store Tagline
                </label>
                <input
                  id='tagline'
                  type='text'
                  value={settings.tagline}
                  onChange={(e) => handleFieldChange('tagline', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor='supportEmail' className={labelClass}>
                  Support Email
                </label>
                <input
                  id='supportEmail'
                  type='email'
                  value={settings.supportEmail}
                  onChange={(e) => handleFieldChange('supportEmail', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor='supportPhone' className={labelClass}>
                  Support Phone (Bangladesh)
                </label>
                <input
                  id='supportPhone'
                  type='tel'
                  value={settings.supportPhone}
                  onChange={(e) => handleFieldChange('supportPhone', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* 3. Shipping & Payment Configuration */}
          <div className='rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-5'>
            <div className='flex items-center gap-2.5 border-b border-line pb-3'>
              <div className='p-2 rounded-xl bg-brand-soft text-brand'>
                <FiTruck className='text-lg' />
              </div>
              <div>
                <h2 className='font-display text-lg font-bold text-ink'>
                  Delivery Rates &amp; Payment Gateways (BDT ৳)
                </h2>
                <p className='text-xs text-ink-muted'>
                  Configure nationwide shipping fees and active checkout methods.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
              <div>
                <label htmlFor='dhakaFee' className={labelClass}>
                  Inside Dhaka Fee (৳)
                </label>
                <input
                  id='dhakaFee'
                  type='number'
                  min={0}
                  value={settings.dhakaDeliveryFee}
                  onChange={(e) => handleFieldChange('dhakaDeliveryFee', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor='outsideFee' className={labelClass}>
                  Outside Dhaka Fee (৳)
                </label>
                <input
                  id='outsideFee'
                  type='number'
                  min={0}
                  value={settings.outsideDhakaFee}
                  onChange={(e) => handleFieldChange('outsideDhakaFee', e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor='freeMin' className={labelClass}>
                  Free Delivery Above (৳)
                </label>
                <input
                  id='freeMin'
                  type='number'
                  min={0}
                  value={settings.freeShippingMin}
                  onChange={(e) => handleFieldChange('freeShippingMin', e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2'>
              <label className='flex items-center justify-between rounded-2xl border border-line bg-surface-muted p-4 cursor-pointer'>
                <div>
                  <p className='text-sm font-semibold text-ink'>Cash on Delivery (COD)</p>
                  <p className='text-xs text-ink-muted'>
                    Allow customers across Bangladesh to pay on delivery
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.enableCod}
                  onChange={(e) => handleFieldChange('enableCod', e.target.checked)}
                  className='h-4 w-4 accent-brand rounded'
                />
              </label>

              <label className='flex items-center justify-between rounded-2xl border border-line bg-surface-muted p-4 cursor-pointer'>
                <div>
                  <p className='text-sm font-semibold text-ink'>
                    SSLCommerz (bKash / Nagad / Card)
                  </p>
                  <p className='text-xs text-ink-muted'>
                    Online digital payments via SSLCommerz gateway
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.enableSslcommerz}
                  onChange={(e) => handleFieldChange('enableSslcommerz', e.target.checked)}
                  className='h-4 w-4 accent-brand rounded'
                />
              </label>
            </div>
          </div>

          {/* 4. Storefront Visibility */}
          <div className='rounded-3xl border border-line bg-surface p-6 shadow-xs space-y-4'>
            <div className='flex items-center gap-2.5 border-b border-line pb-3'>
              <div className='p-2 rounded-xl bg-brand-soft text-brand'>
                <FiShield className='text-lg' />
              </div>
              <div>
                <h2 className='font-display text-lg font-bold text-ink'>Storefront Controls</h2>
                <p className='text-xs text-ink-muted'>
                  Toggle promotional banners and maintenance status.
                </p>
              </div>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <label className='flex items-center justify-between rounded-2xl border border-line bg-surface-muted p-4 cursor-pointer'>
                <div>
                  <p className='text-sm font-semibold text-ink'>First Order Promo Banner</p>
                  <p className='text-xs text-ink-muted'>
                    Show &ldquo;Up to 25% off First Order&rdquo; offer banner
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.showFirstOrderBanner}
                  onChange={(e) => handleFieldChange('showFirstOrderBanner', e.target.checked)}
                  className='h-4 w-4 accent-brand rounded'
                />
              </label>

              <label className='flex items-center justify-between rounded-2xl border border-line bg-surface-muted p-4 cursor-pointer'>
                <div>
                  <p className='text-sm font-semibold text-ink'>Maintenance Mode</p>
                  <p className='text-xs text-ink-muted'>
                    Temporarily pause customer checkouts during updates
                  </p>
                </div>
                <input
                  type='checkbox'
                  checked={settings.maintenanceMode}
                  onChange={(e) => handleFieldChange('maintenanceMode', e.target.checked)}
                  className='h-4 w-4 accent-brand rounded'
                />
              </label>
            </div>
          </div>

          {/* Save Notice */}
          {savedNotice && (
            <div
              role='status'
              className='rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 font-medium'
            >
              <FiCheckCircle className='text-lg shrink-0' />
              <span>{savedNotice}</span>
            </div>
          )}

          {/* Save Button */}
          <div className='flex justify-end'>
            <button
              type='submit'
              className='inline-flex items-center gap-2 rounded-full bg-brand hover:bg-brand-hover text-brand-foreground px-8 py-3 text-sm font-bold shadow-sm transition cursor-pointer'
            >
              <FiSave /> Save Settings
            </button>
          </div>
        </form>
      </section>
    </AdminCheck>
  );
}
