import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'bb_user';

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

  // allow login and signup routes
  if (pathname === '/login' || pathname === '/signup') {
    // already authed -> go home
    const userCookie = req.cookies.get(COOKIE_NAME)?.value;
    if (userCookie) {
      try {
        JSON.parse(userCookie);
        const url = req.nextUrl.clone();
        url.pathname = '/';
        url.search = '';
        return NextResponse.redirect(url);
      } catch {
        // invalid cookie, allow access
      }
    }
    return NextResponse.next();
  }

  // Everything else requires auth
  const userCookie = req.cookies.get(COOKIE_NAME)?.value;
  let authed = false;
  if (userCookie) {
    try {
      JSON.parse(userCookie);
      authed = true;
    } catch {
      // invalid cookie
    }
  }

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
