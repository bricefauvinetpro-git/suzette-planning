"use client";

import { useState, useEffect } from "react";
import { getSupabase } from "@/lib/supabase";
import type { Establishment } from "@/types/index";

type Mode = "add" | "edit";

type ModalState = {
  mode: Mode;
  data?: Establishment;
} | null;

type EstForm = {
  nom: string;
  adresse: string;
};

const EMPTY_FORM: EstForm = { nom: "", adresse: "" };

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white";

export default function EtablissementsPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [form, setForm] = useState<EstForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    const { data, error } = await getSupabase()
      .from("establishments")
      .select("identifiant, nom, adresse")
      .order("nom");
    if (error) {
      console.error("Erreur chargement établissements:", error);
      setLoadError(error.message);
    }
    setEstablishments(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setSaveError(null);
    setForm(EMPTY_FORM);
    setModal({ mode: "add" });
  }

  function openEdit(est: Establishment) {
    setSaveError(null);
    setForm({
      nom: est.nom,
      adresse: est.adresse ?? "",
    });
    setModal({ mode: "edit", data: est });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nom.trim()) { setSaveError("Le nom est obligatoire."); return; }
    setSaveError(null);
    setSaving(true);

    const payload = {
      nom: form.nom.trim(),
      adresse: form.adresse.trim() || null,
    };

    let error;
    if (modal?.mode === "add") {
      ({ error } = await getSupabase().from("establishments").insert(payload));
    } else {
      ({ error } = await getSupabase()
        .from("establishments")
        .update(payload)
        .eq("identifiant", modal!.data!.identifiant));
    }

    setSaving(false);
    if (error) { console.error("Erreur save:", error); setSaveError(error.message); return; }
    setModal(null);
    load();
  }

  async function handleDelete(est: Establishment) {
    if (!confirm(`Supprimer "${est.nom}" ?`)) return;
    const { error } = await getSupabase()
      .from("establishments")
      .delete()
      .eq("identifiant", est.identifiant);
    if (error) console.error("Erreur suppression:", error);
    load();
  }

  return (
    <main className="flex-1 px-6 py-7 max-w-4xl w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <h1 className="text-2xl font-bold text-zinc-900">Établissements</h1>
        <button
          onClick={openAdd}
          className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
        >
          + Ajouter un établissement
        </button>
      </div>

      {/* Load error banner */}
      {loadError && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          Erreur lors du chargement des établissements : {loadError}
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 border-b border-zinc-200">
            <tr>
              {["Nom", "Adresse", "Actions"].map((h) => (
                <th
                  key={h}
                  className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider ${
                    h === "Actions" ? "text-right" : "text-left"
                  }`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="py-14 text-center text-zinc-400 text-sm">
                  Chargement…
                </td>
              </tr>
            ) : establishments.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-14 text-center text-zinc-400 text-sm">
                  Aucun établissement. Ajoutez-en un pour commencer.
                </td>
              </tr>
            ) : (
              establishments.map((est, i) => (
                <tr
                  key={est.identifiant}
                  className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}`}
                >
                  <td className="px-4 py-3 font-medium text-zinc-900">{est.nom}</td>
                  <td className="px-4 py-3 text-zinc-500 text-sm">{est.adresse || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => openEdit(est)}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => handleDelete(est)}
                        className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setModal(null); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">
                {modal.mode === "add" ? "Ajouter un établissement" : "Modifier l'établissement"}
              </h2>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              <Field label="Nom de l'établissement *">
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                  placeholder="Suzette Crêperie Urbaine"
                  className={INPUT_CLS}
                />
              </Field>

              <Field label="Adresse">
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
                  placeholder="12 rue de la Paix, 75001 Paris"
                  className={INPUT_CLS}
                />
              </Field>

              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setModal(null)}
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
