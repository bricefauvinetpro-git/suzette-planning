"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase } from "@/lib/supabase";

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: authError } = await getSupabase().auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (authError || !data.user) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Fetch role and store in cookie for middleware
    const { data: member } = await getSupabase()
      .from("team_members")
      .select("user_role")
      .eq("auth_user_id", data.user.id)
      .single();

    const role = member?.user_role ?? "employee";
    document.cookie = `suzette_role=${role}; path=/; max-age=86400`;

    router.replace("/planning");
  }

  async function handleForgotPassword() {
    if (!email.trim()) { setError("Entrez votre email pour réinitialiser le mot de passe."); return; }
    setError(null);
    await getSupabase().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/login`,
    });
    setResetSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f4f5f7" }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-3xl font-bold tracking-tight" style={{ color: "#1a1a2e" }}>
            Suzette
          </span>
          <p className="text-sm text-zinc-500 mt-1">Gestion du planning</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          <h1 className="text-base font-semibold text-zinc-900 mb-5">Connexion</h1>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@example.com"
                className={INPUT_CLS}
                autoComplete="email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">Mot de passe</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={INPUT_CLS}
                autoComplete="current-password"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}
            {resetSent && (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                Email de réinitialisation envoyé.
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60 mt-1"
            >
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>

          <button
            type="button"
            onClick={handleForgotPassword}
            className="mt-4 w-full text-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            Mot de passe oublié ?
          </button>
        </div>
      </div>
    </div>
  );
}
