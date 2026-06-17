'use client';

// Provides the resolved enclosing brand-color background to descendants so
// they can route their authored color through the contrast switch. Set by
// Section (and any future Container) when its `background` prop is one of the
// 22 CodeAI brand tokens. csforall background values and Corporate Site legacy
// values produce `null` here (value-space guard — see Section.tsx and
// research.md §10).
import {createContext, useContext, type ReactNode} from 'react';

import {BRAND_COLORS, type BrandColor} from '@/components/common/colors';

const BRAND_COLOR_VALUES = new Set<string>(BRAND_COLORS.map(c => c.value));

const SectionBackgroundContext = createContext<BrandColor | null>(null);

export const SectionBackgroundProvider: React.FC<{
  value: string | undefined;
  children: ReactNode;
}> = ({value, children}) => {
  const brandValue: BrandColor | null =
    value && BRAND_COLOR_VALUES.has(value) ? (value as BrandColor) : null;
  return (
    <SectionBackgroundContext.Provider value={brandValue}>
      {children}
    </SectionBackgroundContext.Provider>
  );
};

export const useSectionBackground = (): BrandColor | null =>
  useContext(SectionBackgroundContext);
