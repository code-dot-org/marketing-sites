import {render, screen, within} from '@testing-library/react';
import '@testing-library/jest-dom';

import ContentCard, {
  ContentCardProps,
} from '@/components/contentful/contentCard';
import {LinkEntry} from '@/types/contentful/entries/Link';

const linkEntry = {
  fields: {
    label: 'Read post',
    primaryTarget: '/blog-test',
    isThisAnExternalLink: false,
  },
} as LinkEntry;

const defaultProps: ContentCardProps = {
  badge: 'News',
  title: 'Meet the CodeAI President & CEO',
  description: 'Looking ahead, he shares his vision for AI education.',
  image: '//contentful-images.code.org/space/asset/hash/content-card.png',
  link: linkEntry,
};

describe('ContentCard component', () => {
  it('renders the title as a level-3 heading', () => {
    render(<ContentCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {
        level: 3,
        name: 'Meet the CodeAI President & CEO',
      }),
    ).toBeInTheDocument();
  });

  it('renders the description', () => {
    render(<ContentCard {...defaultProps} />);
    expect(
      screen.getByText('Looking ahead, he shares his vision for AI education.'),
    ).toBeInTheDocument();
  });

  it('renders the badge as a purple badge by default', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByText('News')).toHaveStyle({
      backgroundColor: 'var(--codeai-purple-primary)',
    });
  });

  it('applies the selected badge color', () => {
    render(<ContentCard {...defaultProps} badgeColor="green" />);
    expect(screen.getByText('News')).toHaveStyle({
      backgroundColor: 'var(--codeai-green-primary)',
    });
  });

  it('omits the badge when none is provided', () => {
    render(<ContentCard {...defaultProps} badge={undefined} />);
    expect(screen.queryByText('News')).not.toBeInTheDocument();
  });

  it('renders the link as the only link on the card', () => {
    render(<ContentCard {...defaultProps} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Read post');
    expect(links[0]).toHaveAttribute('href', '/blog-test');
    expect(links[0]).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab', () => {
    const externalLink = {
      fields: {...linkEntry.fields, isThisAnExternalLink: true},
    } as LinkEntry;
    render(<ContentCard {...defaultProps} link={externalLink} />);
    const link = screen.getByRole('link', {name: 'Read post'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it("uses the link entry's aria label as the accessible name", () => {
    const labelledLink = {
      fields: {...linkEntry.fields, ariaLabel: 'Read the full post'},
    } as LinkEntry;
    render(<ContentCard {...defaultProps} link={labelledLink} />);
    expect(
      screen.getByRole('link', {name: 'Read the full post'}),
    ).toBeInTheDocument();
  });

  it('replaces the link label with the text override', () => {
    render(<ContentCard {...defaultProps} linkTextOverride="Explore" />);
    expect(screen.getByRole('link', {name: 'Explore'})).toBeInTheDocument();
    expect(screen.queryByText('Read post')).not.toBeInTheDocument();
  });

  it('renders the arrow-right link icon by default', () => {
    render(<ContentCard {...defaultProps} />);
    const arrow = screen
      .getAllByTestId('font-awesome-v6-icon')
      .find(icon => icon.classList.contains('fa-arrow-right'));
    expect(arrow).toBeDefined();
  });

  it('replaces the link icon with the icon override', () => {
    render(<ContentCard {...defaultProps} linkIconOverride="star" />);
    const icons = screen.getAllByTestId('font-awesome-v6-icon');
    expect(icons.some(icon => icon.classList.contains('fa-star'))).toBe(true);
    expect(icons.some(icon => icon.classList.contains('fa-arrow-right'))).toBe(
      false,
    );
  });

  it('omits the link when no link entry is bound', () => {
    render(<ContentCard {...defaultProps} link={undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders the title in the default text color, weight, and size', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByRole('heading', {level: 3})).toHaveStyle({
      color: 'var(--codeai-gray-8, #292f36)',
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '1.25rem',
    });
  });

  it('applies the selected title appearance size without changing the weight', () => {
    render(<ContentCard {...defaultProps} titleAppearance="display-md" />);
    expect(screen.getByRole('heading', {level: 3})).toHaveStyle({
      fontSize: '2.25rem',
      lineHeight: '2.5rem',
      letterSpacing: '-0.02em',
      fontWeight: 500,
    });
  });

  it('applies the selected title color', () => {
    render(<ContentCard {...defaultProps} titleColor="blue" />);
    expect(screen.getByRole('heading', {level: 3})).toHaveStyle({
      color: 'var(--codeai-blue-primary)',
    });
  });

  it('applies uppercase title casing', () => {
    render(<ContentCard {...defaultProps} titleCase="uppercase" />);
    expect(screen.getByRole('heading', {level: 3})).toHaveStyle({
      textTransform: 'uppercase',
    });
  });

  it('applies the selected link color', () => {
    render(<ContentCard {...defaultProps} linkColor="green" />);
    // jsdom's cascade ignores descendant-selector specificity, so assert the
    // emitted rule instead of the computed style. Green appears only via the
    // link-color override (the default badge is purple).
    const css = Array.from(document.querySelectorAll('style'))
      .flatMap(style =>
        style.sheet ? Array.from(style.sheet.cssRules).map(r => r.cssText) : [],
      )
      .join('\n');
    expect(css).toMatch(
      /a\.MuiLink-root[^{}]*\{[^}]*var\(--codeai-green-primary\)/,
    );
  });

  it('renders the image through the Contentful image optimizer', () => {
    const {container} = render(<ContentCard {...defaultProps} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(decodeURIComponent(img!.getAttribute('src') || '')).toContain(
      'content-card.png',
    );
  });

  it('omits the image area when no image is bound', () => {
    const {container} = render(
      <ContentCard {...defaultProps} image={undefined} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  it('defaults to the outline card style', () => {
    render(<ContentCard {...defaultProps} />);
    expect(screen.getByTestId('content-card')).toHaveAttribute(
      'data-card-style',
      'outline',
    );
  });

  it.each(['outline', 'flat', 'overlay'] as const)(
    'reflects the %s card style on the root',
    cardStyle => {
      render(<ContentCard {...defaultProps} cardStyle={cardStyle} />);
      expect(screen.getByTestId('content-card')).toHaveAttribute(
        'data-card-style',
        cardStyle,
      );
    },
  );

  it('renders the glass content panel for the overlay style', () => {
    render(<ContentCard {...defaultProps} cardStyle="overlay" />);
    const panel = screen.getByTestId('content-card-overlay-panel');
    expect(within(panel).getByRole('heading', {level: 3})).toBeInTheDocument();
  });

  it('ignores titleOverlay for the overlay style', () => {
    render(<ContentCard {...defaultProps} cardStyle="overlay" titleOverlay />);
    expect(
      screen.queryByTestId('content-card-title-scrim'),
    ).not.toBeInTheDocument();
  });

  it.each(['outline', 'flat'] as const)(
    'moves the title into the image scrim with titleOverlay on the %s style',
    cardStyle => {
      render(
        <ContentCard {...defaultProps} cardStyle={cardStyle} titleOverlay />,
      );
      const scrim = screen.getByTestId('content-card-title-scrim');
      const heading = within(scrim).getByRole('heading', {level: 3});
      expect(heading).toBeInTheDocument();
      // The overlaid title is bold.
      expect(heading).toHaveStyle({fontWeight: 700});
      // The badge stays in the content block below the image.
      expect(within(scrim).queryByText('News')).not.toBeInTheDocument();
      expect(screen.getByText('News')).toBeInTheDocument();
    },
  );

  it('renders the title normally when titleOverlay is set without an image', () => {
    render(<ContentCard {...defaultProps} image={undefined} titleOverlay />);
    expect(
      screen.queryByTestId('content-card-title-scrim'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('heading', {level: 3})).toBeInTheDocument();
  });

  it('renders a placeholder when no title is bound', () => {
    render(<ContentCard />);
    expect(screen.getByText(/Content Card placeholder/)).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
