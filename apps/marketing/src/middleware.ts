import {chainMiddleware} from '@/middleware/chainMiddleware';
import {withBrand} from '@/middleware/withBrand';
import {withLocale} from '@/middleware/withLocale';
import {withRedirects} from '@/middleware/withRedirects';
import {withRobotsTag} from '@/middleware/withRobotsTag';

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes
     * 2. /_next (Next.js internals)
     * 3. /_static (inside /public)
     * 4. all root files inside /public (e.g. /favicon.ico)
     * 5. /robots.txt
     * 7. /favicon.ico
     */
    '/((?!api/|_next/|_static/|_vercel|robots.txt|sitemap.xml|favicon.ico).*)',
  ],
};

// withRobotsTag is outermost so it stamps every response the chain produces,
// including the redirects the inner layers return early.
export default chainMiddleware([
  withRobotsTag,
  withRedirects,
  withLocale,
  withBrand,
]);
