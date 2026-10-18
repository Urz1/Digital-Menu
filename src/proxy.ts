import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Enterprise Route Guard Proxy (OWASP A01: Broken Access Control Mitigation)
 * Intercepts requests for /admin at the server/edge layer before rendering any React components.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect all /admin routes except the public login portal (/admin/login)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const sessionCookie = request.cookies.get('digital_menu_session')?.value;

    if (!sessionCookie || (sessionCookie !== 'owner' && sessionCookie !== 'staff')) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
