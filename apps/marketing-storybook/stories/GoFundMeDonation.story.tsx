import GoFundMeDonation from '@/components/contentful/corporateSite/goFundMeDonation';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect} from 'storybook/test';

// The real GoFundMe SDK has no valid context inside Storybook, so the
// reviewable artifact is the emitted target div and its attributes.
const meta: Meta<typeof GoFundMeDonation> = {
  title: 'Marketing/GoFundMeDonation',
  component: GoFundMeDonation,
  tags: ['autodocs', 'marketing'],
  argTypes: {
    formDivId: {control: 'text'},
    formClassyId: {control: 'text'},
    isEditorMode: {control: 'boolean'},
  },
};
export default meta;
type Story = StoryObj<typeof GoFundMeDonation>;

export const UnboundPlaceholder: Story = {
  args: {},
  play: async ({canvas}) => {
    expect(
      canvas.getByText(/GoFundMe Donation placeholder/),
    ).toBeInTheDocument();
  },
};

export const EditorPreview: Story = {
  args: {
    formDivId: 'GnpoO1jdMG-VtRU8aHW20',
    formClassyId: '739526',
    isEditorMode: true,
  },
  play: async ({canvas}) => {
    expect(
      canvas.getByText(/renders here on the live site/),
    ).toBeInTheDocument();
  },
};

export const LiveMarkup: Story = {
  args: {
    formDivId: 'GnpoO1jdMG-VtRU8aHW20',
    formClassyId: '739526',
  },
  play: async ({canvasElement}) => {
    const div = canvasElement.querySelector('[id="GnpoO1jdMG-VtRU8aHW20"]');
    expect(div).toBeInTheDocument();
    expect(div).toHaveAttribute('classy', '739526');
  },
};
