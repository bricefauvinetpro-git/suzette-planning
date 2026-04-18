import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, employeeId } = await request.json();

  if (!email || !employeeId) {
    return NextResponse.json({ error: "email et employeeId requis" }, { status: 400 });
  }

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "Service role key manquant" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  await supabase
    .from("team_members")
    .update({
      auth_user_id: data.user.id,
      invitation_sent_at: new Date().toISOString(),
    })
    .eq("id", employeeId);

  return NextResponse.json({ success: true });
}
