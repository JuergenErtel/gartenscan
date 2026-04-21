import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from './types';

/**
 * Routes, die eine Anonymous-Session brauchen.
 * Landing/Marketing-Seiten signen den User NICHT automatisch ein.
 */
const APP_PREFIXES = ['/app', '/scan', '/history', '/coach', '/onboarding', '/garden', '/premium', '/api/scans'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const needsSession = APP_PREFIXES.some((p) => pathname.startsWith(p));

  if (!user && needsSession) {
    await supabase.auth.signInAnonymously();
  }

  response.headers.set('x-pathname', request.nextUrl.pathname);

  return response;
}
