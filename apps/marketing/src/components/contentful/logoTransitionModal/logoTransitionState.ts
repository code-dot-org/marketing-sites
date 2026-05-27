// Module-level pubsub for the "logo transition is active" flag. The overlay
// publishes via onActiveChange; the header subscribes to hide its static logo
// while the SVG flies in and reveal it once the hand-off completes.
//
// Module-level state is safe: publisher and subscribers are client-only, at
// most one overlay is active at a time (singleton guard in the overlay), and
// it's never mutated server-side.

type Listener = (active: boolean) => void;

let isActive = false;
const listeners = new Set<Listener>();

export const setLogoTransitionActive = (next: boolean): void => {
  if (isActive === next) return;
  isActive = next;
  listeners.forEach(fn => fn(isActive));
};

export const getLogoTransitionActive = (): boolean => isActive;

export const subscribeToLogoTransitionActive = (
  fn: Listener,
): (() => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
