"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase";

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error: authError } = await getSupabase().auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (authError) {
      setError("Impossible d'envoyer le lien. Vérifiez l'adresse email.");
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f4f5f7" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-3xl font-bold tracking-tight" style={{ color: "#1a1a2e" }}>
            Suzette
          </span>
          <p className="text-sm text-zinc-500 mt-1">Gestion du planning</p>
        </div>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6">
          {sent ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">✉️</div>
              <h2 className="text-base font-semibold text-zinc-900 mb-2">Vérifiez votre email</h2>
              <p className="text-sm text-zinc-500">
                Un lien de connexion a été envoyé à <strong>{email}</strong>.
                Cliquez sur le lien pour accéder à votre espace.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="mt-5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
              >
                Utiliser une autre adresse
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-base font-semibold text-zinc-900 mb-1">Connexion</h1>
              <p className="text-sm text-zinc-500 mb-5">
                Entrez votre email pour recevoir un lien de connexion.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    autoFocus
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {loading ? "Envoi…" : "Recevoir un lien de connexion"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
