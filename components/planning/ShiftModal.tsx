"use client";

import { useState } from "react";
import type { TeamMember } from "@/types/index";

export const SHIFT_LABELS = [
  "Ouverture midi",
  "Fermeture midi",
  "Ouverture soir",
  "Fermeture soir",
  "Ménage + Salle",
  "Cuisine",
  "Service",
  "Repos hebdomadaire",
] as const;

export type ShiftFormState = {
  label: string;
  start_time: string;
  end_time: string;
  break_minutes: number;
  notes: string;
};

export const DEFAULT_SHIFT_FORM: ShiftFormState = {
  label: "Ouverture midi",
  start_time: "09:00",
  end_time: "15:00",
  break_minutes: 30,
  notes: "",
};

type Props = {
  mode: "create" | "edit";
  member: TeamMember;
  date: Date;
  initialForm?: Partial<ShiftFormState>;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSave: (form: ShiftFormState) => void;
  onDelete?: () => void;
};

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white";

export default function ShiftModal({
  mode,
  member,
  date,
  initialForm,
  saving,
  error,
  onClose,
  onSave,
  onDelete,
}: Props) {
  const [form, setForm] = useState<ShiftFormState>({
    ...DEFAULT_SHIFT_FORM,
    ...initialForm,
  });

  const dateLabel = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const memberInitials = member.full_name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave(form);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-zinc-900">
            {mode === "create" ? "Nouveau shift" : "Modifier le shift"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Employee — read only */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Salarié
            </label>
            <div className="flex items-center gap-2 px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-200">
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                style={{ backgroundColor: member.color }}
              >
                {memberInitials}
              </span>
              <span className="text-sm font-medium text-zinc-900">
                {member.full_name}
              </span>
            </div>
          </div>

          {/* Date — read only */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Date
            </label>
            <div className="px-3 py-2 bg-zinc-50 rounded-lg border border-zinc-200 text-sm text-zinc-700 capitalize">
              {dateLabel}
            </div>
          </div>

          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Étiquette
            </label>
            <select
              value={form.label}
              onChange={(e) =>
                setForm((f) => ({ ...f, label: e.target.value }))
              }
              className={INPUT_CLS}
            >
              {SHIFT_LABELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Times */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Heure de début
              </label>
              <input
                type="time"
                required
                value={form.start_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, start_time: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Heure de fin
              </label>
              <input
                type="time"
                required
                value={form.end_time}
                onChange={(e) =>
                  setForm((f) => ({ ...f, end_time: e.target.value }))
                }
                className={INPUT_CLS}
              />
            </div>
          </div>

          {/* Break */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Pause <span className="text-zinc-400 font-normal">(minutes)</span>
            </label>
            <input
              type="number"
              min={0}
              max={120}
              value={form.break_minutes}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  break_minutes: Number(e.target.value),
                }))
              }
              className={INPUT_CLS}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">
              Notes{" "}
              <span className="text-zinc-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              rows={2}
              placeholder="Informations complémentaires…"
              className={`${INPUT_CLS} resize-none`}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3 mt-1">
            {mode === "edit" && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={saving}
                className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                Supprimer
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
            >
              {saving
                ? "Enregistrement…"
                : mode === "create"
                ? "Ajouter"
                : "Enregistrer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
