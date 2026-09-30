import {
  getFileExtension,
  getFileName,
  startFileDownload,
  toAbsoluteFileUrl,
} from '../startFileDownload';

const FILE_URL =
  'https://contentful-assets.code.org/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf';

describe('toAbsoluteFileUrl', () => {
  it('prefixes https: to protocol-relative Contentful URLs', () => {
    expect(
      toAbsoluteFileUrl(
        '//contentful-assets.code.org/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf',
      ),
    ).toBe(FILE_URL);
  });

  it('removes stray whitespace from the asset host', () => {
    expect(
      toAbsoluteFileUrl(
        '//contentful-assets.code.org /hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf',
      ),
    ).toBe(FILE_URL);
  });

  it('keeps absolute URLs', () => {
    expect(toAbsoluteFileUrl(FILE_URL)).toBe(FILE_URL);
  });

  it('returns undefined for empty or unparseable input', () => {
    expect(toAbsoluteFileUrl(undefined)).toBeUndefined();
    expect(toAbsoluteFileUrl('')).toBeUndefined();
    expect(toAbsoluteFileUrl('not a url')).toBeUndefined();
  });
});

describe('getFileName / getFileExtension', () => {
  it('returns the decoded last path segment', () => {
    expect(getFileName(FILE_URL)).toBe('hour-of-ai-toolkit.pdf');
    expect(
      getFileName('https://contentful-assets.code.org/a/b/c/My%20Toolkit.pdf'),
    ).toBe('My Toolkit.pdf');
  });

  it('returns the lowercase extension without the dot', () => {
    expect(getFileExtension('Toolkit.PDF')).toBe('pdf');
    expect(getFileExtension('README')).toBe('');
    expect(getFileExtension('.hidden')).toBe('');
  });
});

describe('startFileDownload', () => {
  const blob = new Blob(['%PDF-1.4'], {type: 'application/pdf'});
  let fetchMock: jest.Mock;
  let clickSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      blob: () => Promise.resolve(blob),
    });
    global.fetch = fetchMock;
    URL.createObjectURL = jest.fn(() => 'blob:https://hourofai.org/1234');
    URL.revokeObjectURL = jest.fn();
    clickSpy = jest
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    clickSpy.mockRestore();
  });

  it('saves the file from a blob URL under its file name', async () => {
    const controller = new AbortController();
    await startFileDownload(
      FILE_URL,
      'hour-of-ai-toolkit.pdf',
      controller.signal,
    );

    expect(fetchMock).toHaveBeenCalledWith(FILE_URL, {
      credentials: 'omit',
      signal: controller.signal,
    });
    expect(clickSpy).toHaveBeenCalledTimes(1);
    const clickedAnchor = clickSpy.mock.contexts[0] as HTMLAnchorElement;
    expect(clickedAnchor.download).toBe('hour-of-ai-toolkit.pdf');
    expect(clickedAnchor.href).toBe('blob:https://hourofai.org/1234');
    expect(clickedAnchor.isConnected).toBe(false);
  });

  it('revokes the blob URL after a delay', async () => {
    await startFileDownload(FILE_URL, 'a.pdf', new AbortController().signal);
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();

    jest.advanceTimersByTime(30_000);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith(
      'blob:https://hourofai.org/1234',
    );
  });

  it('rejects on a non-OK response without saving', async () => {
    fetchMock.mockResolvedValue({ok: false, status: 404});
    await expect(
      startFileDownload(FILE_URL, 'a.pdf', new AbortController().signal),
    ).rejects.toThrow('404');
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('rejects when aborted', async () => {
    const abortError = new DOMException('Aborted', 'AbortError');
    fetchMock.mockRejectedValue(abortError);
    await expect(
      startFileDownload(FILE_URL, 'a.pdf', new AbortController().signal),
    ).rejects.toBe(abortError);
  });
});
