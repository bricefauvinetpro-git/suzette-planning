import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/index";

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error("Supabase env vars are missing");
    }
    _client = createClient<Database>(url, key);
  }
  return _client;
}
