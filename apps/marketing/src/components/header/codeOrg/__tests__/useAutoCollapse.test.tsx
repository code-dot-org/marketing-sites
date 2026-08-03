import {act, render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import HeaderCodeOrgView from '@/components/header/codeOrg/HeaderCodeOrgView';
import {HeaderContent} from '@/components/header/codeOrg/types';

jest.mock(
  '@/components/contentful/logoTransitionModal/logoTransitionState',
  () => ({
    useLogoTransition: () => ({active: false}),
  }),
);

const CONTENT: HeaderContent = {
  mainMenu: [
    {label: 'Teachers', href: '/teach'},
    {label: 'Students', href: '/students'},
  ],
  secondaryMenu: [{label: 'Donate', href: '/donate'}],
};

class ResizeObserverStub {
  static instances: ResizeObserverStub[] = [];
  callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    ResizeObserverStub.instances.push(this);
  }
  observe() {}
  unobserve() {}
  disconnect() {}
}

const setWidth = (element: Element, width: number) =>
  Object.defineProperty(element, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({width}) as DOMRect,
  });

// The hook measures the bar against the two ghost rows inside the
// aria-hidden clip wrapper.
const getMeasuredElements = () => {
  const header = screen.getByRole('banner');
  const bar = header.querySelector(':scope > div:not([aria-hidden])')!;
  const [ghostFull, ghostCompact] = header.querySelectorAll(
    ':scope > div[aria-hidden="true"] > div',
  );
  return {header, bar, ghostFull, ghostCompact};
};

const fireMeasure = () =>
  act(() => {
    ResizeObserverStub.instances.forEach(instance =>
      instance.callback([], instance as unknown as ResizeObserver),
    );
  });

describe('header auto-collapse', () => {
  beforeEach(() => {
    ResizeObserverStub.instances = [];
    global.ResizeObserver =
      ResizeObserverStub as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    // @ts-expect-error jsdom has no ResizeObserver; restore that state.
    delete global.ResizeObserver;
  });

  it('stamps the collapse stage matching the widest layout that fits', () => {
    render(<HeaderCodeOrgView content={CONTENT} />);
    const {header, bar, ghostFull, ghostCompact} = getMeasuredElements();
    setWidth(ghostFull, 900);
    setWidth(ghostCompact, 700);

    setWidth(bar, 1200);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'none');

    setWidth(bar, 800);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'secondary');

    setWidth(bar, 600);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'all');

    setWidth(bar, 1200);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'none');
  });

  it('treats an exact fit (within subpixel slack) as fitting', () => {
    render(<HeaderCodeOrgView content={CONTENT} />);
    const {header, bar, ghostFull, ghostCompact} = getMeasuredElements();
    setWidth(ghostFull, 900.4);
    setWidth(ghostCompact, 700);
    setWidth(bar, 900);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'none');
  });

  it('keeps the last stage when the bar reports zero width', () => {
    render(<HeaderCodeOrgView content={CONTENT} />);
    const {header, bar, ghostFull, ghostCompact} = getMeasuredElements();
    setWidth(ghostFull, 900);
    setWidth(ghostCompact, 700);
    setWidth(bar, 800);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'secondary');

    setWidth(bar, 0);
    fireMeasure();
    expect(header).toHaveAttribute('data-collapse', 'secondary');
  });

  it('stays on the media-query baseline without ResizeObserver', () => {
    // @ts-expect-error simulate a client without ResizeObserver.
    delete global.ResizeObserver;
    render(<HeaderCodeOrgView content={CONTENT} />);
    expect(screen.getByRole('banner')).not.toHaveAttribute('data-collapse');
  });

  it('hides the ghost rows from the accessibility tree', () => {
    render(<HeaderCodeOrgView content={CONTENT} />);
    // Menu entries appear once in the bar and once in the (open-able) mobile
    // card at most; the ghosts must not add accessible duplicates.
    expect(screen.getAllByRole('link', {name: 'Donate'})).toHaveLength(1);
    expect(screen.getAllByRole('link', {name: 'Sign in'})).toHaveLength(1);
  });
});
