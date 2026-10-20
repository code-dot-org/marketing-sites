/* eslint-disable @typescript-eslint/no-explicit-any */

import FileDownloader from '@/components/contentful/fileDownloader';
import Section from '@/components/contentful/section';
import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import type {Meta, StoryObj} from '@storybook/nextjs-vite';
import {expect, spyOn, userEvent, waitFor, within} from 'storybook/test';

// Synthetic assets; the stories never fetch a real file.
const assetUrl = (name: string) =>
  `//contentful-assets.code.org/example/abc/def/${name}.pdf`;

useInMemoryEntities().addEntities(
  ['impact-report-2025', 'impact-report-2024'].map(id => ({
    sys: {id, type: 'Asset'},
    fields: {file: {url: assetUrl(id)}},
  })) as any,
);

const fileDownload = (id: string, fileTitle: string, fields: object) => ({
  sys: {id, contentType: {sys: {id: 'fileDownload'}}},
  fields: {title: `${fileTitle} (internal)`, fileTitle, ...fields},
});

const assetStub = (id: string) => ({
  sys: {type: 'Link', linkType: 'Asset', id},
});

const FILES = [
  fileDownload('file-2025', '2025 Impact Report', {
    fileAsset: assetStub('impact-report-2025'),
  }),
  fileDownload('file-2024', '2024 Impact Report', {
    fileAsset: assetStub('impact-report-2024'),
  }),
  fileDownload('file-2023', '2023 Impact Report', {
    externalFileUrl: 'https://example.org/impact-report-2023.pdf',
  }),
] as any;

const meta: Meta<typeof FileDownloader> = {
  title: 'Marketing/FileDownloader',
  component: FileDownloader,
  tags: ['autodocs', 'marketing'],
  args: {
    files: FILES,
    placeholder: 'Select report',
    color: 'purple',
    variant: 'dark',
  },
  // Fixed-width parent: the dropdown fills its container.
  decorators: [
    Story => (
      <div style={{width: '360px'}}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof FileDownloader>;

const getTrigger = (canvasElement: HTMLElement) =>
  within(canvasElement).getByRole('button', {name: 'Select report'});

// The caret must match the label color in every style.
const expectSwatch = async (
  canvasElement: HTMLElement,
  {
    background,
    text,
    border,
  }: {background: string; text: string; border: string},
) => {
  const trigger = getTrigger(canvasElement);
  const styles = getComputedStyle(trigger);
  await expect(styles.backgroundColor).toBe(background);
  await expect(styles.color).toBe(text);
  await expect(styles.borderTopColor).toBe(border);
  await expect(getComputedStyle(trigger.querySelector('svg')!).color).toBe(
    text,
  );
};

export const Default: Story = {
  play: async ({canvasElement}) => {
    const trigger = getTrigger(canvasElement);
    await expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    await expect(trigger).not.toHaveAttribute('aria-expanded');
    await expect(trigger.getBoundingClientRect().width).toBe(360);
    await expectSwatch(canvasElement, {
      background: 'rgb(76, 66, 207)',
      text: 'rgb(255, 255, 255)',
      border: 'rgba(0, 0, 0, 0)',
    });
  },
};

export const Light: Story = {
  args: {variant: 'light'},
  play: async ({canvasElement}) => {
    await expectSwatch(canvasElement, {
      background: 'rgb(228, 226, 248)',
      text: 'rgb(31, 25, 118)',
      border: 'rgba(0, 0, 0, 0)',
    });
  },
};

export const Secondary: Story = {
  args: {variant: 'secondary'},
  play: async ({canvasElement}) => {
    await expectSwatch(canvasElement, {
      background: 'rgba(0, 0, 0, 0)',
      text: 'rgb(31, 25, 118)',
      border: 'rgb(76, 66, 207)',
    });
  },
};

export const Open: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Select report'}));
    const menu = within(canvasElement.ownerDocument.body).getByRole('menu');
    const paper = menu.closest('.MuiPaper-root')!;
    await expect(getComputedStyle(paper).boxShadow).toBe('none');
    await expect(getComputedStyle(paper).borderTopWidth).toBe('1px');
    // Options span the full list so hover covers the whole row.
    await expect(getComputedStyle(menu).paddingInlineStart).toBe('0px');
    const menuWidth = menu.clientWidth;
    for (const item of within(menu).getAllByRole('menuitem')) {
      await expect(item.offsetWidth).toBe(menuWidth);
    }
    await expect(
      within(menu)
        .getAllByRole('menuitem')
        .map(item => item.textContent),
    ).toEqual([
      '2025 Impact Report',
      '2024 Impact Report',
      '2023 Impact Report',
    ]);
    // MUI focuses the first option on open and shades it only when the
    // browser reports :focus-visible, which varies between eyes runs. Moving
    // focus to the list (still inside the menu's focus trap) clears it, so
    // the snapshot always matches a mouse open.
    const [firstItem] = within(menu).getAllByRole('menuitem');
    await waitFor(() => expect(firstItem).toHaveFocus());
    menu.focus();
    await waitFor(() => expect(firstItem).not.toHaveClass('Mui-focusVisible'));
    await expect(getComputedStyle(firstItem).backgroundColor).toBe(
      'rgba(0, 0, 0, 0)',
    );
  },
};

// Mocks the file fetch and the save so the story never downloads anything.
// Looks the same as Default once the menu closes; behavior only.
export const DownloadsFile: Story = {
  parameters: {eyes: {include: false}},
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
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', {name: 'Select report'}),
    );
    await userEvent.click(
      body.getByRole('menuitem', {name: '2025 Impact Report'}),
    );
    await waitFor(() =>
      expect(window.fetch).toHaveBeenCalledWith(
        `https:${assetUrl('impact-report-2025')}`,
        {credentials: 'omit', signal: expect.any(AbortSignal)},
      ),
    );
    await waitFor(() =>
      expect(HTMLAnchorElement.prototype.click).toHaveBeenCalledTimes(1),
    );
    await expect(
      within(canvasElement).getByRole('status', {hidden: true}),
    ).toHaveTextContent('Downloading 2025 Impact Report.');
  },
};

export const WhiteSecondaryOnDarkSection: Story = {
  args: {color: 'white', variant: 'secondary'},
  render: args => (
    <Section background="purpleDark" padding="m">
      <FileDownloader {...args} />
    </Section>
  ),
  play: async ({canvasElement}) => {
    await expectSwatch(canvasElement, {
      background: 'rgba(0, 0, 0, 0)',
      text: 'rgb(255, 255, 255)',
      border: 'rgb(255, 255, 255)',
    });
  },
};

export const EditorEmpty: Story = {
  args: {files: [], isEditorMode: true},
  play: async ({canvasElement}) => {
    await expect(
      within(canvasElement).getByText('Bind a List of File Download entries.'),
    ).toBeInTheDocument();
  },
};
