import {render} from '@testing-library/react';
import {draftMode} from 'next/headers';
import type {ReactElement} from 'react';

import {Brand} from '@/config/brand';
import fixture from '@/modules/stateOfDigitalFluency/__tests__/fixtures/reportData.json';
import {getReport} from '@/modules/stateOfDigitalFluency/getReport';
import {checkReportShape} from '@/modules/stateOfDigitalFluency/reportShape';

import NationalPrintPage, {generateMetadata, revalidate} from '../report/page';

jest.mock('next/headers', () => ({draftMode: jest.fn()}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/modules/stateOfDigitalFluency/getReport', () => ({
  getReport: jest.fn(),
}));
// MUI X needs browser APIs jsdom lacks; Storybook covers the charts.
jest.mock('@/components/dataDisplay/chart/YearBars', () => () => null);

const shape = checkReportShape(fixture.data);
const report = {
  data: shape.success ? shape.data : (undefined as never),
  dataAsOf: '2026-11-09',
  warnings: [],
};

const params = (brand: string) => Promise.resolve({brand, locale: 'en-US'});

describe('printable national report route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getReport as jest.Mock).mockResolvedValue(report);
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
  });

  it('revalidates every 15 minutes', () => {
    expect(revalidate).toBe(900);
  });

  it('returns notFound on other brands', async () => {
    await expect(
      NationalPrintPage({params: params(Brand.HOUR_OF_AI)}),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('returns notFound until the report is published', async () => {
    (getReport as jest.Mock).mockResolvedValue(null);
    await expect(
      NationalPrintPage({params: params(Brand.CODE_DOT_ORG)}),
    ).rejects.toThrow('NEXT_NOT_FOUND');
  });

  it('is noindex, follow with a self-canonical', async () => {
    const metadata = await generateMetadata({params: params('unused')});
    expect(metadata.robots).toEqual({index: false, follow: true});
    expect(metadata.alternates?.canonical).toBe(
      'https://code.org/en-US/state-of-digital-fluency/report',
    );
  });

  it('renders two letter pages with every policy count', async () => {
    const {container, getAllByRole} = render(
      (await NationalPrintPage({
        params: params(Brand.CODE_DOT_ORG),
      })) as ReactElement,
    );
    const pages = container.querySelectorAll('section[data-print-page]');

    expect(pages).toHaveLength(2);
    pages.forEach(page => {
      expect(page.querySelector('header')).toHaveTextContent('National');
      expect(page.querySelector('header')).toHaveTextContent(
        'Data as of 2026-11-09',
      );
    });
    const policies = getAllByRole('list', {name: 'States with each policy'});
    expect(policies[0].children).toHaveLength(10);
  });
});
