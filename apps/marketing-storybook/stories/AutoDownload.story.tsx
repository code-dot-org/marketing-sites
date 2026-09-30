import AutoDownload from '@/components/contentful/autoDownload';
import Section from '@/components/contentful/section';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, spyOn, waitFor, within} from 'storybook/test';

// Synthetic URL; the stories never fetch a real file.
const FILE = '//contentful-assets.code.org/example/abc/def/sample-toolkit.pdf';

const meta: Meta<typeof AutoDownload> = {
  title: 'Marketing/AutoDownload',
  component: AutoDownload,
  tags: ['autodocs', 'marketing'],
  args: {file: FILE, autoStart: false},
};
export default meta;
type Story = StoryObj<typeof AutoDownload>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toHaveTextContent(
      'Your download should start automatically.',
    );
    await expect(
      canvas.getByRole('link', {
        name: "If it doesn't, download the file here. (opens in a new tab)",
      }),
    ).toHaveAttribute('href', `https:${FILE}`);
  },
};

export const DarkSection: Story = {
  render: args => (
    <Section background="purpleDark" padding="m">
      <AutoDownload {...args} />
    </Section>
  ),
};

// Mocks the file fetch and the save so the story never downloads anything.
export const AutoStarts: Story = {
  args: {autoStart: true},
  beforeEach: () => {
    const fetchSpy = spyOn(window, 'fetch').mockResolvedValue(
      new Response(new Blob(['%PDF-1.4'], {type: 'application/pdf'})),
    );
    const clickSpy = spyOn(
      HTMLAnchorElement.prototype,
      'click',
    ).mockImplementation(() => {});
    return () => {
      fetchSpy.mockRestore();
      clickSpy.mockRestore();
    };
  },
  play: async ({canvasElement}) => {
    await waitFor(() =>
      expect(window.fetch).toHaveBeenCalledWith(`https:${FILE}`, {
        credentials: 'omit',
        signal: expect.any(AbortSignal),
      }),
    );
    await waitFor(() =>
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1),
    );
    await expect(within(canvasElement).getByRole('status')).toHaveTextContent(
      'Your download should start automatically.',
    );
  },
};

export const Failed: Story = {
  args: {autoStart: true},
  beforeEach: () => {
    const fetchSpy = spyOn(window, 'fetch').mockResolvedValue(
      new Response(null, {status: 404}),
    );
    return () => fetchSpy.mockRestore();
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(canvas.getByRole('status')).toHaveTextContent(
        "The download didn't start automatically.",
      ),
    );
    await expect(canvas.getByRole('link')).toBeVisible();
  },
};

export const EditorMode: Story = {
  args: {isEditorMode: true, autoStart: true},
  play: async ({canvasElement}) => {
    await expect(
      within(canvasElement).getByText(
        'Auto-download is off in the editor and preview.',
      ),
    ).toBeInTheDocument();
  },
};

export const EditorWithAnalyticsParameters: Story = {
  args: {
    isEditorMode: true,
    analyticsParameters: 'download_campaign=springplcourse, method=link',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(
        'Analytics parameters: download_campaign=springplcourse',
      ),
    ).toBeInTheDocument();
    await expect(
      canvas.getByText(
        'Ignored analytics parameters: method=link (reserved name)',
      ),
    ).toBeInTheDocument();
  },
};

export const EditorUnbound: Story = {
  args: {file: undefined, isEditorMode: true},
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Choose a file to download.'),
    ).toBeInTheDocument();
    await expect(canvas.queryByRole('link')).not.toBeInTheDocument();
  },
};
