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
  it('renders the title as a level-3 heading', () => {
    render(<UnitCard {...defaultProps} />);
    expect(
      screen.getByRole('heading', {level: 3, name: 'Problem Solving with AI'}),
    ).toBeInTheDocument();
  });

  it('renders the short description', () => {
    render(<UnitCard {...defaultProps} />);
    expect(
      screen.getByText('Introduce students to AI as a collaborator.'),
    ).toBeInTheDocument();
  });

  it('renders each topic as a purple badge by default', () => {
    render(<UnitCard {...defaultProps} />);
    for (const topic of ['Special Topic', 'AI']) {
      expect(screen.getByText(topic)).toHaveStyle({
        backgroundColor: 'var(--codeai-purple-primary)',
      });
    }
  });

  it('applies the selected topic badge color to all topics', () => {
    render(<UnitCard {...defaultProps} topicBadgeColor="green" />);
    for (const topic of ['Special Topic', 'AI']) {
      expect(screen.getByText(topic)).toHaveStyle({
        backgroundColor: 'var(--codeai-green-primary)',
      });
    }
  });

  it('renders the title in gray-8 by default and a family primary when set', () => {
    const heading = () =>
      screen.getByRole('heading', {level: 3, name: 'Problem Solving with AI'});
    const {rerender} = render(<UnitCard {...defaultProps} />);
    expect(heading()).toHaveStyle({color: 'var(--codeai-gray-8, #292f36)'});
    rerender(<UnitCard {...defaultProps} titleColor="orange" />);
    expect(heading()).toHaveStyle({color: 'var(--codeai-orange-primary)'});
  });

  it('caps the card at the standard width unless fullWidth is set', () => {
    const {container, rerender} = render(<UnitCard {...defaultProps} />);
    const card = () => container.querySelector('article');
    expect(card()).toHaveStyle({maxWidth: '264px'});
    rerender(<UnitCard {...defaultProps} fullWidth />);
    expect(card()).toHaveStyle({maxWidth: 'none'});
  });

  it('hides topics when showTopics is false', () => {
    render(<UnitCard {...defaultProps} showTopics={false} />);
    expect(screen.queryByText('Special Topic')).not.toBeInTheDocument();
    expect(screen.queryByText('AI')).not.toBeInTheDocument();
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

  it('omits the grade chip when no grade bands are bound', () => {
    render(<UnitCard {...defaultProps} gradeBands={undefined} />);
    expect(screen.queryByText('K-5')).not.toBeInTheDocument();
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

  it('renders a placeholder when no title is bound', () => {
    render(<UnitCard />);
    expect(screen.getByText(/Unit Card placeholder/)).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
