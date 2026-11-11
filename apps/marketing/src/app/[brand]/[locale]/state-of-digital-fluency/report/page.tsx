import {Metadata} from 'next';

import {loadReport} from '@/modules/stateOfDigitalFluency/loadReport';
import {buildReportMetadata} from '@/modules/stateOfDigitalFluency/metadata';
import {toNationalModel} from '@/modules/stateOfDigitalFluency/readReport';
import NationalPrintReport from '@/modules/stateOfDigitalFluency/sections/print/NationalPrintReport';
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
  return buildReportMetadata({kind: 'nationalPrint'}, locale);
}

/** The 2-page printable national report (noindex). */
export default async function StateOfDigitalFluencyNationalPrintPage({
  params,
}: Props) {
  const {brand, locale} = await params;
  const {report, isDraft} = await loadReport(brand);

  return (
    <ReportMain warnings={report.warnings} isDraft={isDraft}>
      <NationalPrintReport
        national={toNationalModel(report)}
        stateCount={report.data.states.length}
        dataAsOf={report.dataAsOf}
        locale={locale}
      />
    </ReportMain>
  );
}
