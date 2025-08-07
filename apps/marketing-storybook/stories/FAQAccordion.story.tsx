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

const containsText =
  (text: string) =>
  (_: string, el: Element | null): boolean =>
    Boolean(el?.textContent?.includes(text));

export const FilledOut: Story = {
  args: FAQAccordionMock as FAQAccordionContentfulProps,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const summaryEls = Array.from(canvasElement.querySelectorAll('summary'));
    await userEvent.click(summaryEls[0]);

    const firstAnswerEls = canvas.getAllByText(containsText('Normal text'));
    expect(firstAnswerEls.length).toBeGreaterThan(0);
    for (const el of firstAnswerEls) {
      await expect(el).toBeVisible();
    }

    await userEvent.click(summaryEls[1]);

    const secondAnswerEls = canvas.getAllByText(containsText('Ordered Item 3'));
    expect(secondAnswerEls.length).toBeGreaterThan(0);
    for (const el of secondAnswerEls) {
      await expect(el).toBeVisible();
    }

    await userEvent.click(summaryEls[2]);

    const links = await canvas.findAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      await expect(link).toBeVisible();
    }
  },
};
