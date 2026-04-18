import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/auth/callback"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If env vars are missing, block everything except public paths
  if (!supabaseUrl || !supabaseKey) {
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    return isPublic ? NextResponse.next({ request }) : NextResponse.redirect(new URL("/login", request.url));
  }

  let response = NextResponse.next({ request });
  let session = null;

  try {
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    // getSession() reads the JWT from cookies locally — no network call.
    // Preferred over getUser() in proxy to avoid network failures causing silent pass-through.
    const { data } = await supabase.auth.getSession();
    session = data.session;
  } catch {
    // On any error treat as unauthenticated — safer to redirect than to allow through
  }

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  // Unauthenticated → /login
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Authenticated on login page → /planning
  if (session && pathname === "/login") {
    return NextResponse.redirect(new URL("/planning", request.url));
  }

  // Role-based restriction: employees can only access /planning
  if (session) {
    const role = request.cookies.get("suzette_role")?.value;
    const isRestricted = pathname.startsWith("/team") || pathname.startsWith("/configuration");
    if (role === "employee" && isRestricted) {
      return NextResponse.redirect(new URL("/planning", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
