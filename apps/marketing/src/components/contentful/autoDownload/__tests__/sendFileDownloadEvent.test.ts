import {sendGAEvent} from '@next/third-parties/google';

import {sendFileDownloadEvent} from '../sendFileDownloadEvent';

jest.mock('@next/third-parties/google', () => ({sendGAEvent: jest.fn()}));

const sendGAEventMock = sendGAEvent as jest.Mock;

const HREF =
  'https://contentful-assets.code.org/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf';
const EVENT = {
  href: HREF,
  fileName: 'hour-of-ai-toolkit.pdf',
  method: 'auto' as const,
};

const setReadyState = (state: DocumentReadyState) =>
  Object.defineProperty(document, 'readyState', {
    configurable: true,
    get: () => state,
  });

describe('sendFileDownloadEvent', () => {
  beforeEach(() => {
    sendGAEventMock.mockReset();
    delete (window as {dataLayer?: unknown}).dataLayer;
    setReadyState('complete');
  });

  it('sends one file_download event matching the built-in parameters', () => {
    (window as {dataLayer?: unknown[]}).dataLayer = [];

    sendFileDownloadEvent(EVENT);

    expect(sendGAEventMock).toHaveBeenCalledTimes(1);
    expect(sendGAEventMock).toHaveBeenCalledWith('event', 'file_download', {
      file_name: '/hwu8vzk5v0g2/abc/def/hour-of-ai-toolkit.pdf',
      file_extension: 'pdf',
      link_url: HREF,
      method: 'auto',
    });
  });

  it('adds authored parameters without letting them overwrite the event fields', () => {
    (window as {dataLayer?: unknown[]}).dataLayer = [];

    sendFileDownloadEvent({
      ...EVENT,
      parameters: {download_campaign: 'springplcourse', method: 'link'},
    });

    expect(sendGAEventMock).toHaveBeenCalledWith(
      'event',
      'file_download',
      expect.objectContaining({
        download_campaign: 'springplcourse',
        method: 'auto',
      }),
    );
  });

  it('reports fallback-link clicks with method link', () => {
    (window as {dataLayer?: unknown[]}).dataLayer = [];

    sendFileDownloadEvent({...EVENT, method: 'link'});

    expect(sendGAEventMock).toHaveBeenCalledWith(
      'event',
      'file_download',
      expect.objectContaining({method: 'link'}),
    );
  });

  it('waits for window load when GA has not initialised yet', () => {
    setReadyState('interactive');

    sendFileDownloadEvent(EVENT);
    expect(sendGAEventMock).not.toHaveBeenCalled();

    (window as {dataLayer?: unknown[]}).dataLayer = [];
    window.dispatchEvent(new Event('load'));
    expect(sendGAEventMock).toHaveBeenCalledTimes(1);
  });

  it('drops the event when GA never initialises', () => {
    setReadyState('interactive');

    sendFileDownloadEvent(EVENT);
    window.dispatchEvent(new Event('load'));
    expect(sendGAEventMock).not.toHaveBeenCalled();
  });

  it('drops the event when the page has loaded without GA', () => {
    expect(() => sendFileDownloadEvent(EVENT)).not.toThrow();
    expect(sendGAEventMock).not.toHaveBeenCalled();
  });
});
