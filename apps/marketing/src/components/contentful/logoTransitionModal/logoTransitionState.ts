// Tiny module-level pubsub for the "logo transition is active" flag.
//
// The LogoTransitionOverlay fires onActiveChange(true) when it mounts to
// run the animation, and onActiveChange(false) when the FLIP hand-off
// completes (or the overlay unmounts for any other reason). The marketing-
// app header component subscribes to this so it can hide its server-
// rendered logo while the SVG is flying into the header position, and
// reveal it once the SVG has arrived.
//
// Module-level state is fine here because:
//   - Both the publisher (LogoTransitionModal wrapper) and the subscribers
//     (HeaderCorporateSite) run only on the client.
//   - There is at most one active logo-transition overlay at a time
//     (singleton guard inside the overlay component).
//   - We never mutate this from the server, so request-level isolation is
//     not a concern.

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
