/* eslint-disable @typescript-eslint/no-explicit-any */

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
  args: FAQAccordionMock as any,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const summaryEls = Array.from(canvasElement.querySelectorAll('summary'));

    // Open the first FAQ item
    await userEvent.click(summaryEls[0]);
    // Check that the answer is now visible
    const answerText = 'Normal text'; // from mock JSON
    await expect(canvas.getByText(answerText)).toBeInTheDocument();

    /// Open second FAQ item
    await userEvent.click(summaryEls[1]);
    // Check that the answer is now visible
    const secondAnswerText = 'Ordered Item 3'; // from mock JSON
    await expect(canvas.getByText(secondAnswerText)).toBeInTheDocument();

    /// Open third FAQ item
    await userEvent.click(summaryEls[2]);
    // Check that anchor links are present
    const links = await canvas.findAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      await expect(link).toBeVisible();
    }
  },
};
