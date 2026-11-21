'use client';

import type { ReactElement, ReactNode } from 'react';
import { createContext, use, useEffect, useSyncExternalStore } from 'react';

// ============================================================================
// Types & Available Themes
// ============================================================================

export type ThemeId = 'rose-blossom' | 'luxury-gold' | 'botanical-mint' | 'midnight-plum';

export interface ThemeOption {
  id: ThemeId;
  name: string;
  previewColor: string;
  fontLabel: string;
}

export const COSMETIK_THEMES: ThemeOption[] = [
  {
    id: 'rose-blossom',
    name: 'Rose Blossom (Default)',
    previewColor: '#ec6c86',
    fontLabel: 'Playfair + Jakarta',
  },
  {
    id: 'luxury-gold',
    name: 'Luxury Champagne',
    previewColor: '#c58b2b',
    fontLabel: 'Playfair + Poppins',
  },
  {
    id: 'botanical-mint',
    name: 'Botanical Skincare',
    previewColor: '#2e8b57',
    fontLabel: 'Poppins + Jakarta',
  },
  {
    id: 'midnight-plum',
    name: 'Velvet Plum',
    previewColor: '#8b3a75',
    fontLabel: 'Playfair + Jakarta',
  },
];

const DEFAULT_THEME: ThemeId = 'rose-blossom';
const STORAGE_KEY = 'cosmetikpoint-theme';
const THEME_EVENT = 'cosmetikpoint-theme-change';

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (nextTheme: ThemeId) => void;
  themes: ThemeOption[];
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
  themes: COSMETIK_THEMES,
});

// ============================================================================
// External Store Helpers (React 19 SSR & ESLint `set-state-in-effect` safe)
// ============================================================================

function isValidTheme(value: string | null): value is ThemeId {
  return COSMETIK_THEMES.some((item) => item.id === value);
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
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isValidTheme(stored) ? stored : DEFAULT_THEME;
}

function getServerThemeSnapshot(): ThemeId {
  return DEFAULT_THEME;
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

  // Sync `data-cp-theme` attribute on `<html>` whenever theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-cp-theme', theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemeId): void => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.setAttribute('data-cp-theme', nextTheme);
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
    <ThemeContext value={{ theme, setTheme, themes: COSMETIK_THEMES }}>{children}</ThemeContext>
  );
}

export function useTheme(): ThemeContextValue {
  return use(ThemeContext);
}
