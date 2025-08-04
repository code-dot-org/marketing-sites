import IconHighlightContentful from '@/components/contentful/iconHighlight';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

const meta: Meta<typeof IconHighlightContentful> = {
  title: 'Marketing/IconHighlight',
  component: IconHighlightContentful,
  tags: ['autodocs', 'marketing'],
};
export default meta;
type Story = StoryObj<typeof IconHighlightContentful>;

export const Playground: Story = {
  args: {
    heading: 'Playground Heading',
    text: 'Playground text for IconHighlight.',
    iconName: 'smile',
    linkEntries: [],
  },
  argTypes: {
    heading: {control: 'text'},
    text: {control: 'text'},
    iconName: {control: 'text'},
    linkEntries: {control: 'object'},
  },
};

export const FilledOut: Story = {
  args: {
    heading: 'Icon Highlight Heading',
    text: 'Icon Highlight\nMultiline Text',
    linkEntries: [
      {
        contentTypeId: 'link',
        metadata: {
          tags: [],
          concepts: [],
        },
        sys: {
          space: {
            sys: {
              type: 'Link',
              linkType: 'Space',
              id: '90t6bu6vlf76',
            },
          },
          id: '3IqvCruY4yXUCkvfArArsD',
          type: 'Entry',
          createdAt: '2025-05-22T21:12:49.939Z',
          updatedAt: '2025-07-23T18:10:13.642Z',
          environment: {
            sys: {
              id: 'master',
              type: 'Link',
              linkType: 'Environment',
            },
          },
          publishedVersion: 58,
          revision: 14,
          contentType: {
            sys: {
              type: 'Link',
              linkType: 'ContentType',
              id: 'link',
            },
          },
          locale: 'en-US',
        },
        fields: {
          linkName: '❌ [ENG] Editorial Card Link',
          label: 'Editorial Card Link',
          primaryTarget: '/editorial-card-test',
          isThisAnExternalLink: true,
        },
      },
    ],
    iconName: 'smile',
  },
  play: async ({canvas}) => {
    // Check heading
    const heading = canvas.getByRole('heading', {
      name: /Icon Highlight Heading/i,
    });
    expect(heading).toBeInTheDocument();

    // Check text
    const text = canvas.getByText(/Icon Highlight\s*Multiline Text/i);
    expect(text).toBeInTheDocument();

    // Check link
    const link = canvas.getByRole('link', {name: /Editorial Card Link/i});
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/editorial-card-test');
    expect(link).toHaveAttribute('target', '_blank');
  },
};
