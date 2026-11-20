import {fireEvent, render, screen} from '@testing-library/react';

import {sendFileDownloadEvent} from '@/components/contentful/autoDownload/sendFileDownloadEvent';

import DownloadTracker from '../sections/DownloadTracker';

jest.mock('@/components/contentful/autoDownload/sendFileDownloadEvent', () => ({
  sendFileDownloadEvent: jest.fn(),
}));
jest.mock('@/config/preview', () => ({
  PREVIEW_HOSTNAMES: new Set(['preview.example.org']),
}));

// GA's built-in file-download tracking listens on the document.
const renderLink = (href: string) => {
  const documentClick = jest.fn();
  document.addEventListener('click', documentClick);
  render(
    <DownloadTracker href={href}>
      <a href={href}>Report</a>
    </DownloadTracker>,
  );
  return documentClick;
};

describe('DownloadTracker', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sends a link file_download event and stops the click there', () => {
    const documentClick = renderLink(
      'https://assets.example.org/files/summary.pdf',
    );
    fireEvent.click(screen.getByRole('link', {name: 'Report'}));

    expect(sendFileDownloadEvent).toHaveBeenCalledWith({
      href: 'https://assets.example.org/files/summary.pdf',
      fileName: 'summary.pdf',
      method: 'link',
    });
    expect(documentClick).not.toHaveBeenCalled();
  });

  it('makes site paths absolute', () => {
    renderLink('/files/summary.pdf');
    fireEvent.click(screen.getByRole('link', {name: 'Report'}));

    expect(sendFileDownloadEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        href: `${window.location.origin}/files/summary.pdf`,
      }),
    );
  });
});
