import {render, screen} from '@testing-library/react';
import {draftMode} from 'next/headers';
import type {ReactElement} from 'react';

import {Brand} from '@/config/brand';
import fixture from '@/modules/stateOfDigitalFluency/__tests__/fixtures/reportData.json';
import {getReport} from '@/modules/stateOfDigitalFluency/getReport';
import {checkReportShape} from '@/modules/stateOfDigitalFluency/reportShape';
import OverviewSection from '@/modules/stateOfDigitalFluency/sections/overview/OverviewSection';
import StateSection from '@/modules/stateOfDigitalFluency/sections/state/StateSection';
import type {Report} from '@/modules/stateOfDigitalFluency/types';

import StatePage, {
  generateMetadata as stateMetadata,
  revalidate as stateRevalidate,
} from '../[state]/page';
import OverviewPage, {
  generateMetadata as overviewMetadata,
  revalidate as overviewRevalidate,
} from '../page';

jest.mock('next/headers', () => ({draftMode: jest.fn()}));
jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));
jest.mock('@/modules/stateOfDigitalFluency/getReport', () => ({
  getReport: jest.fn(),
}));
jest.mock(
  '@/modules/stateOfDigitalFluency/sections/overview/OverviewSection',
  () => jest.fn(() => null),
);
jest.mock('@/modules/stateOfDigitalFluency/sections/state/StateSection', () =>
  jest.fn(() => null),
);

const shape = checkReportShape(fixture.data);
const report: Report = {
  data: shape.success ? shape.data : (undefined as never),
  dataAsOf: '2026-11-09',
  warnings: ['Synthetic warning'],
};

const params = (brand: string, extra: object = {}) =>
  Promise.resolve({brand, locale: 'en-US', state: '', ...extra});

describe('State of Digital Fluency routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getReport as jest.Mock).mockResolvedValue(report);
    (draftMode as jest.Mock).mockResolvedValue({isEnabled: false});
  });

  it('revalidates every 15 minutes, matching the Experience route', () => {
    expect([overviewRevalidate, stateRevalidate]).toEqual([900, 900]);
  });

  it.each([Brand.CS_FOR_ALL, Brand.HOUR_OF_AI, Brand.HOUR_OF_CODE])(
    'returns notFound on %s',
    async brand => {
      await expect(OverviewPage({params: params(brand)})).rejects.toThrow(
        'NEXT_NOT_FOUND',
      );
      expect(getReport).not.toHaveBeenCalled();
    },
  );

  it('returns notFound until the report is published', async () => {
    (getReport as jest.Mock).mockResolvedValue(null);

    for (const page of [
      () => OverviewPage({params: params(Brand.CODE_DOT_ORG)}),
      () => StatePage({params: params(Brand.CODE_DOT_ORG, {state: 'al'})}),
    ]) {
      await expect(page()).rejects.toThrow('NEXT_NOT_FOUND');
    }
  });

  it.each(['zz', 'AL', 'methodology', 'rankings'])(
    'returns notFound for the state segment %s',
    async state => {
      await expect(
        StatePage({params: params(Brand.CODE_DOT_ORG, {state})}),
      ).rejects.toThrow('NEXT_NOT_FOUND');
    },
  );

  it('renders each section with its view model', async () => {
    render(
      (await OverviewPage({
        params: params(Brand.CODE_DOT_ORG),
      })) as ReactElement,
    );
    render(
      (await StatePage({
        params: params(Brand.CODE_DOT_ORG, {state: 'al'}),
      })) as ReactElement,
    );

    expect(
      (OverviewSection as jest.Mock).mock.calls[0][0].model.regions,
    ).toHaveLength(51);
    expect(
      (OverviewSection as jest.Mock).mock.calls[0][0].model.rankings.score,
    ).toHaveLength(51);
    expect((StateSection as jest.Mock).mock.calls[0][0].model.postal).toBe(
      'AL',
    );
  });

  it('shows draft warnings only in draft mode', async () => {
    render(
      (await OverviewPage({
        params: params(Brand.CODE_DOT_ORG),
      })) as ReactElement,
    );
    expect(screen.queryByTestId('sodf-draft-warnings')).toBeNull();

    (draftMode as jest.Mock).mockResolvedValue({isEnabled: true});
    render(
      (await OverviewPage({
        params: params(Brand.CODE_DOT_ORG),
      })) as ReactElement,
    );
    expect(screen.getByTestId('sodf-draft-warnings')).toHaveTextContent(
      'Synthetic warning',
    );
  });

  it.each([
    [
      overviewMetadata,
      {},
      'The State of Digital Fluency',
      '/es-MX/state-of-digital-fluency',
    ],
    [
      stateMetadata,
      {state: 'al'},
      'Alabama | The State of Digital Fluency',
      '/es-MX/state-of-digital-fluency/al',
    ],
  ])(
    'builds metadata with a self-canonical (%#)',
    async (build, extra, title, path) => {
      const metadata = await build({
        params: Promise.resolve({
          brand: 'unused',
          locale: 'es-MX',
          state: '',
          ...extra,
        }),
      });

      expect(metadata.title).toBe(title);
      expect(metadata.description).toBeTruthy();
      expect(metadata.alternates?.canonical).toBe(`https://code.org${path}`);
      expect(metadata.robots).toBeUndefined();
    },
  );
});
