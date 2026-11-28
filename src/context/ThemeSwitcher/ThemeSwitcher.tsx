'use client';

import { useTheme } from '@/context/ThemeContext/ThemeContext';
import type { ReactElement } from 'react';

export function ThemeSwitcher(): ReactElement {
  const { theme, setTheme, themes } = useTheme();

  return (
    <div className='flex flex-wrap items-center gap-2' role='group' aria-label='Select store theme'>
      {themes.map((item) => {
        const isSelected = theme === item.id;

        return (
          <button
            key={item.id}
            type='button'
            onClick={() => setTheme(item.id)}
            title={`${item.name} (${item.fontLabel})`}
            aria-pressed={isSelected}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium border transition-all cursor-pointer ${
              isSelected
                ? 'border-brand bg-brand-soft text-ink shadow-xs'
                : 'border-line bg-surface text-ink-muted hover:border-brand/50'
            }`}
          >
            <span
              className='h-3 w-3 rounded-full shrink-0 border border-black/10'
              style={{ backgroundColor: item.previewColor }}
            />
            <span>{item.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export default ThemeSwitcher;
