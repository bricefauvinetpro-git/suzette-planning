import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: member } = await supabase
        .from("team_members")
        .select("user_role")
        .eq("auth_user_id", data.user.id)
        .single();

      const role = member?.user_role ?? "employee";
      const response = NextResponse.redirect(new URL("/planning", origin));
      response.cookies.set("suzette_role", role, { path: "/", maxAge: 86400 });
      return response;
    }
  }

  return NextResponse.redirect(new URL("/login?error=1", origin));
}
