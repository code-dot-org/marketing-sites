/**
 * In production, public assets are copied in the copy:static-assets script
 * to the .next/static/public directory. In development, they are served
 * directly from the /public directory which is simply `/` in the dev server.
 * @returns The public path for static assets based on the environment.
 */
export function getAssetPublicPath(): string {
  return process.env.NODE_ENV === 'production' ? '/_next/static/public' : '';
}
