import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Cek apakah ada cookie 'admin_token'
  const token = request.cookies.get('admin_token')?.value;

  // Kalau user mencoba akses halaman /admin/* TAPI tidak punya token
  if (request.nextUrl.pathname.startsWith('/admin') && !token) {
    // Tendang balik ke halaman login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Kalau user mencoba akses halaman /login TAPI dia udah punya token (udah login)
  if (request.nextUrl.pathname === '/login' && token) {
    // Tendang ke dashboard, ngapain login lagi
    return NextResponse.redirect(new URL('/admin/slidershero', request.url));
  }

  return NextResponse.next();
}

// Tentukan rute mana saja yang mau diawasi oleh middleware ini
export const config = {
  matcher: ['/admin/:path*', '/login'],
};