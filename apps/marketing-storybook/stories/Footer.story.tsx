import {GlobalFooterProps} from '@/components/footer/common/types';
import FooterCSforAll from '@/components/footer/csForAll'; // Adjust import path as needed
import {DEFAULT_FOOTER_CONTENT as HOUR_OF_AI_FOOTER_CONTENT} from '@/components/footer/hourOfAi/config';
import FooterHourOfAiView from '@/components/footer/hourOfAi/FooterHourOfAiView';
import {SupportedLocale} from '@/config/locale';
import {Meta, StoryObj} from '@storybook/react';

const meta: Meta = {
  title: 'Marketing/Footer',
  tags: ['marketing'],
  parameters: {
    disableSectionDecorator: true,
    nextjs: {
      appDirectory: true,
      navigation: {
        pathname: '/',
        query: {},
      },
    },
  },
};

export default meta;

const defaultArgs: Partial<GlobalFooterProps> = {
  locale: SupportedLocale['en-US'],
};

export const CSForAll: StoryObj<typeof FooterCSforAll> = {
  render: args => <FooterCSforAll {...args} />,
  args: {
    ...defaultArgs,
  },
  parameters: {
    eyes: {
      browser: [
        {width: 1400, height: 768, name: 'chrome'},
        {width: 1400, height: 768, name: 'firefox'},
        {width: 1400, height: 768, name: 'safari'},
      ],
    },
  },
};

export const HourOfAi: StoryObj<typeof FooterHourOfAiView> = {
  render: () => (
    <FooterHourOfAiView
      locale={SupportedLocale['en-US']}
      content={HOUR_OF_AI_FOOTER_CONTENT}
    />
  ),
  globals: {theme: 'hourofai'},
  parameters: {
    // Layout match: Geist is a variable font and Applitools render nodes
    // rasterize its interpolated weights slightly differently per run.
    eyes: {matchLevel: 'Layout'},
  },
};
