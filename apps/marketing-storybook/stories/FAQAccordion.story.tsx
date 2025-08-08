import FAQAccordionContentful, {
  FAQAccordionContentfulProps,
} from '@/components/contentful/faqAccordion/FAQAccordion';
import {Meta, StoryObj} from '@storybook/react';
import {expect, within, userEvent} from 'storybook/test';

import FAQAccordionMock from './__mocks__/FAQAccordion.json';

const meta: Meta<FAQAccordionContentfulProps> = {
  title: 'Marketing/FAQAccordion',
  component: FAQAccordionContentful,
  tags: ['autodocs'],
};
export default meta;

type Story = StoryObj<FAQAccordionContentfulProps>;

export const FilledOut: Story = {
  args: FAQAccordionMock as FAQAccordionContentfulProps,
  play: async ({canvas}) => {
    // Check for all three FAQ questions
    const questions = ['FAQ Text', 'FAQ Lists', 'FAQ Links'];
    for (const q of questions) {
      const summary = canvas.getByRole('button', {name: q});
      expect(summary).toBeInTheDocument();
      await userEvent.click(summary);
      // Find the closest MuiAccordion-root ancestor and cast to HTMLElement
      const accordionRoot = summary.closest(
        '.MuiAccordion-root',
      ) as HTMLElement | null;
      expect(accordionRoot).toBeTruthy();
      // Use within to get the region inside this accordion
      const region = within(accordionRoot!).getByRole('region', {hidden: true});
      expect(region).toBeInTheDocument();
      if (q === 'FAQ Text') {
        expect(region).toHaveTextContent('Normal text');
      } else if (q === 'FAQ Lists') {
        expect(region).toHaveTextContent('Ordered Item 3');
      } else if (q === 'FAQ Links') {
        // Find the Bold Italic link inside the region
        const boldItalicLink = within(region).getByRole('link', {
          name: 'Bold Italic link',
        });
        expect(boldItalicLink).toBeInTheDocument();
        expect(boldItalicLink).toHaveAttribute(
          'href',
          expect.stringContaining('https://code.org'),
        );
      }
    }
  },
};
