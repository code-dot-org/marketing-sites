/* eslint-disable @typescript-eslint/no-explicit-any */
import RichText from '@/components/contentful/richText';
import Section from '@/components/contentful/section';
import {BLOCKS} from '@contentful/rich-text-types';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import RichTextMock from './__mocks__/RichText.json';

const meta: Meta<typeof RichText> = {
  title: 'Marketing/RichText',
  component: RichText,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof RichText>;

export const Playground: Story = {
  args: {
    content: {
      nodeType: BLOCKS.DOCUMENT,
      data: {},
      content: [
        {
          nodeType: BLOCKS.PARAGRAPH,
          data: {},
          content: [
            {
              nodeType: 'text',
              value: 'Playground Rich Text',
              marks: [],
              data: {},
            },
          ],
        },
      ],
    },
  },
  argTypes: {
    content: {control: 'object'},
  },
};

export const FilledOut: Story = {
  args: RichTextMock as any,
  play: async ({canvas}) => {
    // Accessibility: paragraphs
    const paragraphs = canvas.getAllByRole('paragraph', {hidden: true});
    expect(paragraphs.length).toBeGreaterThan(0);
    paragraphs.forEach(p => expect(p).toBeVisible());

    // Accessibility: links
    const links = canvas.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link).toHaveAttribute('href');
      expect(link).toBeVisible();
      expect(link).toHaveAccessibleName();
    });

    // Accessibility: lists (ul and ol)
    const lists = canvas.getAllByRole('list');
    expect(lists.length).toBeGreaterThan(0);
    lists.forEach(list => {
      expect(list).toBeVisible();
      const items = canvas.getAllByRole('listitem');
      expect(items.length).toBeGreaterThan(0);
      items.forEach(item => expect(item).toBeVisible());
    });

    // Accessibility: table
    const table = canvas.getAllByRole('table')[0];
    expect(table).toBeVisible();
    const rows = canvas.getAllByRole('row');
    expect(rows.length).toBeGreaterThan(0);
    rows.forEach(row => expect(row).toBeVisible());
    const cells = canvas.getAllByRole('cell');
    expect(cells.length).toBeGreaterThan(0);
    cells.forEach(cell => expect(cell).toBeVisible());
    const headers = canvas.getAllByRole('columnheader');
    expect(headers.length).toBeGreaterThan(0);
    headers.forEach(header => expect(header).toBeVisible());
  },
};

// US2 / FR-016 — body text inherits the contrast-switch result via the CSS
// cascade on Section's data-bg-tone. Confirms Rich Text resolves to readable
// black/white on light/dark CodeAI brand backgrounds without exposing a
// color picker.
const richTextDoc = (text: string) => ({
  nodeType: BLOCKS.DOCUMENT,
  data: {},
  content: [
    {
      nodeType: BLOCKS.PARAGRAPH,
      data: {},
      content: [{nodeType: 'text', value: text, marks: [], data: {}}],
    },
    // Lists regressed separately from paragraphs: item text resolves through
    // Paragraph, but the ::marker color comes from the MuiListItem theme
    // override — both must flip with the section tone.
    {
      nodeType: BLOCKS.UL_LIST,
      data: {},
      content: [
        {
          nodeType: BLOCKS.LIST_ITEM,
          data: {},
          content: [
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Bullet item — text and marker must match the tone.',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ],
    },
    {
      nodeType: BLOCKS.OL_LIST,
      data: {},
      content: [
        {
          nodeType: BLOCKS.LIST_ITEM,
          data: {},
          content: [
            {
              nodeType: BLOCKS.PARAGRAPH,
              data: {},
              content: [
                {
                  nodeType: 'text',
                  value: 'Numbered item — text and marker must match the tone.',
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        },
      ],
    },
  ],
});

export const ContrastSwitchInherit: Story = {
  render: () => (
    <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
      <Section background="purpleDark" padding="m">
        <RichText
          content={
            richTextDoc(
              'Rich Text on a Purple Dark Section — body text should render white via inheritance.',
            ) as any
          }
        />
      </Section>
      <Section background="purpleLight" padding="m">
        <RichText
          content={
            richTextDoc(
              'Rich Text on a Purple Light Section — body text should render black via inheritance.',
            ) as any
          }
        />
      </Section>
    </div>
  ),
};
