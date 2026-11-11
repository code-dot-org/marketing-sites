import {Metadata} from 'next';

import {loadReport} from '@/modules/stateOfDigitalFluency/loadReport';
import {buildReportMetadata} from '@/modules/stateOfDigitalFluency/metadata';
import {toOverviewModel} from '@/modules/stateOfDigitalFluency/readReport';
import OverviewSection from '@/modules/stateOfDigitalFluency/sections/overview/OverviewSection';
import ReportMain from '@/modules/stateOfDigitalFluency/sections/ReportMain';

/**
 * Fresh for 15 minutes, matching the Experience route. Upstream caches can
 * add to this; see the note in [[...paths]]/page.tsx.
 */
// NOTE: IF UPDATING THIS VALUE, PLEASE ALSO UPDATE THE VALUE IN THE `ViewerResponseCloudFrontFunction` in marketing.yml.erb
export const revalidate = 900;

type Props = {params: Promise<{brand: string; locale: string}>};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale = 'en-US'} = await params;
  return buildReportMetadata({kind: 'overview'}, locale);
}

/** The State of Digital Fluency overview, on code.org only. */
export default async function StateOfDigitalFluencyPage({params}: Props) {
  const {brand, locale} = await params;
  const {report, isDraft} = await loadReport(brand);

  return (
    <ReportMain warnings={report.warnings} isDraft={isDraft}>
      <OverviewSection model={toOverviewModel(report)} locale={locale} />
    </ReportMain>
  );
}
