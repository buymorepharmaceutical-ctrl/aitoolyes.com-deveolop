import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Basic in-memory rate limiting map for standalone/local deployments.
// In a serverless Edge environment (e.g., Vercel), this will reset frequently,
// and a Redis solution (like @upstash/ratelimit) should be used for production.
const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

const WINDOW_SIZE_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 500; // 500 requests per minute

export default function proxy(request: NextRequest) {
  // Extract the client IP
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
  const { pathname } = request.nextUrl;
  
  const now = Date.now();
  const windowData = rateLimitMap.get(ip);

  // 1. Rate Limiting Logic
  if (!windowData) {
    rateLimitMap.set(ip, { count: 1, lastReset: now });
  } else {
    if (now - windowData.lastReset > WINDOW_SIZE_MS) {
      rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else {
      if (windowData.count >= MAX_REQUESTS) {
        return new NextResponse(
          JSON.stringify({ 
            error: "Too Many Requests", 
            message: "Security Alert: You have exceeded the maximum request limit (500 req/min). Please try again later."
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((WINDOW_SIZE_MS - (now - windowData.lastReset)) / 1000).toString()
            }
          }
        );
      }
      windowData.count += 1;
      rateLimitMap.set(ip, windowData);
    }
  }

  // 2. Setup Security Headers & Auth Protection
  const response = NextResponse.next();
  
  // Security Headers
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');

  // Protect /admin routes
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login') && !pathname.startsWith('/api/admin/login')) {
    const adminToken = request.cookies.get('admin_session');
    
    // If no valid token, redirect to login
    if (!adminToken || adminToken.value !== 'authenticated') {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

// Apply rate limiting & auth to all API routes and standard page routes, except static assets
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
