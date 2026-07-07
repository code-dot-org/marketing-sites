'use client';

// Provides the resolved enclosing brand-color background to descendants so
// they can route their authored color through the contrast switch. Set by
// Section (and any future Container) when its `background` prop is one of the
// CodeAI brand tokens. csforall background values and Corporate Site legacy
// values produce `null` here (value-space guard — see Section.tsx and
// research.md §10). A Section with `background='transparent'` emits the
// 'transparent' sentinel so descendants short-circuit the contrast switch.
import {createContext, useContext, type ReactNode} from 'react';

import {
  BRAND_COLORS,
  type EnclosingBackground,
} from '@/components/common/colors';

const BRAND_COLOR_VALUES = new Set<string>(BRAND_COLORS.map(c => c.value));

const SectionBackgroundContext = createContext<EnclosingBackground>(null);

export const SectionBackgroundProvider: React.FC<{
  value: string | undefined;
  children: ReactNode;
}> = ({value, children}) => {
  let resolved: EnclosingBackground = null;
  if (value === 'transparent') {
    resolved = 'transparent';
  } else if (value && BRAND_COLOR_VALUES.has(value)) {
    resolved = value as EnclosingBackground;
  }
  return (
    <SectionBackgroundContext.Provider value={resolved}>
      {children}
    </SectionBackgroundContext.Provider>
  );
};

export const useSectionBackground = (): EnclosingBackground =>
  useContext(SectionBackgroundContext);
