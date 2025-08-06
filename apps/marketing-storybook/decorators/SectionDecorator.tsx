import Section from '@/components/contentful/section';
import {StoryContext, StoryFn} from '@storybook/nextjs-vite';

const SectionDecorator = (Story: StoryFn, context: StoryContext) => {
  return (
    <Section background={context.globals.sectionBackground}>
      <Story />
    </Section>
  );
};

export default SectionDecorator;
