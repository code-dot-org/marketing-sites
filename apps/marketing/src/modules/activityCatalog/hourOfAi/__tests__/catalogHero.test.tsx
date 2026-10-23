import {render, screen} from '@testing-library/react';
import {useSearchParams} from 'next/navigation';

import CatalogHero from '../catalogHero';

jest.mock('next/navigation', () => ({
  useSearchParams: jest.fn(),
}));

const withCat = (cat: string | null) =>
  (useSearchParams as jest.Mock).mockReturnValue({
    get: (key: string) => (key === 'cat' ? cat : null),
  });

describe('CatalogHero', () => {
  it.each([
    [null, 'Explore Activities'],
    ['hour-of-ai', 'Explore Hour of AI Activities'],
    ['hour-of-code', 'Explore Hour of Code Activities'],
    ['not-a-catalog', 'Explore Activities'],
  ])('titles cat=%s "%s"', (cat, heading) => {
    withCat(cat);
    render(<CatalogHero />);

    expect(
      screen.getByRole('heading', {level: 1, name: heading}),
    ).toBeInTheDocument();
  });
});
