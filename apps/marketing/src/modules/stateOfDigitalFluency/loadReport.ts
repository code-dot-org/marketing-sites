import {draftMode} from 'next/headers';
import {notFound} from 'next/navigation';

import {Brand} from '@/config/brand';

import {getReport} from './getReport';

/**
 * The brand and launch gates shared by every report route: 404 unless this
 * is Code.org and the entry exists (published, or a draft on preview).
 */
export async function loadReport(brand: string | undefined) {
  if (brand !== Brand.CODE_DOT_ORG) {
    notFound();
  }

  const report = await getReport();
  if (!report) {
    notFound();
  }

  return {report, isDraft: (await draftMode()).isEnabled};
}
