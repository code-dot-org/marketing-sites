'use client';

import {createContext, useContext, useMemo, useState} from 'react';

// React context for the "logo transition is active" flag. The overlay sets it
// (via onActiveChange); the header reads it to hide its static logo while the
// SVG flies in, then reveal it on hand-off. Provider lives in the layout so it
// wraps both the header and the page content where the modal renders.
interface LogoTransitionContextValue {
  active: boolean;
  setActive: (active: boolean) => void;
}

const LogoTransitionContext = createContext<LogoTransitionContextValue>({
  active: false,
  setActive: () => {},
});

export const LogoTransitionProvider: React.FC<{
  children: React.ReactNode;
}> = ({children}) => {
  const [active, setActive] = useState(false);
  const value = useMemo(() => ({active, setActive}), [active]);
  return (
    <LogoTransitionContext.Provider value={value}>
      {children}
    </LogoTransitionContext.Provider>
  );
};

export const useLogoTransition = (): LogoTransitionContextValue =>
  useContext(LogoTransitionContext);
