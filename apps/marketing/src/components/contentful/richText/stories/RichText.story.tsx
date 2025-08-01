/* eslint-disable @typescript-eslint/no-explicit-any */
import {BLOCKS, INLINES} from '@contentful/rich-text-types';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

import RichText from '../RichText';

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
  args: {
    content: {
      data: {},
      content: [
        {
          data: {},
          content: [
            {
              data: {},
              marks: [],
              value: 'Normal text',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
        {
          data: {},
          content: [
            {
              data: {},
              marks: [
                {
                  type: 'bold',
                },
              ],
              value: 'Bold text',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
        {
          data: {},
          content: [
            {
              data: {},
              marks: [],
              value: 'Multiline\n',
              nodeType: 'text',
            },
            {
              data: {},
              marks: [
                {
                  type: 'bold',
                },
              ],
              value: 'complex',
              nodeType: 'text',
            },
            {
              data: {},
              marks: [],
              value: ' text',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
        {
          data: {},
          content: [
            {
              data: {},
              marks: [],
              value: '',
              nodeType: 'text',
            },
            {
              data: {
                uri: 'https://code.org',
              },
              content: [
                {
                  data: {},
                  marks: [],
                  value: 'Normal link',
                  nodeType: 'text',
                },
              ],
              nodeType: INLINES.HYPERLINK,
            },
            {
              data: {},
              marks: [],
              value: '',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
        {
          data: {},
          content: [
            {
              data: {},
              marks: [
                {
                  type: 'bold',
                },
              ],
              value: '',
              nodeType: 'text',
            },
            {
              data: {
                uri: 'https://code.org',
              },
              content: [
                {
                  data: {},
                  marks: [
                    {
                      type: 'bold',
                    },
                  ],
                  value: 'Bold link',
                  nodeType: 'text',
                },
              ],
              nodeType: INLINES.HYPERLINK,
            },
            {
              data: {},
              marks: [],
              value: '',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
        {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'Unordered Item A',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: BLOCKS.PARAGRAPH,
                },
              ],
              nodeType: BLOCKS.LIST_ITEM,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [
                        {
                          type: 'bold',
                        },
                      ],
                      value: 'Unordered Item B',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: BLOCKS.PARAGRAPH,
                },
              ],
              nodeType: BLOCKS.LIST_ITEM,
            },
          ],
          nodeType: BLOCKS.UL_LIST,
        },
        {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [],
                      value: 'Ordered Item 1',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: BLOCKS.PARAGRAPH,
                },
              ],
              nodeType: BLOCKS.LIST_ITEM,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      marks: [
                        {
                          type: 'bold',
                        },
                      ],
                      value: 'Ordered Item 2',
                      nodeType: 'text',
                    },
                  ],
                  nodeType: BLOCKS.PARAGRAPH,
                },
              ],
              nodeType: BLOCKS.LIST_ITEM,
            },
          ],
          nodeType: BLOCKS.OL_LIST,
        },
        {
          data: {},
          content: [
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Header 1',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH as any,
                    },
                  ],
                  nodeType: 'table-header-cell' as any,
                },
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Header 2',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH,
                    },
                  ],
                  nodeType: 'table-header-cell',
                },
              ],
              nodeType: 'table-row' as any,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Column 1-1',
                          nodeType: 'text' as any,
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH as any,
                    },
                  ],
                  nodeType: 'table-cell' as any,
                },
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Column 1-2',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH,
                    },
                  ],
                  nodeType: 'table-cell',
                },
              ],
              nodeType: 'table-row' as any,
            },
            {
              data: {},
              content: [
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Column 2-1',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH,
                    },
                  ],
                  nodeType: 'table-cell',
                },
                {
                  data: {},
                  content: [
                    {
                      data: {},
                      content: [
                        {
                          data: {},
                          marks: [],
                          value: 'Column 2-2',
                          nodeType: 'text',
                        },
                      ],
                      nodeType: BLOCKS.PARAGRAPH,
                    },
                  ],
                  nodeType: 'table-cell',
                },
              ],
              nodeType: 'table-row',
            },
          ],
          nodeType: 'table' as any,
        },
        {
          data: {},
          content: [
            {
              data: {},
              marks: [],
              value: '',
              nodeType: 'text',
            },
          ],
          nodeType: BLOCKS.PARAGRAPH,
        },
      ],
      nodeType: BLOCKS.DOCUMENT,
    },
    children: null,
  },
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
    const table = canvas.getByRole('table');
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
