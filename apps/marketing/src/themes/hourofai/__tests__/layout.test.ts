import {hourOfAiBreakpoints} from '@/contentful/registration/hourofai/breakpoints';
import HourOfAiTheme from '@/themes/hourofai';

type Rules = Record<string, Record<string, unknown>>;
const sp = (n: number) => HourOfAiTheme.spacing(n);

const slot = (component: string, name: string): Rules => {
  const overrides = HourOfAiTheme.components?.[
    component as keyof typeof HourOfAiTheme.components
  ] as {styleOverrides?: Record<string, unknown>} | undefined;
  const value = overrides?.styleOverrides?.[name];
  return (
    typeof value === 'function' ? value({theme: HourOfAiTheme}) : value
  ) as Rules;
};

describe('Hour of AI layout', () => {
  it('uses the Code.org Studio breakpoints', () => {
    expect(hourOfAiBreakpoints.map(({id, query}) => [id, query])).toEqual([
      ['desktop', '*'],
      ['tablet', '<900px'],
      ['mobile', '<600px'],
    ]);
  });

  it('caps Sections at 1280px with 2rem gutters (1rem on mobile)', () => {
    const root = slot('MuiContainer', 'root');
    expect(root['&.MuiContainer-root']).toMatchObject({
      maxWidth: '1280px',
      paddingLeft: '2rem',
      paddingRight: '2rem',
      [HourOfAiTheme.breakpoints.down('sm')]: {
        paddingLeft: '1rem',
        paddingRight: '1rem',
      },
    });
  });

  it('applies the Section spacing sizes', () => {
    const root = slot('MuiContainer', 'root');
    expect(root['&.MuiContainer-root.container--spacing-l']).toEqual({
      paddingTop: sp(8),
      paddingBottom: sp(8),
    });
    expect(root['&.MuiContainer-root.container--spacing-m']).toEqual({
      paddingTop: sp(5),
      paddingBottom: sp(5),
    });
  });

  it('spaces text elements below with gutterBottom', () => {
    const gutter = slot('MuiTypography', 'gutterBottom');
    expect(gutter['&.MuiTypography-h1']).toEqual({marginBottom: sp(3)});
    expect(gutter['&.MuiTypography-body2']).toEqual({marginBottom: sp(2)});
  });

  it('applies Divider margin sizes, sideways when vertical', () => {
    const root = slot('MuiDivider', 'root');
    expect(root['&.MuiDivider-root.divider--margin-m']).toEqual({
      marginTop: sp(4),
      marginBottom: sp(4),
    });
    expect(
      root['&.MuiDivider-root.divider--vertical.divider--margin-m'],
    ).toEqual({
      marginTop: 0,
      marginBottom: 0,
      marginLeft: sp(4),
      marginRight: sp(4),
    });
  });
});
