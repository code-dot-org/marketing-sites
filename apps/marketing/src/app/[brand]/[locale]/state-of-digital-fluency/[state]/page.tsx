import {Metadata} from 'next';
import {notFound} from 'next/navigation';

import {JURISDICTION_BY_SLUG} from '@/modules/stateOfDigitalFluency/constants';
import {loadReport} from '@/modules/stateOfDigitalFluency/loadReport';
import {buildReportMetadata} from '@/modules/stateOfDigitalFluency/metadata';
import {toStateModel} from '@/modules/stateOfDigitalFluency/readReport';
import ReportMain from '@/modules/stateOfDigitalFluency/sections/ReportMain';
import StateSection from '@/modules/stateOfDigitalFluency/sections/state/StateSection';

/**
 * Fresh for 15 minutes, matching the Experience route. Upstream caches can
 * add to this; see the note in [[...paths]]/page.tsx.
 */
// NOTE: IF UPDATING THIS VALUE, PLEASE ALSO UPDATE THE VALUE IN THE `ViewerResponseCloudFrontFunction` in marketing.yml.erb
export const revalidate = 900;

type Props = {params: Promise<{brand: string; locale: string; state: string}>};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({params}: Props): Promise<Metadata> {
  const {locale = 'en-US', state} = await params;
  const jurisdiction = JURISDICTION_BY_SLUG.get(state);
  if (!jurisdiction) {
    return {};
  }
  return buildReportMetadata(
    {kind: 'state', slug: jurisdiction.slug, name: jurisdiction.name},
    locale,
  );
}

/** One state's profile. The segment is the lowercase postal code. */
export default async function StateOfDigitalFluencyStatePage({params}: Props) {
  const {brand, locale, state} = await params;
  const jurisdiction = JURISDICTION_BY_SLUG.get(state);
  if (!jurisdiction) {
    notFound();
  }

  const {report, isDraft} = await loadReport(brand);
  const model = toStateModel(report, jurisdiction.postal);
  if (!model) {
    notFound();
  }

  return (
    <ReportMain warnings={report.warnings} isDraft={isDraft}>
      <StateSection model={model} locale={locale} />
    </ReportMain>
  );
}
