import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

/**
 * Reads the Supabase session cookie directly without using createServerClient.
 * The docs recommend "optimistic checks" (cookie read only) in proxy — no async
 * client initialization, no network calls, no lock contention.
 *
 * Cookie name follows the @supabase/supabase-js convention:
 *   sb-{first-hostname-segment}-auth-token   (or chunked as .0, .1, …)
 * Value is base64url-encoded JSON or plain JSON containing { expires_at: number }.
 */
function readSupabaseSession(request: NextRequest): { expires_at: number } | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return null;

  let projectRef: string;
  try {
    projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    return null;
  }

  const cookieName = `sb-${projectRef}-auth-token`;
  // Token may be split into chunks (.0, .1, …); first chunk carries expires_at
  const raw =
    request.cookies.get(`${cookieName}.0`)?.value ??
    request.cookies.get(cookieName)?.value;

  if (!raw) return null;

  try {
    let json = raw;
    if (raw.startsWith("base64-")) {
      json = Buffer.from(raw.slice(7), "base64url").toString("utf-8");
    }
    return JSON.parse(json) as { expires_at: number };
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  const session = readSupabaseSession(request);
  const isAuthenticated = session !== null && session.expires_at * 1000 > Date.now();

  // Unauthenticated on a protected route → /login
  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated landing on /login → /planning
  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/planning", request.url));
  }

  // Role-based restriction: employees cannot access /team or /configuration
  if (isAuthenticated) {
    const role = request.cookies.get("suzette_role")?.value;
    const isRestricted =
      pathname.startsWith("/team") || pathname.startsWith("/configuration");
    if (role === "employee" && isRestricted) {
      return NextResponse.redirect(new URL("/planning", request.url));
    }
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
