import {splitLocaleFromPathname} from '@/config/locale';

describe('splitLocaleFromPathname', () => {
  it('splits a supported locale off the front of a path', () => {
    expect(splitLocaleFromPathname('/es/districts')).toEqual({
      locale: 'es',
      pathnameWithoutLocale: '/districts',
    });
  });

  it.each(['en-US', 'es-ES', 'pt-BR', 'zh-Hant', 'hi'])(
    'handles the hyphenated and short locale code %s',
    locale => {
      expect(splitLocaleFromPathname(`/${locale}/administrators`)).toEqual({
        locale,
        pathnameWithoutLocale: '/administrators',
      });
    },
  );

  it('keeps nested paths intact', () => {
    expect(
      splitLocaleFromPathname('/ko/engineering/all-the-things'),
    ).toEqual({
      locale: 'ko',
      pathnameWithoutLocale: '/engineering/all-the-things',
    });
  });

  it('treats a locale root as the site root', () => {
    expect(splitLocaleFromPathname('/en-US')).toEqual({
      locale: 'en-US',
      pathnameWithoutLocale: '/',
    });
  });

  it('leaves a path with no locale untouched', () => {
    expect(splitLocaleFromPathname('/districts')).toEqual({
      locale: undefined,
      pathnameWithoutLocale: '/districts',
    });
  });

  it.each(['/administrators', '/es-LA/districts', '/zh-TW/districts', '/xx/districts'])(
    'does not strip %s, whose first segment is not a supported locale',
    pathname => {
      expect(splitLocaleFromPathname(pathname)).toEqual({
        locale: undefined,
        pathnameWithoutLocale: pathname,
      });
    },
  );

  it('leaves the bare root untouched', () => {
    expect(splitLocaleFromPathname('/')).toEqual({
      locale: undefined,
      pathnameWithoutLocale: '/',
    });
  });
});
