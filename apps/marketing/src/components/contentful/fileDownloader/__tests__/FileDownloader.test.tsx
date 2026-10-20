import {useInMemoryEntities} from '@contentful/experiences-sdk-react';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {sendFileDownloadEvent} from '@/components/contentful/autoDownload/sendFileDownloadEvent';
import {startFileDownload} from '@/components/contentful/autoDownload/startFileDownload';
import {FileDownloadEntry} from '@/types/contentful/entries/FileDownload';

import FileDownloader from '../FileDownloader';

jest.mock('@/components/contentful/autoDownload/startFileDownload', () => ({
  ...jest.requireActual(
    '@/components/contentful/autoDownload/startFileDownload',
  ),
  startFileDownload: jest.fn(),
}));
jest.mock('@/components/contentful/autoDownload/sendFileDownloadEvent', () => ({
  sendFileDownloadEvent: jest.fn(),
}));

const startFileDownloadMock = startFileDownload as jest.Mock;
const sendFileDownloadEventMock = sendFileDownloadEvent as jest.Mock;

// Synthetic asset; nothing is fetched.
const ASSET_URL =
  '//contentful-assets.code.org/example/abc/def/report-2025.pdf';
const ASSET_HREF = `https:${ASSET_URL}`;

useInMemoryEntities().addEntities([
  {
    sys: {id: 'report-asset', type: 'Asset'},
    fields: {file: {url: ASSET_URL}},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any,
]);

const fileDownload = (
  id: string,
  fields: Partial<FileDownloadEntry['fields']>,
  contentType = 'fileDownload',
) =>
  ({
    sys: {id, contentType: {sys: {id: contentType}}},
    fields: {title: `${id} (internal)`, fileTitle: id, ...fields},
  }) as unknown as FileDownloadEntry;

const assetStub = {sys: {type: 'Link', linkType: 'Asset', id: 'report-asset'}};

const FILES = [
  fileDownload('2025 Report', {
    fileAsset: assetStub as unknown as FileDownloadEntry['fields']['fileAsset'],
  }),
  fileDownload('2024 Report', {
    externalFileUrl: 'https://example.org/report-2024.pdf',
  }),
];

const setHost = (host: string) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {...window.location, host, assign: jest.fn()},
  });
};

const originalLocation = window.location;

const openMenu = async () => {
  await userEvent.click(screen.getByRole('button', {name: 'Select report'}));
  return screen.getByRole('menu');
};

describe('FileDownloader', () => {
  beforeEach(() => {
    startFileDownloadMock.mockReset().mockResolvedValue(undefined);
    sendFileDownloadEventMock.mockReset();
    setHost('code.marketing-sites.localhost:3001');
    jest.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => jest.restoreAllMocks());

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders a collapsed menu button with the placeholder', () => {
    render(<FileDownloader files={FILES} placeholder="Select report" />);

    const trigger = screen.getByRole('button', {name: 'Select report'});
    expect(trigger).toHaveAttribute('aria-haspopup', 'true');
    expect(trigger).not.toHaveAttribute('aria-expanded');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('lists File Download entries by file title and skips other entries', async () => {
    render(
      <FileDownloader
        files={[
          ...FILES,
          fileDownload('A person', {}, 'person'),
          fileDownload('No file', {}),
          fileDownload('Script', {externalFileUrl: 'javascript:alert(1)'}),
        ]}
        placeholder="Select report"
      />,
    );

    await openMenu();
    // The open menu's modal hides the rest of the page from the a11y tree.
    expect(
      screen.getByRole('button', {name: 'Select report', hidden: true}),
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getAllByRole('menuitem').map(item => item.textContent),
    ).toEqual(['2025 Report', '2024 Report']);
  });

  it('saves an asset file and reports the download', async () => {
    render(<FileDownloader files={FILES} placeholder="Select report" />);

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', {name: '2025 Report'}));

    expect(startFileDownloadMock).toHaveBeenCalledWith(
      ASSET_HREF,
      'report-2025.pdf',
      expect.any(AbortSignal),
    );
    expect(sendFileDownloadEventMock).toHaveBeenCalledWith({
      href: ASSET_HREF,
      fileName: 'report-2025.pdf',
      method: 'dropdown',
    });
    expect(screen.getByRole('status')).toHaveTextContent(
      'Downloading 2025 Report.',
    );
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('opens an external file in a new tab', async () => {
    render(<FileDownloader files={FILES} placeholder="Select report" />);

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', {name: '2024 Report'}));

    expect(window.open).toHaveBeenCalledWith(
      'https://example.org/report-2024.pdf',
      '_blank',
      'noopener,noreferrer',
    );
    expect(startFileDownloadMock).not.toHaveBeenCalled();
  });

  it('falls back to opening the file when the save fails', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    startFileDownloadMock.mockRejectedValue(new Error('network'));
    render(<FileDownloader files={FILES} placeholder="Select report" />);

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', {name: '2025 Report'}));

    await waitFor(() =>
      expect(window.location.assign).toHaveBeenCalledWith(ASSET_HREF),
    );
  });

  it('does not report downloads in the editor', async () => {
    render(
      <FileDownloader files={FILES} placeholder="Select report" isEditorMode />,
    );

    await openMenu();
    await userEvent.click(screen.getByRole('menuitem', {name: '2025 Report'}));

    expect(startFileDownloadMock).toHaveBeenCalled();
    expect(sendFileDownloadEventMock).not.toHaveBeenCalled();
  });

  it('colors the label and caret from the color and style', () => {
    const {rerender} = render(
      <FileDownloader files={FILES} placeholder="Select report" />,
    );
    const trigger = () => screen.getByRole('button', {name: 'Select report'});
    // Defaults to Purple Dark: white label on the purple primary fill.
    expect(trigger()).toHaveStyle({color: '#ffffff'});
    expect(trigger().querySelector('svg')).toHaveStyle({color: 'inherit'});

    rerender(
      <FileDownloader
        files={FILES}
        placeholder="Select report"
        color="black"
        variant="secondary"
      />,
    );
    expect(trigger()).toHaveStyle({
      color: '#000000',
      borderColor: '#000000',
      backgroundColor: 'transparent',
    });
  });

  it('falls back to the default swatch for an unknown stored color', () => {
    render(
      <FileDownloader
        files={FILES}
        placeholder="Select report"
        color={'purplePrimary' as never}
      />,
    );
    expect(screen.getByRole('button', {name: 'Select report'})).toHaveStyle({
      color: '#ffffff',
    });
  });

  it('renders nothing without files, and a hint in the editor', () => {
    const {container, rerender} = render(<FileDownloader files={[]} />);
    expect(container).toBeEmptyDOMElement();

    rerender(<FileDownloader files={[]} isEditorMode />);
    expect(
      screen.getByText('Bind a List of File Download entries.'),
    ).toBeInTheDocument();
  });
});
