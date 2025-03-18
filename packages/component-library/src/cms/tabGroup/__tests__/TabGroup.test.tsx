import {render, screen, fireEvent, within} from '@testing-library/react';

import '@testing-library/jest-dom';
import {LinkButtonProps} from '@/button';
import {ImageProps} from '@/cms/image';

import TabGroup, {TabGroupProps, TabGroupTabModel} from './../TabGroup';

const mockOnChange = jest.fn();

const defaultButton: LinkButtonProps = {
  children: 'Click Me',
  href: 'https://google.com',
  text: 'Click me',
  target: '_self',
};

const defaultImage: ImageProps = {
  src: 'https://via.placeholder.com/150',
  alt: 'Placeholder Image',
};

const defaultTabs: TabGroupTabModel[] = [
  {
    value: 'tab1',
    text: 'Tab 1',
    tabContent: {
      image: defaultImage,
      button: defaultButton,
      title: 'Track Your Progress',
      description: 'Monitor student work with real-time insights.',
    },
  },
  {
    value: 'tab2',
    text: 'Tab 2',
    tabContent: {
      image: defaultImage,
      button: defaultButton,
      title: 'Engage Students',
      description: 'Make learning more interactive and fun!',
    },
  },
];

const setup = (props?: Partial<TabGroupProps>) => {
  const utils = render(
    <TabGroup
      tabs={defaultTabs}
      defaultSelectedTabValue="tab1"
      onChange={mockOnChange}
      name="test-tabs"
      {...props}
    />,
  );
  return utils;
};

test('renders tabs correctly', () => {
  setup();

  // Check if all tabs are rendered
  expect(screen.getByText('Tab 1')).toBeInTheDocument();
  expect(screen.getByText('Tab 2')).toBeInTheDocument();
});

test('calls onChange when tab is clicked', () => {
  setup();

  const tab = screen.getByText('Tab 2');
  fireEvent.click(tab);

  // Ensure onChange is called with correct value
  expect(mockOnChange).toHaveBeenCalledTimes(1);
  expect(mockOnChange).toHaveBeenCalledWith('tab2');
});

test('renders custom content inside tab', () => {
  setup();

  // Get the container for the active tab using aria-labelledby
  const activeTabPanel = screen.getByRole('tabpanel', {
    name: 'Tab 1',
  });

  // Use `within` to scope the search to the active tab only
  const image = within(activeTabPanel).getByAltText('Placeholder Image');
  expect(image).toBeInTheDocument();

  const title = within(activeTabPanel).getByText('Track Your Progress');
  const description = within(activeTabPanel).getByText(
    'Monitor student work with real-time insights.',
  );
  expect(title).toBeInTheDocument();
  expect(description).toBeInTheDocument();

  // Check for link button

  const linkButton = within(activeTabPanel).getByRole('link', {
    name: 'Click me',
  });
  expect(linkButton).toBeInTheDocument();
  expect(linkButton.closest('a')).toHaveAttribute('href', 'https://google.com');
});

test('renders link button with correct attributes', () => {
  setup();

  const linkButton = screen.getByRole('link', {name: 'Click me'});

  // Ensure that the link has the correct attributes
  expect(linkButton).toBeInTheDocument();
  expect(linkButton.closest('a')).toHaveAttribute('href', 'https://google.com');
  expect(linkButton.closest('a')).toHaveAttribute('target', '_self'); // Default behavior
});
