import {render, screen} from '@testing-library/react';
import '@testing-library/jest-dom';

import UnitCard, {UnitCardProps} from '@/components/contentful/unitCard';
import {LinkEntry} from '@/types/contentful/entries/Link';

const linkEntry = {
  fields: {
    label: 'Explore',
    primaryTarget: '/curriculum-test',
    isThisAnExternalLink: false,
  },
} as LinkEntry;

const defaultProps: UnitCardProps = {
  title: 'Problem Solving with AI',
  shortDescription: 'Introduce students to AI as a collaborator.',
  gradeBands: ['K-5'],
  duration: ['1 hour'],
  topics: ['Special Topic', 'AI'],
  image: '//contentful-images.code.org/space/asset/hash/unit-card.png',
  link: linkEntry,
};

describe('UnitCard component', () => {
  it('renders the title as a level-4 heading', () => {
    render(<UnitCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {level: 4, name: 'Problem Solving with AI'}),
    ).toBeInTheDocument();
  });

  it('defaults to the unit card type', () => {
    const {container} = render(<UnitCard {...defaultProps} />);
    expect(container.querySelector('article')).toHaveAttribute(
      'data-card-type',
      'unit',
    );
  });

  it('renders the selected heading level without changing the title size', () => {
    render(<UnitCard {...defaultProps} titleHeadingLevel="h3" />);
    const heading = screen.getByRole('heading', {
      level: 3,
      name: 'Problem Solving with AI',
    });
    expect(heading).toHaveStyle({fontSize: '1.25rem'});
  });

  it('renders the short description', () => {
    render(<UnitCard {...defaultProps} />);
    expect(
      screen.getByText('Introduce students to AI as a collaborator.'),
    ).toBeInTheDocument();
  });

  it('renders the grade band as a small light blue badge above the title', () => {
    render(<UnitCard {...defaultProps} />);
    const badge = screen.getByText('Grades K-5');
    expect(badge).toHaveStyle({
      backgroundColor: 'var(--codeai-blue-light)',
      color: 'var(--codeai-blue-dark)',
    });
    expect(
      badge.compareDocumentPosition(screen.getByRole('heading', {level: 4})) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it('renders the title in black', () => {
    render(<UnitCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {level: 4, name: 'Problem Solving with AI'}),
    ).toHaveStyle({color: '#000000'});
  });

  it('lists topics comma-separated after the description', () => {
    render(<UnitCard {...defaultProps} />);
    const topics = screen.getByTestId('unit-card-topics');
    expect(topics).toHaveTextContent(/^Topics: Special Topic, AI$/);
    expect(
      screen
        .getByText('Introduce students to AI as a collaborator.')
        .compareDocumentPosition(topics) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      screen.getByTestId('unit-card-topics').querySelector('.fa-tags'),
    ).toHaveAttribute('aria-hidden', 'true');
  });

  it('weights the topics label 500 and the list 400', () => {
    render(<UnitCard {...defaultProps} />);
    expect(screen.getByText('Special Topic, AI')).toHaveStyle({
      fontWeight: 400,
    });
    expect(screen.getByTestId('unit-card-topics')).toHaveStyle({
      fontWeight: 500,
    });
  });

  it('caps the card at the standard width unless fullWidth is set', () => {
    const {container, rerender} = render(<UnitCard {...defaultProps} />);
    const card = () => container.querySelector('article');
    expect(card()).toHaveStyle({maxWidth: '264px'});
    rerender(<UnitCard {...defaultProps} fullWidth />);
    expect(card()).toHaveStyle({maxWidth: 'none'});
  });

  it('caps topics at four and ends longer lists with an ellipsis', () => {
    const {rerender} = render(
      <UnitCard
        {...defaultProps}
        topics={['AI', 'Data', 'Internet', 'Math']}
      />,
    );
    expect(screen.getByTestId('unit-card-topics')).toHaveTextContent(
      /^Topics: AI, Data, Internet, Math$/,
    );
    rerender(
      <UnitCard
        {...defaultProps}
        topics={['AI', 'Data', 'Internet', 'Math', 'Science']}
      />,
    );
    expect(screen.getByTestId('unit-card-topics')).toHaveTextContent(
      /^Topics: AI, Data, Internet, Math, \.\.\.$/,
    );
  });

  it('hides topics when showTopics is false', () => {
    render(<UnitCard {...defaultProps} showTopics={false} />);
    expect(screen.queryByText(/Topics:/)).not.toBeInTheDocument();
  });

  it('renders no topics row when topics are empty', () => {
    render(<UnitCard {...defaultProps} topics={[]} />);
    expect(screen.queryByTestId('unit-card-topics')).not.toBeInTheDocument();
  });

  it('merges multiple grade bands into one prefixed span', () => {
    render(<UnitCard {...defaultProps} gradeBands={['K-5', '6-8']} />);
    expect(screen.getByText('Grades K-8')).toBeInTheDocument();
    expect(screen.queryByText(/K-5/)).not.toBeInTheDocument();
  });

  it('joins unparseable grade bands as-is', () => {
    render(<UnitCard {...defaultProps} gradeBands={['K-5', 'All grades']} />);
    expect(screen.getByText('Grades K-5, All grades')).toBeInTheDocument();
  });

  it('omits the grade badge when no grade bands are bound', () => {
    render(<UnitCard {...defaultProps} gradeBands={undefined} />);
    expect(screen.queryByText(/Grades/)).not.toBeInTheDocument();
  });

  it('renders the duration with a clock icon hidden from AT', () => {
    render(<UnitCard {...defaultProps} />);
    expect(screen.getByText('1 hour')).toBeInTheDocument();
    const clock = screen
      .getAllByTestId('font-awesome-v6-icon')
      .find(icon => icon.classList.contains('fa-clock'));
    expect(clock).toBeDefined();
    expect(clock).toHaveAttribute('aria-hidden', 'true');
  });

  it.each([
    ['none are set', undefined],
    ['several are set', ['Week', 'Month']],
  ])('shows Flexible duration when %s', (_, duration) => {
    render(<UnitCard {...defaultProps} duration={duration} />);
    expect(screen.getByText('Flexible duration')).toBeInTheDocument();
  });

  it('renders the explore link as the only link on the card', () => {
    render(<UnitCard {...defaultProps} />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName('Explore');
    expect(links[0]).toHaveAttribute('href', '/curriculum-test');
    expect(links[0]).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab', () => {
    const externalLink = {
      fields: {...linkEntry.fields, isThisAnExternalLink: true},
    } as LinkEntry;
    render(<UnitCard {...defaultProps} link={externalLink} />);
    const link = screen.getByRole('link', {name: 'Explore'});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('omits the footer link when no link entry is bound', () => {
    render(<UnitCard {...defaultProps} link={undefined} />);
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.getByText('1 hour')).toBeInTheDocument();
  });

  it('renders the image through the Contentful image optimizer', () => {
    const {container} = render(<UnitCard {...defaultProps} />);
    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(decodeURIComponent(img!.getAttribute('src') || '')).toContain(
      'unit-card.png',
    );
  });

  it('omits the image area when no image is bound', () => {
    const {container} = render(
      <UnitCard {...defaultProps} image={undefined} />,
    );
    expect(container.querySelector('img')).toBeNull();
  });

  describe('course card type', () => {
    const courseProps: UnitCardProps = {
      ...defaultProps,
      cardType: 'course',
      gradeBands: ['9', '10', '11', '12'],
    };

    it('widens the card and grows the image', () => {
      const {container} = render(<UnitCard {...courseProps} />);
      expect(container.querySelector('article')).toHaveStyle({
        maxWidth: '318px',
      });
      expect(container.querySelector('img')!.parentElement).toHaveStyle({
        height: '161px',
      });
    });

    it('renders the title one step up the type scale', () => {
      render(<UnitCard {...courseProps} />);
      expect(screen.getByRole('heading', {level: 4})).toHaveStyle({
        fontSize: '1.5rem',
      });
    });

    it('applies the duration rule to courses', () => {
      const {rerender} = render(
        <UnitCard {...courseProps} duration={['Semester']} />,
      );
      expect(screen.getByText('Semester')).toBeInTheDocument();
      rerender(
        <UnitCard {...courseProps} duration={['Semester', 'School Year']} />,
      );
      expect(screen.getByText('Flexible duration')).toBeInTheDocument();
    });

    it('shares the unit layout: grade badge, topics and duration', () => {
      render(<UnitCard {...courseProps} />);
      expect(screen.getByText('Grades 9-12')).toBeInTheDocument();
      expect(screen.getByTestId('unit-card-topics')).toHaveTextContent(
        'Topics: Special Topic, AI',
      );
      expect(screen.getByText('1 hour')).toBeInTheDocument();
    });
  });

  it('renders a placeholder when no title is bound', () => {
    render(<UnitCard />);
    expect(screen.getByText(/Curriculum Card placeholder/)).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
