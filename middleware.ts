import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

function readSupabaseSession(request: NextRequest): { expires_at: number } | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  console.log("[middleware] NEXT_PUBLIC_SUPABASE_URL =", supabaseUrl ?? "(undefined)");

  if (!supabaseUrl) return null;

  let projectRef: string;
  try {
    projectRef = new URL(supabaseUrl).hostname.split(".")[0];
  } catch {
    console.log("[middleware] ERROR: could not parse supabaseUrl");
    return null;
  }

  const cookieName = `sb-${projectRef}-auth-token`;
  console.log("[middleware] looking for cookie:", cookieName);

  const allCookies = request.cookies.getAll();
  console.log(
    "[middleware] all cookies present:",
    allCookies.length === 0
      ? "(none)"
      : allCookies.map((c) => `${c.name}=${c.value.slice(0, 20)}…`).join(" | ")
  );

  const raw =
    request.cookies.get(`${cookieName}.0`)?.value ??
    request.cookies.get(cookieName)?.value;

  if (!raw) {
    console.log("[middleware] cookie NOT found → no session");
    return null;
  }

  console.log("[middleware] cookie found, raw prefix:", raw.slice(0, 30));

  try {
    let json = raw;
    if (raw.startsWith("base64-")) {
      json = Buffer.from(raw.slice(7), "base64url").toString("utf-8");
      console.log("[middleware] decoded base64url, json prefix:", json.slice(0, 60));
    } else {
      console.log("[middleware] plain JSON, prefix:", json.slice(0, 60));
    }
    const parsed = JSON.parse(json) as { expires_at?: number };
    const expiresAt = parsed?.expires_at ?? 0;
    const now = Math.floor(Date.now() / 1000);
    console.log(
      `[middleware] expires_at=${expiresAt} now=${now} valid=${expiresAt > now}`
    );
    return { expires_at: expiresAt };
  } catch (err) {
    console.log("[middleware] ERROR parsing cookie:", err);
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  console.log(`[middleware] ${request.method} ${pathname} — isPublic=${isPublic}`);

  const session = readSupabaseSession(request);
  const isAuthenticated =
    session !== null && session.expires_at * 1000 > Date.now();

  console.log(`[middleware] isAuthenticated=${isAuthenticated} → action=${
    !isAuthenticated && !isPublic ? "redirect /login" :
    isAuthenticated && pathname === "/login" ? "redirect /planning" :
    "pass"
  }`);

  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthenticated && pathname === "/login") {
    return NextResponse.redirect(new URL("/planning", request.url));
  }

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
