import {ReactNode} from 'react';
import classNames from 'classnames';

import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './faqAccordion.module.scss';
import {BodyTwoText, StrongText} from '@/typography';

export type FAQItem = {
  id: string;
  question: string | ReactNode;
  questionString: string;
  answer: string | ReactNode;
  answerString: string;
};

export type FAQAccordionProps = {
  /** List of FAQ items */
  items: FAQItem[];
  /** Custom className for additional styling */
  className?: string;
};

const FAQAccordion: React.FC<FAQAccordionProps> = ({items, className}) => {
  return (
    <>
      <div className={classNames(moduleStyles.faqAccordion, className)}>
        {items.map(({id, question, answer}) => (
          <details key={id} className={moduleStyles.faqItem}>
            <summary className={moduleStyles.faqQuestion}>
              {typeof question === 'string' ? (
                <BodyTwoText>
                  <StrongText>{question}</StrongText>
                </BodyTwoText>
              ) : (
                question
              )}
              <FontAwesomeV6Icon iconName="chevron-down" />
            </summary>
            {typeof answer === 'string' ? (
              <BodyTwoText>{answer}</BodyTwoText>
            ) : (
              answer
            )}
          </details>
        ))}
      </div>

      {/* JSON-LD for structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map(item => ({
              '@type': 'Question',
              name: item.questionString,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answerString,
              },
            })),
          }),
        }}
      />
    </>
  );
};

export default FAQAccordion;
