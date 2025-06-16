import {NextRequest, NextFetchEvent, NextResponse} from 'next/server';

import {SUPPORTED_LOCALE_CODES, SUPPORTED_LOCALES_SET} from '@/config/locale';
import {getContentfulSlug} from '@/contentful/slug/getContentfulSlug';

import {withLocale} from '../withLocale';

jest.mock('@/contentful/slug/getContentfulSlug', () => ({
  getContentfulSlug: jest.fn(),
}));

describe('withLocale middleware', () => {
  const cookieMock = {
    set: jest.fn(),
  };
  const next = jest.fn().mockReturnValue({
    cookies: cookieMock,
  });
  const mockEvent = {} as NextFetchEvent;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not redirect if the path contains a supported locale', async () => {
    const request = {
      nextUrl: {pathname: '/zh-CN/home'},
      cookies: {get: jest.fn()},
      headers: {get: jest.fn()},
      response: {cookies: {set: jest.fn()}},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES_SET.add('zh-CN');
    await withLocale(next)(request, mockEvent);

    expect(next).toHaveBeenCalledWith(request, mockEvent);
    expect(getContentfulSlug).not.toHaveBeenCalled();
    expect(cookieMock.set).toHaveBeenCalledWith('language_', 'zh-CN', {
      domain: '.code.org',
      path: '/',
    });
  });

  it('should redirect to the locale path if no locale is present in the path for cookies', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'zh-CN'}))},
      headers: {get: jest.fn()},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES_SET.add('zh-CN');
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-CN/home',
    );
  });

  it('should redirect to the locale path if no locale is present in the path but has accept-language haeder', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn()},
      headers: {
        get: jest.fn().mockReturnValue('zh-CN;q=0.9'),
      },
    } as unknown as NextRequest;

    SUPPORTED_LOCALE_CODES.push('zh-CN');
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-CN/home',
    );
  });

  it('should default to "en-US" if the cookie and accept-language locale is not supported', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {pathname: '/home', url: 'https://test.code.org/home'},
      cookies: {get: jest.fn(() => ({value: 'unsupported-locale'}))},
      headers: {
        get: jest.fn().mockReturnValue('unsupported-locale, en-US;q=0.9'),
      },
    } as unknown as NextRequest;

    SUPPORTED_LOCALE_CODES.push('en-US');
    (getContentfulSlug as jest.Mock).mockReturnValue('home');

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/en-US/home',
    );
  });

  it('should redirect to home page if the path is empty', async () => {
    const request = {
      nextUrl: {pathname: '/'},
      cookies: {get: jest.fn()},
      headers: {
        get: jest.fn().mockReturnValue('zh-CN, en-US;q=0.9'),
      },
      url: 'https://code.marketing-sites.local',
    } as unknown as NextRequest;

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://code.marketing-sites.local/zh-CN/home',
    );
  });

  it('should handle paths with multiple segments correctly', async () => {
    const request = {
      url: 'https://test.code.org',
      nextUrl: {
        pathname: '/engineering/all-the-things',
        url: 'https://test.code.org/engineering/all-the-things',
      },
      cookies: {get: jest.fn(() => ({value: 'zh-CN'}))},
      headers: {get: jest.fn()},
    } as unknown as NextRequest;

    SUPPORTED_LOCALES_SET.add('zh-CN');
    (getContentfulSlug as jest.Mock).mockReturnValue(
      'engineering/all-the-things',
    );

    const response = await withLocale(next)(request, mockEvent);

    expect(response).toBeInstanceOf(NextResponse);
    expect(response?.headers.get('location')).toBe(
      'https://test.code.org/zh-CN/engineering/all-the-things',
    );
  });
});
