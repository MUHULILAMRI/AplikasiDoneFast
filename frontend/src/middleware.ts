// ============================================
// DoneFast - Next.js Middleware (Route Protection)
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'donefast-secret-key-change-in-production-2026'
);

// Routes that require authentication
const PROTECTED_ROUTES = ['/dashboard', '/checkout', '/tracking', '/chat'];
const ADMIN_ROUTES = ['/dashboard/admin'];
const JOKI_ROUTES = ['/dashboard/joki'];
const AUTH_ROUTES = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const forceAuthPage = request.nextUrl.searchParams.get('force') === '1';

  // Ambil token dari cookie atau header
  const token =
    request.cookies.get('token')?.value ||
    request.headers.get('authorization')?.replace('Bearer ', '');

  let user: { userId: string; email: string; role: string } | null = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      user = payload as unknown as { userId: string; email: string; role: string };
    } catch {
      // Token tidak valid: hapus cookie dan paksa login jika route butuh auth
      const loginUrl = new URL('/login', request.url);
      if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
        loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      }
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
        return response;
      }
    }
  }

  // Allow explicit access to auth pages for account switch
  if (forceAuthPage && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const response = NextResponse.next();
    response.cookies.delete('token');
    return response;
  }

  // Redirect authenticated users away from auth pages
  if (user && AUTH_ROUTES.some((r) => pathname.startsWith(r))) {
    const redirectUrl =
      user.role === 'ADMIN'
        ? '/dashboard/admin'
        : user.role === 'JOKI'
        ? '/dashboard/joki'
        : '/marketplace';
    return NextResponse.redirect(new URL(redirectUrl, request.url));
  }

  // Protect dashboard routes
  if (PROTECTED_ROUTES.some((r) => pathname.startsWith(r))) {
    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
      return NextResponse.redirect(loginUrl);
    }

    // Admin route protection
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r)) && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Joki route protection
    if (JOKI_ROUTES.some((r) => pathname.startsWith(r)) && user.role !== 'JOKI') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/checkout/:path*',
    '/tracking/:path*',
    '/chat/:path*',
    '/login',
    '/register',
  ],
};
