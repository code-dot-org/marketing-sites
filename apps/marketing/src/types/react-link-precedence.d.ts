import 'react';

// Next 15's App Router runs a bundled React 19, which hoists <link> tags with
// a `precedence` prop into <head> during SSR. Our @types/react is still v18,
// so declare the prop until the React 19 types upgrade.
declare module 'react' {
  interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
    precedence?: string;
  }
}
