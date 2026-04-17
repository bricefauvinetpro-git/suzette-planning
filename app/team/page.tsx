"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import type { TeamMember } from "@/types/index";

type FormState = {
  full_name: string;
  role: string;
  contract_hours: number;
  color: string;
};

const DEFAULT_FORM: FormState = {
  full_name: "",
  role: "",
  contract_hours: 35,
  color: "#6366f1",
};

export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  async function loadMembers() {
    setLoading(true);
    const { data } = await getSupabase()
      .from("team_members")
      .select("*")
      .eq("active", true)
      .order("full_name");
    setMembers(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadMembers();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await getSupabase()
      .from("team_members")
      .insert({ ...form, avatar_url: null, active: true });
    setSaving(false);
    setShowModal(false);
    setForm(DEFAULT_FORM);
    loadMembers();
  }

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cet employé du planning ?")) return;
    await getSupabase()
      .from("team_members")
      .update({ active: false })
      .eq("id", id);
    loadMembers();
  }

  function initials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <main className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <div>
          <Link
            href="/planning"
            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors mb-1 block"
          >
            ← Retour au planning
          </Link>
          <h1 className="text-xl font-bold text-zinc-900">Équipe</h1>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          + Ajouter un collaborateur
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              {["Nom", "Rôle", "Heures contrat", "Couleur", "Actions"].map(
                (col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider"
                  >
                    {col}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-14 text-center text-zinc-400 text-sm"
                >
                  Chargement…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-14 text-center text-zinc-400 text-sm"
                >
                  Aucun employé actif. Ajoutez votre premier collaborateur.
                </td>
              </tr>
            ) : (
              members.map((m, i) => (
                <tr
                  key={m.id}
                  className={`border-b border-zinc-100 ${
                    i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                        style={{ backgroundColor: m.color }}
                      >
                        {initials(m.full_name)}
                      </span>
                      <span className="font-medium text-zinc-900">
                        {m.full_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600">{m.role}</td>
                  <td className="px-4 py-3 text-zinc-600">
                    {m.contract_hours}h / sem.
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-5 h-5 rounded-full border border-zinc-200 shrink-0"
                        style={{ backgroundColor: m.color }}
                      />
                      <span className="text-xs text-zinc-400 font-mono">
                        {m.color}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-zinc-900 mb-5">
              Ajouter un collaborateur
            </h2>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <Field label="Prénom & Nom">
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, full_name: e.target.value }))
                  }
                  placeholder="Marie Dupont"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
              <Field label="Rôle">
                <input
                  type="text"
                  required
                  value={form.role}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, role: e.target.value }))
                  }
                  placeholder="Serveuse, Cuisinier…"
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
              <Field label="Heures contractuelles / semaine">
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={form.contract_hours}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      contract_hours: Number(e.target.value),
                    }))
                  }
                  className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
              </Field>
              <Field label="Couleur d'identification">
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, color: e.target.value }))
                    }
                    className="w-10 h-10 rounded-lg border border-zinc-200 cursor-pointer p-0.5"
                  />
                  <span className="text-sm text-zinc-500 font-mono">
                    {form.color}
                  </span>
                  <span
                    className="w-8 h-8 rounded-full border border-zinc-200"
                    style={{ backgroundColor: form.color }}
                  />
                </div>
              </Field>

              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                >
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}
