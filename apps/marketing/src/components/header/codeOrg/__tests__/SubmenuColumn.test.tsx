import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {isExternalLink} from '@/components/common/utils';

import SubmenuColumn from '../SubmenuColumn';
import {HeaderSubmenuColumn} from '../types';

jest.mock('@/components/common/utils', () => ({
  isExternalLink: jest.fn().mockReturnValue(false),
}));

const baseColumn: HeaderSubmenuColumn = {
  heading: 'Curriculum',
  type: 'Text List',
  items: [
    {title: 'All Courses', href: '/curriculum', subtitle: 'Find a course'},
    {title: 'AI Tutor', href: '/ai-tutor'},
  ],
};

describe('SubmenuColumn', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the heading and one link per item with title and subtitle', () => {
    render(<SubmenuColumn column={baseColumn} onNavigate={jest.fn()} />);

    expect(screen.getByText('Curriculum')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /All Courses/})).toHaveAttribute(
      'href',
      '/curriculum',
    );
    expect(screen.getByText('Find a course')).toBeInTheDocument();
    expect(screen.getByRole('link', {name: /AI Tutor/})).toBeInTheDocument();
  });

  it('omits the heading when not set', () => {
    render(
      <SubmenuColumn
        column={{...baseColumn, heading: undefined}}
        onNavigate={jest.fn()}
      />,
    );

    expect(screen.queryByText('Curriculum')).not.toBeInTheDocument();
  });

  it('renders no images or icons for a Text List', () => {
    const {container} = render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          items: [
            {
              title: 'X',
              href: '/x',
              iconName: 'books',
              imageUrl: 'https://img/x.png',
            },
          ],
        }}
        onNavigate={jest.fn()}
      />,
    );

    expect(container.querySelector('img')).not.toBeInTheDocument();
    expect(container.querySelector('.fa-books')).not.toBeInTheDocument();
  });

  it('renders FontAwesome icons for an Icon List', () => {
    const {container} = render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          type: 'Icon List',
          items: [{title: 'Self-paced', href: '/pl', iconName: 'books'}],
        }}
        onNavigate={jest.fn()}
      />,
    );

    expect(container.querySelector('.fa-solid.fa-books')).toBeInTheDocument();
    expect(container.querySelector('img')).not.toBeInTheDocument();
  });

  it('renders decorative images for an Image List Vertical', () => {
    const {container} = render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          type: 'Image List Vertical',
          items: [
            {
              title: 'AI Foundations',
              href: '/ai',
              imageUrl: 'https://img/c.png',
            },
          ],
        }}
        onNavigate={jest.fn()}
      />,
    );

    const image = container.querySelector('img');
    expect(image).toHaveAttribute('src', 'https://img/c.png');
    expect(image).toHaveAttribute('alt', '');
  });

  it('lays out Image List Vertical items as rows (image left, text right)', () => {
    render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          type: 'Image List Vertical',
          items: [{title: 'A', href: '/a', imageUrl: 'https://img/a.png'}],
        }}
        onNavigate={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', {name: /A/})).toHaveStyle({
      flexDirection: 'row',
    });
  });

  it('lays out Image List Horizontal items as vertical cards (image above text)', () => {
    render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          type: 'Image List Horizontal',
          items: [{title: 'A', href: '/a', imageUrl: 'https://img/a.png'}],
        }}
        onNavigate={jest.fn()}
      />,
    );

    expect(screen.getByRole('link', {name: /A/})).toHaveStyle({
      flexDirection: 'column',
    });
  });

  it('lays out an Image List Horizontal as a two-column grid', () => {
    const {container} = render(
      <SubmenuColumn
        column={{
          ...baseColumn,
          type: 'Image List Horizontal',
          items: [
            {title: 'A', href: '/a', imageUrl: 'https://img/a.png'},
            {title: 'B', href: '/b', imageUrl: 'https://img/b.png'},
          ],
        }}
        onNavigate={jest.fn()}
      />,
    );

    expect(container.querySelector('ul')).toHaveStyle({
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    });
  });

  it('calls onNavigate when a link is clicked', async () => {
    const onNavigate = jest.fn();
    render(<SubmenuColumn column={baseColumn} onNavigate={onNavigate} />);

    await userEvent.click(screen.getByRole('link', {name: /All Courses/}));

    expect(onNavigate).toHaveBeenCalledTimes(1);
  });

  it('opens external links in a new tab', () => {
    (isExternalLink as jest.Mock).mockReturnValue(true);
    render(<SubmenuColumn column={baseColumn} onNavigate={jest.fn()} />);

    const link = screen.getByRole('link', {name: /All Courses/});
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
