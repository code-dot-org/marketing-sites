import {Metadata} from 'next';

import ExperiencePage, {
  generateMetadata as generateExperienceMetadata,
} from '@/app/[brand]/[locale]/[[...paths]]/page';
import {Brand} from '@/config/brand';

/**
 * Fresh for 15 minutes, matching the Experience route. Upstream caches can
 * add to this; see the note in [[...paths]]/page.tsx.
 */
// NOTE: IF UPDATING THIS VALUE, PLEASE ALSO UPDATE THE VALUE IN THE `ViewerResponseCloudFrontFunction` in marketing.yml.erb
export const revalidate = 900;

// The sibling [state] segment would otherwise catch "methodology", so this
// static route serves the Studio Experience at the same slug.
const PATHS = ['state-of-digital-fluency', 'methodology'];

type Props = {
  params: Promise<{brand: string; locale: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
};

const experienceParams = async (params: Props['params']) => {
  const {brand, locale} = await params;
  // The Experience route types `paths` as a string but reads it as segments.
  return {brand: brand as Brand, locale, paths: PATHS as unknown as string};
};

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  return generateExperienceMetadata({
    params: experienceParams(params),
    searchParams,
  });
}

/** The report's methodology: a Studio Experience page. */
export default async function StateOfDigitalFluencyMethodologyPage({
  params,
  searchParams,
}: Props) {
  return ExperiencePage({params: experienceParams(params), searchParams});
}
