import type {Meta, StoryObj} from '@storybook/react-webpack5';
import {within, expect} from 'storybook/test';

import SimpleList, {SimpleListProps} from '..';

type Story = StoryObj<typeof SimpleList> & {
  args: SimpleListProps | SimpleListProps[];
};

export default {
  title: 'DesignSystem/List/SimpleList',
  component: SimpleList,
  render: args => {
    const components: SimpleListProps[] = args[0]
      ? Object.values(args)
      : [args];
    return (
      <div style={{display: 'flex', gap: '5em'}}>
        {components.map((component, index) => (
          <SimpleList key={index} {...component} />
        ))}
      </div>
    );
  },
} as Meta;

const defaultArgs: SimpleListProps = {
  items: [
    {key: 'item-a', label: 'Item A'},
    {key: 'item-b', label: 'Item B'},
    {key: 'item-c', label: 'Item C'},
  ],
};

const withIconArgs: SimpleListProps = {
  ...defaultArgs,
  icon: {
    iconName: 'check-circle',
  },
};

const getComputedStylePropValue = (property: string) =>
  window.getComputedStyle(document.body).getPropertyValue(property);

//
// STORIES
//
export const Playground: Story = {
  args: {
    ...defaultArgs,
  },
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: SimpleListProps;
  }) => {
    const canvas = within(canvasElement);

    const list = canvas.getByRole('list');
    expect(list).toHaveStyle('row-gap: 8px;');
    expect(list).toHaveStyle('column-gap: 8px;');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);
      expect(listItemText).toHaveStyle('font-size: 16px;');
      expect(listItemText).toHaveStyle('font-weight: 400;');

      const listItem = listItemText.parentElement;
      expect(listItem).toHaveStyle('row-gap: 8px;');
      expect(listItem).toHaveStyle('column-gap: 8px;');

      const listItemIcon = listItemText.previousElementSibling;
      expect(listItemIcon).toHaveStyle('font-size: 12px;');
      expect(listItemIcon).toHaveStyle('font-weight: 900;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};

export const WithCustomIcon: Story = {
  args: {
    ...withIconArgs,
  },
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: SimpleListProps;
  }) => {
    const canvas = within(canvasElement);

    const list = canvas.getByRole('list');

    args.items.forEach(item => {
      const listItemText = within(list).getByText(item.label as string);

      const listItemIcon = listItemText.previousElementSibling;
      expect(listItemIcon).toHaveStyle('font-size: 16px;');
      expect(listItemIcon).toHaveStyle(
        `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
      );
    });
  },
};

export const Types: Story = {
  args: [
    {
      ...defaultArgs,
      type: 'primary',
      items: [
        {key: 'item-a', label: 'Primary Item A'},
        {key: 'item-b', label: 'Primary Item B'},
        {key: 'item-c', label: 'Primary Item C'},
      ],
    },
    {
      ...defaultArgs,
      type: 'secondary',
      items: [
        {key: 'item-a', label: 'Secondary Item A'},
        {key: 'item-b', label: 'Secondary Item B'},
        {key: 'item-c', label: 'Secondary Item C'},
      ],
    },
    {
      ...defaultArgs,
      type: 'brand',
      items: [
        {key: 'item-a', label: 'Brand Item A'},
        {key: 'item-b', label: 'Brand Item B'},
        {key: 'item-c', label: 'Brand Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {iconColor: '--text-neutral-primary'}, // Primary Type
      {iconColor: '--text-neutral-placeholder'}, // Secondary Type
      {iconColor: '--text-brand-teal-primary'}, // Brand Type
    ].forEach(({iconColor}, index) => {
      const list = canvas.getAllByRole('list')[index];

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(
          `color: ${getComputedStylePropValue('--text-neutral-primary')};`,
        );

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(
          `color: ${getComputedStylePropValue(iconColor)};`,
        );
      });
    });
  },
};

export const Sizes: Story = {
  args: [
    {
      ...defaultArgs,
      size: 'xs',
      items: [
        {key: 'item-a', label: 'XS Item A'},
        {key: 'item-b', label: 'XS Item B'},
        {key: 'item-c', label: 'XS Item C'},
      ],
    },
    {
      ...defaultArgs,
      size: 's',
      items: [
        {key: 'item-a', label: 'S Item A'},
        {key: 'item-b', label: 'S Item B'},
        {key: 'item-c', label: 'S Item C'},
      ],
    },
    {
      ...defaultArgs,
      size: 'm',
      items: [
        {key: 'item-a', label: 'M Item A'},
        {key: 'item-b', label: 'M Item B'},
        {key: 'item-c', label: 'M Item C'},
      ],
    },
    {
      ...defaultArgs,
      size: 'l',
      items: [
        {key: 'item-a', label: 'L Item A'},
        {key: 'item-b', label: 'L Item B'},
        {key: 'item-c', label: 'L Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      // Spec 009 amendment-4 — --font-size-body-xs now aliases to
      // --font-size-text-xs (0.813rem → 0.75rem; 13.008px → 12px).
      {gap: '4px', iconSize: '8px', labelSize: '12px'}, // XS Size
      {gap: '6px', iconSize: '10px', labelSize: '14px'}, // S Size
      {gap: '8px', iconSize: '12px', labelSize: '16px'}, // M Size
      {gap: '10px', iconSize: '14px', labelSize: '20px'}, // L Size
    ].forEach(({gap, iconSize, labelSize}, index) => {
      const list = canvas.getAllByRole('list')[index];
      expect(list).toHaveStyle(`row-gap: ${gap};`);
      expect(list).toHaveStyle(`column-gap: ${gap};`);

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-size: ${labelSize};`);

        const listItem = listItemText.parentElement;
        expect(listItem).toHaveStyle(`row-gap: ${gap};`);
        expect(listItem).toHaveStyle(`column-gap: ${gap};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-size: ${iconSize};`);
      });
    });
  },
};

// Spec 009 amendment-5 — Text scale alignment with Paragraph.
// Eight new size values (`text-xs` through `text-4xl`); `text-md` is the
// default. text-xs/sm/md/lg render identically to legacy xs/s/m/l (same
// underlying CSS variables); text-xl/2xl/3xl/4xl extend the scale upward.
export const TextScaleSizes: Story = {
  args: [
    {
      ...defaultArgs,
      size: 'text-xs',
      items: [
        {key: 'item-a', label: 'text-xs Item A'},
        {key: 'item-b', label: 'text-xs Item B'},
      ],
    },
    {
      ...defaultArgs,
      size: 'text-md',
      items: [
        {key: 'item-a', label: 'text-md (default) Item A'},
        {key: 'item-b', label: 'text-md (default) Item B'},
      ],
    },
    {
      ...defaultArgs,
      size: 'text-xl',
      items: [
        {key: 'item-a', label: 'text-xl Item A'},
        {key: 'item-b', label: 'text-xl Item B'},
      ],
    },
    {
      ...defaultArgs,
      size: 'text-3xl',
      items: [
        {key: 'item-a', label: 'text-3xl Item A'},
        {key: 'item-b', label: 'text-3xl Item B'},
      ],
    },
  ],
};

export const CustomIconSizes: Story = {
  args: [
    {
      ...withIconArgs,
      size: 'xs',
      items: [
        {key: 'item-a', label: 'XS Item A'},
        {key: 'item-b', label: 'XS Item B'},
        {key: 'item-c', label: 'XS Item C'},
      ],
    },
    {
      ...withIconArgs,
      size: 's',
      items: [
        {key: 'item-a', label: 'S Item A'},
        {key: 'item-b', label: 'S Item B'},
        {key: 'item-c', label: 'S Item C'},
      ],
    },
    {
      ...withIconArgs,
      size: 'm',
      items: [
        {key: 'item-a', label: 'M Item A'},
        {key: 'item-b', label: 'M Item B'},
        {key: 'item-c', label: 'M Item C'},
      ],
      icon: {
        iconName: 'check-circle',
      },
    },
    {
      ...withIconArgs,
      size: 'l',
      items: [
        {key: 'item-a', label: 'L Item A'},
        {key: 'item-b', label: 'L Item B'},
        {key: 'item-c', label: 'L Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      // Spec 009 amendment-4 — --font-size-body-xs now aliases to
      // --font-size-text-xs (13.008px → 12px). Icon dimension follows the
      // same CSS variable.
      {gap: '4px', iconSize: '12px', labelSize: '12px'}, // XS Size
      {gap: '6px', iconSize: '14px', labelSize: '14px'}, // S Size
      {gap: '8px', iconSize: '16px', labelSize: '16px'}, // M Size
      {gap: '10px', iconSize: '20px', labelSize: '20px'}, // L Size
    ].forEach(({gap, iconSize, labelSize}, index) => {
      const list = canvas.getAllByRole('list')[index];
      expect(list).toHaveStyle(`row-gap: ${gap};`);
      expect(list).toHaveStyle(`column-gap: ${gap};`);

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-size: ${labelSize};`);

        const listItem = listItemText.parentElement;
        expect(listItem).toHaveStyle(`row-gap: ${gap};`);
        expect(listItem).toHaveStyle(`column-gap: ${gap};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-size: ${iconSize};`);
      });
    });
  },
};

export const Weight: Story = {
  args: [
    {
      ...defaultArgs,
      weight: 'normal',
      items: [
        {key: 'item-a', label: 'Normal Item A'},
        {key: 'item-b', label: 'Normal Item B'},
        {key: 'item-c', label: 'Normal Item C'},
      ],
    },
    {
      ...defaultArgs,
      weight: 'bold',
      items: [
        {key: 'item-a', label: 'Bold Item A'},
        {key: 'item-b', label: 'Bold Item B'},
        {key: 'item-c', label: 'Bold Item C'},
      ],
    },
  ],
  play: ({
    canvasElement,
    args,
  }: {
    canvasElement: HTMLElement;
    args: Story['args'];
  }) => {
    const canvas = within(canvasElement);

    [
      {iconWeight: 900, labelWeight: 400}, // Normal Weight
      {iconWeight: 900, labelWeight: 600}, // Bold Weight
    ].forEach(({iconWeight, labelWeight}, index) => {
      const list = canvas.getAllByRole('list')[index];

      (args as SimpleListProps[])[index].items.forEach(item => {
        const listItemText = within(list).getByText(item.label as string);
        expect(listItemText).toHaveStyle(`font-weight: ${labelWeight};`);

        const listItemIcon = listItemText.previousElementSibling;
        expect(listItemIcon).toHaveStyle(`font-weight: ${iconWeight};`);
      });
    });
  },
};

export const IconColor: Story = {
  parameters: {
    a11y: {
      config: {
        // Showcase brand colors that don't necessarily meet contrast against
        // the default white Storybook background. Real usage pairs them with
        // an appropriate background.
        rules: [{id: 'color-contrast', enabled: false}],
      },
    },
  },
  args: [
    {...defaultArgs, iconColor: 'var(--codeai-purple-primary)'},
    {...defaultArgs, iconColor: 'var(--codeai-purple-dark)'},
    {...defaultArgs, iconColor: 'var(--codeai-green-light)'},
  ],
};

export const TextColor: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [{id: 'color-contrast', enabled: false}],
      },
    },
  },
  args: [
    {...defaultArgs, textColor: 'var(--codeai-purple-primary)'},
    {...defaultArgs, textColor: 'var(--codeai-purple-dark)'},
    {...defaultArgs, textColor: 'var(--codeai-green-light)'},
  ],
};

export const WithMultilineItem: Story = {
  args: {
    style: {maxWidth: '20em'},
    items: [
      {key: 'item-a', label: 'Item A'},
      {
        key: 'item-b',
        label:
          'Extremely, exceptionally, extraordinarily, immensely prolonged Item B',
      },
      {key: 'item-c', label: 'Item C'},
    ],
  },
};
