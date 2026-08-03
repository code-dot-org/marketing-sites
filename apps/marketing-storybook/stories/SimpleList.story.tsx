import {BRAND_COLORS} from '@/components/common/colors';
import SimpleListContentful, {
  SimpleListContentfulProps,
} from '@/components/contentful/simpleList';
import {Meta, StoryObj} from '@storybook/react';
import {expect} from 'storybook/test';

import SimpleListMock from './__mocks__/SimpleList.json';

const meta: Meta<SimpleListContentfulProps> = {
  title: 'Marketing/SimpleList',
  component: SimpleListContentful,
  parameters: {
    layout: 'centered',
  },
};
export default meta;

export const Basic: StoryObj<SimpleListContentfulProps> = {
  args: SimpleListMock,
  play: async ({canvas}) => {
    // Check that all list items are rendered
    const items = await canvas.findAllByText(/List Item/);
    await expect(items.length).toBeGreaterThan(0);
    // Check that the first item text is present
    await expect(await canvas.findByText('List Item 1')).toBeInTheDocument();
  },
};

export const Manual: StoryObj<SimpleListContentfulProps> = {
  args: {
    manualList: 'First manual item\nSecond manual item\nThird manual item',
    size: 'm',
    weight: 'normal',
    iconName: 'circle-small',
    type: 'primary',
  },
  play: async ({canvas}) => {
    await expect(
      await canvas.findByText('First manual item'),
    ).toBeInTheDocument();
    await expect(
      await canvas.findByText('Third manual item'),
    ).toBeInTheDocument();
  },
};

// CodeAI brand palette — one SimpleList per brand color, exercising both the
// icon `type` and `textColor` controls so storybook-eyes establishes a baseline
// for the new palette options.
export const BrandPalette: StoryObj<SimpleListContentfulProps> = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      {BRAND_COLORS.map(({value, displayName}) => (
        <SimpleListContentful
          key={`brand-${value}`}
          manualList={`${displayName} item one\n${displayName} item two`}
          size="m"
          weight="normal"
          iconName="circle-small"
          type={value}
          textColor={value}
        />
      ))}
    </div>
  ),
};

export const Smile: StoryObj<SimpleListContentfulProps> = {
  args: {
    ...SimpleListMock,
    size: 'm',
    weight: 'normal',
    iconName: 'smile',
    type: 'primary',
    children: null,
  },
  play: async ({canvas}) => {
    // Check that the smile icon is rendered by fa-smile class on <i> tag
    const smileIcons = Array.from(document.getElementsByTagName('i'));
    const foundSmile = smileIcons.some(icon =>
      (icon as HTMLElement).classList.contains('fa-smile'),
    );
    await expect(foundSmile).toBe(true);
    // Check that all list items are rendered
    const items = await canvas.findAllByText(/List Item/);
    await expect(items.length).toBeGreaterThan(0);
  },
};
