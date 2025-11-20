import type {NextConfig} from 'next';

import {STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES} from '@/cache/constants';
import {SUPPORTED_LOCALE_CODES} from '@/config/locale';

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['@opentelemetry/auto-instrumentations-node', 'pino'],
  cacheHandler:
    process.env.NODE_ENV === 'production'
      ? require.resolve('./cache-handler.mjs')
      : undefined,
  transpilePackages: [
    '@contentful/experiences-sdk-react',
    '@contentful/experiences-components-react',
    '@contentful/experiences-core',
    'lodash-es',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'contentful-images.code.org',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  headers: async () => {
    return [
      ...SUPPORTED_LOCALE_CODES.map(localeCode => ({
        // Apply caching headers to locale-specific paths
        source: `/${localeCode}`,
        headers: [
          {
            key: 'Cache-Control',
            value: STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES,
          },
        ],
      })),
      {
        // Cache localized paths for fifteen minutes using stale-while-revalidate
        source: '/:brand/:locale/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            value: STALE_WHILE_REVALIDATE_FIFTEEN_MINUTES,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
