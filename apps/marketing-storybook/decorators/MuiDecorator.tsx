import cdoTheme from '@/themes/code.org';
import csforallTheme from '@/themes/csforall';
import {CssBaseline, ThemeProvider} from '@mui/material';
import {
  withThemeByDataAttribute,
  withThemeFromJSXProvider,
} from '@storybook/addon-themes';

// Both decorators share the addon-themes `theme` global since the theme names
// match. The data-brand attribute activates the [data-brand='Code.org'] radius
// tokens (radii.scss), mirroring the app's <html data-brand={brand}>.
export default [
  withThemeFromJSXProvider({
    themes: {
      'code.org': cdoTheme,
      csforall: csforallTheme,
    },
    defaultTheme: 'code.org',
    Provider: ThemeProvider,
    GlobalStyles: CssBaseline,
  }),
  withThemeByDataAttribute({
    themes: {
      'code.org': 'Code.org',
      csforall: 'CSForAll',
    },
    defaultTheme: 'code.org',
    attributeName: 'data-brand',
    parentSelector: 'html',
  }),
];
