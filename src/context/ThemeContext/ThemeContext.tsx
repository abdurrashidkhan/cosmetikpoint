'use client';

import type { ReactElement, ReactNode } from 'react';
import { createContext, use, useEffect, useSyncExternalStore } from 'react';

// ============================================================================
// Types & Theme Presets
// ============================================================================

export type ThemeId =
  | 'rose-blossom'
  | 'luxury-gold'
  | 'botanical-mint'
  | 'midnight-plum'
  | 'custom';

export interface ThemeOption {
  id: Exclude<ThemeId, 'custom'>;
  name: string;
  previewColor: string;
  previewGradient: string;
  fontLabel: string;
}

export const COSMETIK_THEMES: ThemeOption[] = [
  {
    id: 'rose-blossom',
    name: 'Rose Blossom (Default)',
    previewColor: '#ec6c86',
    previewGradient: 'linear-gradient(135deg, #f9c5d1 0%, #ec6c86 55%, #d94e6b 100%)',
    fontLabel: 'Playfair + Jakarta',
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Champagne',
    previewColor: '#c58b2b',
    previewGradient: 'linear-gradient(135deg, #f3dec0 0%, #c58b2b 58%, #9e6a14 100%)',
    fontLabel: 'Playfair + Poppins',
  },
  {
    id: 'botanical-mint',
    name: 'Botanical Skincare',
    previewColor: '#2e8b57',
    previewGradient: 'linear-gradient(135deg, #a8e6c1 0%, #2e8b57 58%, #1d643d 100%)',
    fontLabel: 'Poppins + Jakarta',
  },
  {
    id: 'midnight-plum',
    name: 'Velvet Plum',
    previewColor: '#8b3a75',
    previewGradient: 'linear-gradient(135deg, #dfb3d3 0%, #8b3a75 58%, #612050 100%)',
    fontLabel: 'Playfair + Jakarta',
  },
];

const DEFAULT_THEME: ThemeId = 'rose-blossom';
const DEFAULT_CUSTOM_COLOR = '#ec6c86';
const THEME_STORAGE_KEY = 'cosmetikpoint-theme';
const CUSTOM_COLOR_STORAGE_KEY = 'cosmetikpoint-custom-color';
const THEME_EVENT = 'cosmetikpoint-theme-change';

interface ThemeContextValue {
  theme: ThemeId;
  customColor: string;
  setTheme: (nextTheme: ThemeId) => void;
  setCustomColor: (hex: string) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  customColor: DEFAULT_CUSTOM_COLOR,
  setTheme: () => {},
  setCustomColor: () => {},
  themes: COSMETIK_THEMES,
});

// ============================================================================
// Color Helpers for Dynamic Custom Color Picker + Linear Gradient
// ============================================================================

function normalizeHex(hex: string): string {
  const cleaned = hex.trim();
  return /^#[0-9a-fA-F]{6}$/.test(cleaned) ? cleaned : DEFAULT_CUSTOM_COLOR;
}

function mixHexWith(hex: string, target: [number, number, number], ratio: number): string {
  const safe = normalizeHex(hex).slice(1);
  const r = parseInt(safe.slice(0, 2), 16);
  const g = parseInt(safe.slice(2, 4), 16);
  const b = parseInt(safe.slice(4, 6), 16);

  const nr = Math.round(r * (1 - ratio) + target[0] * ratio);
  const ng = Math.round(g * (1 - ratio) + target[1] * ratio);
  const nb = Math.round(b * (1 - ratio) + target[2] * ratio);

  return `#${[nr, ng, nb].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
}

export function buildGradientFromHex(hex: string): string {
  const base = normalizeHex(hex);
  const light = mixHexWith(base, [255, 255, 255], 0.55);
  const dark = mixHexWith(base, [0, 0, 0], 0.22);
  return `linear-gradient(135deg, ${light} 0%, ${base} 55%, ${dark} 100%)`;
}

function applyThemeToDocument(theme: ThemeId, customColor: string): void {
  const root = document.documentElement;
  const customVars = [
    '--theme-primary',
    '--theme-primary-hover',
    '--theme-primary-soft',
    '--theme-gradient',
    '--theme-gradient-soft',
    '--theme-card-pink',
  ];

  if (theme === 'custom') {
    const base = normalizeHex(customColor);
    const hover = mixHexWith(base, [0, 0, 0], 0.16);
    const soft = mixHexWith(base, [255, 255, 255], 0.88);
    const cardTint = mixHexWith(base, [255, 255, 255], 0.92);
    const softTop = mixHexWith(base, [255, 255, 255], 0.95);

    root.setAttribute('data-cp-theme', 'rose-blossom');
    root.style.setProperty('--theme-primary', base);
    root.style.setProperty('--theme-primary-hover', hover);
    root.style.setProperty('--theme-primary-soft', soft);
    root.style.setProperty('--theme-gradient', buildGradientFromHex(base));
    root.style.setProperty(
      '--theme-gradient-soft',
      `linear-gradient(180deg, ${softTop} 0%, ${soft} 100%)`,
    );
    root.style.setProperty('--theme-card-pink', cardTint);
  } else {
    // Clear any inline custom overrides so preset CSS variables take effect
    for (const prop of customVars) {
      root.style.removeProperty(prop);
    }
    root.setAttribute('data-cp-theme', theme);
  }
}

// ============================================================================
// External Store Helpers (React 19 SSR & ESLint safe)
// ============================================================================

function isValidTheme(value: string | null): value is ThemeId {
  return value === 'custom' || COSMETIK_THEMES.some((item) => item.id === value);
}

function subscribeToTheme(callback: () => void): () => void {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_EVENT, callback);
  };
}

function getClientThemeSnapshot(): ThemeId {
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isValidTheme(stored) ? stored : DEFAULT_THEME;
}

function getClientColorSnapshot(): string {
  return normalizeHex(
    window.localStorage.getItem(CUSTOM_COLOR_STORAGE_KEY) || DEFAULT_CUSTOM_COLOR,
  );
}

function getServerThemeSnapshot(): ThemeId {
  return DEFAULT_THEME;
}

function getServerColorSnapshot(): string {
  return DEFAULT_CUSTOM_COLOR;
}

// ============================================================================
// Provider & Hook
// ============================================================================

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: Readonly<ThemeProviderProps>): ReactElement {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getClientThemeSnapshot,
    getServerThemeSnapshot,
  );

  const customColor = useSyncExternalStore(
    subscribeToTheme,
    getClientColorSnapshot,
    getServerColorSnapshot,
  );

  useEffect(() => {
    applyThemeToDocument(theme, customColor);
  }, [theme, customColor]);

  const setTheme = (nextTheme: ThemeId): void => {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    applyThemeToDocument(nextTheme, customColor);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  const setCustomColor = (hex: string): void => {
    const safeHex = normalizeHex(hex);
    window.localStorage.setItem(CUSTOM_COLOR_STORAGE_KEY, safeHex);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'custom');
    applyThemeToDocument('custom', safeHex);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <ThemeContext
      value={{
        theme,
        customColor,
        setTheme,
        setCustomColor,
        themes: COSMETIK_THEMES,
      }}
    >
      {children}
    </ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}
