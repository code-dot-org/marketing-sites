import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type {FileDownloadEntry} from '@/types/contentful/entries/FileDownload';

import OverviewDownloads from '../sections/overview/OverviewDownloads';

jest.mock('@/components/contentful/autoDownload/sendFileDownloadEvent', () => ({
  sendFileDownloadEvent: jest.fn(),
}));

// Synthetic files; nothing is fetched.
const pastReport = (id: string, label: string) =>
  ({
    sys: {id, contentType: {sys: {id: 'fileDownload'}}},
    fields: {
      title: label,
      fileTitle: label,
      fileAsset: {
        fields: {file: {url: `https://assets.example.org/${id}.pdf`}},
      },
    },
  }) as unknown as FileDownloadEntry;

const SUMMARY = 'https://assets.example.org/summary.pdf';
const PAST = [
  pastReport('2024', 'Report 2024'),
  pastReport('2023', 'Report 2023'),
];

describe('OverviewDownloads', () => {
  it('renders nothing without a summary or past reports', () => {
    const {container} = render(
      <OverviewDownloads nationalSummaryUrl={null} pastReports={[]} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('offers the summary, then the past reports in list order', async () => {
    render(
      <OverviewDownloads nationalSummaryUrl={SUMMARY} pastReports={PAST} />,
    );

    expect(
      screen.getByRole('heading', {level: 2, name: 'Download the report'}),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {name: /National Summary Report/}),
    ).toHaveAttribute('href', SUMMARY);
    expect(
      screen.getByRole('img', {name: /Cover of the 2026/}),
    ).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', {name: 'Explore past reports'}),
    );
    expect(
      screen.getAllByRole('menuitem').map(item => item.textContent),
    ).toEqual(['Report 2024', 'Report 2023']);
  });

  it('shows the past reports alone until the summary is attached', () => {
    render(<OverviewDownloads nationalSummaryUrl={null} pastReports={PAST} />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', {name: 'Explore past reports'}),
    ).toBeInTheDocument();
  });
});
