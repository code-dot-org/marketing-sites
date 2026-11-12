import ExperiencePage, {
  generateMetadata as experienceMetadata,
} from '@/app/[brand]/[locale]/[[...paths]]/page';
import {Brand} from '@/config/brand';

import MethodologyPage, {
  generateMetadata,
  revalidate,
} from '../methodology/page';

jest.mock('@/app/[brand]/[locale]/[[...paths]]/page', () => ({
  __esModule: true,
  default: jest.fn(async () => 'experience'),
  generateMetadata: jest.fn(async () => ({title: 'Methodology'})),
}));

const props = () => ({
  params: Promise.resolve({brand: Brand.CODE_DOT_ORG, locale: 'fr-FR'}),
  searchParams: Promise.resolve({}),
});

describe('methodology route', () => {
  it('revalidates every 15 minutes', () => {
    expect(revalidate).toBe(900);
  });

  it('serves the Experience at the fixed slug', async () => {
    await expect(MethodologyPage(props())).resolves.toBe('experience');

    const {params} = (ExperiencePage as jest.Mock).mock.calls[0][0];
    await expect(params).resolves.toEqual({
      brand: Brand.CODE_DOT_ORG,
      locale: 'fr-FR',
      paths: ['state-of-digital-fluency', 'methodology'],
    });
  });

  it('uses the Experience metadata for the same slug', async () => {
    await expect(generateMetadata(props())).resolves.toEqual({
      title: 'Methodology',
    });
    const {params} = (experienceMetadata as jest.Mock).mock.calls[0][0];
    await expect(params).resolves.toMatchObject({
      paths: ['state-of-digital-fluency', 'methodology'],
    });
  });
});
