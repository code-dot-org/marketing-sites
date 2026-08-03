import {useParams} from 'next/navigation';

import {Brand, getBrandFromString} from '@/config/brand';

import styles from './adoptionMap.module.scss';

export const MAP_POINT_NO_DATA_COLOR = '#FFFFFF';
export const MAP_POINT_STROKE_COLOR = '#000000';
export const MAP_POINT_STROKE_WIDTH = 0.5;

// Hexes are hardcoded (not CSS vars) because they also feed Mapbox GL canvas
// paint expressions, where CSS custom properties don't resolve.
const LEGACY_POINT_COLORS = {hasCs: '#0093A4', noCs: '#8C52BA'};
// CodeAI rebrand: purple primary / blue primary.
const CODEAI_POINT_COLORS = {hasCs: '#4C42CF', noCs: '#0099F3'};

export enum MAP_POINT_TYPES {
  HAS_CS = 'HAS_CS',
  NO_CS = 'NO_CS',
  NO_DATA = 'NO_DATA',
}

/**
 * Brand-aware point colors: Code.org gets the CodeAI palette; CSForAll/HOC
 * keep the legacy teal/purple.
 */
export function useMapPointColors(): Record<MAP_POINT_TYPES, string> {
  const params = useParams<{brand: string}>();
  const isCodeOrg =
    getBrandFromString(params?.brand ?? '') === Brand.CODE_DOT_ORG;
  const colors = isCodeOrg ? CODEAI_POINT_COLORS : LEGACY_POINT_COLORS;

  return {
    [MAP_POINT_TYPES.HAS_CS]: colors.hasCs,
    [MAP_POINT_TYPES.NO_CS]: colors.noCs,
    [MAP_POINT_TYPES.NO_DATA]: MAP_POINT_NO_DATA_COLOR,
  };
}

export interface AdoptionMapPointProps {
  type: MAP_POINT_TYPES;
}

const AdoptionMapPoint: React.FC<AdoptionMapPointProps> = ({
  type = MAP_POINT_TYPES.NO_DATA,
}) => {
  const pointColors = useMapPointColors();

  return (
    <span
      role="presentation"
      className={styles.adoptionMapPoint}
      style={{
        backgroundColor: pointColors[type],
        borderWidth: MAP_POINT_STROKE_WIDTH,
        borderColor: MAP_POINT_STROKE_COLOR,
      }}
    />
  );
};

export default AdoptionMapPoint;
