import {render, screen} from '@testing-library/react';
import {useParams} from 'next/navigation';

import AdoptionMapPoint, {
  AdoptionMapPointProps,
  MAP_POINT_TYPES,
  MAP_POINT_NO_DATA_COLOR,
  MAP_POINT_STROKE_COLOR,
  MAP_POINT_STROKE_WIDTH,
} from '../AdoptionMapPoint';

jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}));

describe('AdoptionMapPoint', () => {
  const renderComponent = (props: AdoptionMapPointProps) =>
    render(<AdoptionMapPoint {...props} />);

  const brandCases = [
    {
      brand: 'Code.org',
      hasCsColor: '#4C42CF',
      noCsColor: '#0099F3',
    },
    {
      brand: 'CSForAll',
      hasCsColor: '#0093A4',
      noCsColor: '#8C52BA',
    },
  ];

  brandCases.forEach(({brand, hasCsColor, noCsColor}) => {
    describe(`on the ${brand} brand`, () => {
      beforeEach(() => {
        (useParams as jest.Mock).mockReturnValue({brand});
      });

      [
        {type: MAP_POINT_TYPES.HAS_CS, expectedColor: hasCsColor},
        {type: MAP_POINT_TYPES.NO_CS, expectedColor: noCsColor},
        {type: MAP_POINT_TYPES.NO_DATA, expectedColor: MAP_POINT_NO_DATA_COLOR},
      ].forEach(({type, expectedColor}) => {
        it(`applies correct style for ${type} type`, () => {
          renderComponent({type});

          const point = screen.getByRole('presentation');

          expect(point).toHaveStyle({
            backgroundColor: expectedColor,
            borderWidth: MAP_POINT_STROKE_WIDTH,
            borderColor: MAP_POINT_STROKE_COLOR,
          });
        });
      });
    });
  });
});
