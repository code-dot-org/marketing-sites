import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {SectionBackgroundProvider} from '@/components/contentful/section/SectionBackgroundContext';

import AutoDownload from '../AutoDownload';
import {sendFileDownloadEvent} from '../sendFileDownloadEvent';
import {startFileDownload} from '../startFileDownload';

jest.mock('../startFileDownload', () => ({
  ...jest.requireActual('../startFileDownload'),
  startFileDownload: jest.fn(),
}));
jest.mock('../sendFileDownloadEvent', () => ({
  sendFileDownloadEvent: jest.fn(),
}));

const startFileDownloadMock = startFileDownload as jest.Mock;
const sendFileDownloadEventMock = sendFileDownloadEvent as jest.Mock;

const FILE = '//contentful-assets.code.org/example/abc/def/sample-toolkit.pdf';
const HREF = `https:${FILE}`;

const setNavigationEntry = (entry?: Partial<PerformanceNavigationTiming>) => {
  performance.getEntriesByType = jest.fn(() =>
    entry ? [entry as PerformanceEntry] : [],
  );
};

const setHost = (host: string) => {
  Object.defineProperty(window, 'location', {
    configurable: true,
    value: {...window.location, host, href: `http://${host}/toolkit`},
  });
};

const originalLocation = window.location;

describe('AutoDownload', () => {
  beforeEach(() => {
    startFileDownloadMock.mockReset().mockResolvedValue(undefined);
    sendFileDownloadEventMock.mockReset();
    setNavigationEntry();
    setHost('hourofai.marketing-sites.localhost:3001');
  });

  afterAll(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders the status message and a real fallback link', () => {
    render(<AutoDownload file={FILE} autoStart={false} />);

    expect(screen.getByRole('status')).toHaveTextContent(
      'Your download should start automatically.',
    );
    const link = screen.getByRole('link', {
      name: "If it doesn't, download the file here. (opens in a new tab)",
    });
    expect(link).toHaveAttribute('href', HREF);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('renders authored copy', () => {
    render(
      <AutoDownload
        file={FILE}
        message="Downloading…"
        linkText="Get the toolkit"
        autoStart={false}
      />,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Downloading…');
    expect(
      screen.getByRole('link', {name: 'Get the toolkit (opens in a new tab)'}),
    ).toBeInTheDocument();
  });

  it('starts one download named after the file and reports it', async () => {
    render(<AutoDownload file={FILE} />);

    await waitFor(() => expect(sendFileDownloadEventMock).toHaveBeenCalled());
    expect(startFileDownloadMock).toHaveBeenCalledTimes(1);
    expect(startFileDownloadMock).toHaveBeenCalledWith(
      HREF,
      'sample-toolkit.pdf',
      expect.any(AbortSignal),
    );
    expect(sendFileDownloadEventMock).toHaveBeenCalledTimes(1);
    expect(sendFileDownloadEventMock).toHaveBeenCalledWith({
      href: HREF,
      fileName: 'sample-toolkit.pdf',
    });
  });

  it('does not start when autoStart is false', () => {
    render(<AutoDownload file={FILE} autoStart={false} />);
    expect(startFileDownloadMock).not.toHaveBeenCalled();
  });

  it('only lets the first instance start, until it unmounts', () => {
    const {unmount} = render(<AutoDownload file={FILE} />);
    render(<AutoDownload file={FILE} />);
    expect(startFileDownloadMock).toHaveBeenCalledTimes(1);

    unmount();
    render(<AutoDownload file={FILE} />);
    expect(startFileDownloadMock).toHaveBeenCalledTimes(2);
  });

  it('skips a back/forward return to this page', () => {
    setNavigationEntry({
      type: 'back_forward',
      name: 'http://hourofai.marketing-sites.localhost:3001/toolkit',
    });
    render(<AutoDownload file={FILE} />);
    expect(startFileDownloadMock).not.toHaveBeenCalled();
  });

  it('still starts after a client-side navigation from a back/forward load', () => {
    setNavigationEntry({
      type: 'back_forward',
      name: 'http://hourofai.marketing-sites.localhost:3001/other-page',
    });
    render(<AutoDownload file={FILE} />);
    expect(startFileDownloadMock).toHaveBeenCalledTimes(1);
  });

  it('announces the failure message and keeps the link when the download fails', async () => {
    startFileDownloadMock.mockRejectedValue(new Error('404'));
    jest.spyOn(console, 'warn').mockImplementation(() => {});

    render(<AutoDownload file={FILE} />);

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(
        "The download didn't start automatically.",
      ),
    );
    expect(screen.getByRole('link')).toHaveAttribute('href', HREF);
    expect(sendFileDownloadEventMock).not.toHaveBeenCalled();
  });

  it('does not show a failure or report when the download is aborted', async () => {
    let rejectDownload: (error: unknown) => void = () => {};
    startFileDownloadMock.mockImplementation(
      () => new Promise((_, reject) => (rejectDownload = reject)),
    );

    const {unmount} = render(<AutoDownload file={FILE} />);
    unmount();
    await act(async () =>
      rejectDownload(new DOMException('Aborted', 'AbortError')),
    );

    expect(sendFileDownloadEventMock).not.toHaveBeenCalled();
  });

  it('does not report a fallback link click', async () => {
    render(<AutoDownload file={FILE} autoStart={false} />);
    const link = screen.getByRole('link');
    link.addEventListener('click', event => event.preventDefault());

    await userEvent.click(link);
    expect(sendFileDownloadEventMock).not.toHaveBeenCalled();
  });

  it('renders nothing on the live site without a file', () => {
    const {container} = render(<AutoDownload />);
    expect(container).toBeEmptyDOMElement();
  });

  it('switches the message color on a dark section background', () => {
    const {unmount} = render(
      <AutoDownload file={FILE} message="Light" autoStart={false} />,
    );
    const lightColor = getComputedStyle(screen.getByText('Light')).color;
    unmount();

    render(
      <SectionBackgroundProvider value="purpleDark">
        <AutoDownload file={FILE} message="Dark" autoStart={false} />
      </SectionBackgroundProvider>,
    );
    expect(getComputedStyle(screen.getByText('Dark')).color).not.toBe(
      lightColor,
    );
  });

  describe('in the editor and preview', () => {
    it('does not start in the Studio editor and shows a note', () => {
      render(<AutoDownload file={FILE} isEditorMode />);
      expect(startFileDownloadMock).not.toHaveBeenCalled();
      expect(
        screen.getByText('Auto-download is off in the editor and preview.'),
      ).toBeInTheDocument();
    });

    it('does not start on a preview host and shows a note', () => {
      setHost('preview-hourofai.marketing-sites.localhost:3001');
      render(<AutoDownload file={FILE} />);
      expect(startFileDownloadMock).not.toHaveBeenCalled();
      expect(
        screen.getByText('Auto-download is off in the editor and preview.'),
      ).toBeInTheDocument();
    });

    it('asks for a file in the editor when none is bound', () => {
      render(<AutoDownload isEditorMode />);
      expect(
        screen.getByText('Choose a file to download.'),
      ).toBeInTheDocument();
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });
  });
});
