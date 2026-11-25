import Box from '@mui/material/Box';
import Image from 'next/image';

import FileDownloader from '@/components/contentful/fileDownloader';
import {
  Button,
  Divider,
  Heading,
  Paragraph,
  Section,
} from '@/components/dataDisplay/brandComponents';
import type {FileDownloadEntry} from '@/types/contentful/entries/FileDownload';
import reportBookImage from '@public/images/sodf-2026-report-book.webp';

import {NATIONAL_SUMMARY_LABEL} from '../../constants';
import DownloadTracker from '../DownloadTracker';

/**
 * The overview's closing downloads, laid out like the Impact Report page's:
 * this year's cover beside its summary, then a dropdown of past reports.
 * Hidden when there's neither.
 */
export default function OverviewDownloads({
  nationalSummaryUrl,
  pastReports,
}: {
  nationalSummaryUrl: string | null;
  pastReports: FileDownloadEntry[];
}) {
  if (!nationalSummaryUrl && pastReports.length === 0) {
    return null;
  }

  return (
    <Section background="purpleLight" padding="l">
      <Box
        component="section"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
        }}
      >
        {nationalSummaryUrl && (
          <Box
            sx={{
              display: {xs: 'none', md: 'block'},
              flexShrink: 0,
              width: '370px',
            }}
          >
            <Image
              src={reportBookImage}
              alt="Cover of the 2026 State of Digital Fluency report"
              sizes="370px"
              style={{width: '100%', height: 'auto'}}
            />
          </Box>
        )}
        <Box sx={{maxWidth: '670px'}}>
          <Heading visualAppearance="heading-xl" removeMarginBottom={false}>
            Download the report
          </Heading>
          {nationalSummaryUrl && (
            <>
              <Paragraph removeMarginBottom={false}>
                See the latest national summary of the State of Digital Fluency.
              </Paragraph>
              <DownloadTracker href={nationalSummaryUrl}>
                <Button
                  color="purple"
                  type="primary"
                  href={nationalSummaryUrl}
                  text={NATIONAL_SUMMARY_LABEL}
                  isLinkExternal
                  ariaLabel={`${NATIONAL_SUMMARY_LABEL} (opens in a new tab)`}
                  iconRightName="download"
                />
              </DownloadTracker>
            </>
          )}
          {pastReports.length > 0 && (
            <Box sx={{mt: nationalSummaryUrl ? 3 : 0}}>
              {nationalSummaryUrl && <Divider margin="s" />}
              {/* 550px sets this to two lines, breaking after "years." */}
              <Paragraph
                visualAppearance="text-sm"
                removeMarginBottom={false}
                sx={{maxWidth: '550px'}}
              >
                Explore past reports for an in-depth look at digital sciences
                education over the years. Select the year below and the report
                will automatically download.
              </Paragraph>
              {/* Wide enough for each report name on one line. */}
              <Box sx={{width: '360px', maxWidth: '100%'}}>
                <FileDownloader
                  files={pastReports}
                  placeholder="Explore past reports"
                  color="white"
                  variant="light"
                />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Section>
  );
}
