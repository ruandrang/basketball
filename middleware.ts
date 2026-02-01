import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'bb_auth';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // allow next internals / static
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/robots.txt') ||
    pathname.startsWith('/sitemap')
  ) {
    return NextResponse.next();
  }

  // allow login route
  if (pathname === '/login') {
    // already authed -> go home
    if (req.cookies.get(COOKIE_NAME)?.value === '1') {
      const url = req.nextUrl.clone();
      url.pathname = '/';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Everything else requires auth
  const authed = req.cookies.get(COOKIE_NAME)?.value === '1';
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api).*)'],
};
