import {render, screen} from '@testing-library/react';
import FAQAccordion, {FAQAccordionProps} from '../FAQAccordion';

const mockFAQItems: FAQAccordionProps['items'] = [
  {
    question: 'What is Code.org?',
    answer: 'Code.org is a nonprofit organization.',
  },
  {
    question: 'How can I start learning?',
    answer: 'You can start with free courses on our website.',
  },
  {
    question: 'Is the curriculum free?',
    answer: 'Yes! All curriculum materials are free to use.',
  },
];

describe('FAQAccordion Component', () => {
  it('renders the FAQAccordion component with all questions', () => {
    render(<FAQAccordion items={mockFAQItems} />);

    mockFAQItems.forEach(({question}) => {
      expect(screen.getByText(question)).toBeInTheDocument();
    });
  });
});
