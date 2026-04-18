"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  getWeekDates,
  formatDate,
  getWeekRange,
  getDayParts,
  isToday,
  addWeeks,
  shiftDurationMinutes,
} from "@/lib/week-utils";
import type { TeamMember, ShiftWithMember } from "@/types/index";
import ShiftCard from "./ShiftCard";
import EmployeeAvatar from "./EmployeeAvatar";
import ShiftModal, { type ShiftFormState, SHIFT_LABELS } from "./ShiftModal";
import { useEstablishment } from "@/lib/establishment-context";

type ModalState = {
  mode: "create" | "edit";
  member: TeamMember;
  date: Date;
  shift?: ShiftWithMember;
} | null;

export default function WeeklyPlanningGrid() {
  const { selectedId, loading: estLoading } = useEstablishment();
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [shifts, setShifts] = useState<ShiftWithMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalState>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const [colWidth, setColWidth] = useState(200);

  const weekDates = getWeekDates(referenceDate);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  useEffect(() => {
    function update() { setColWidth(window.innerWidth < 768 ? 120 : 200); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (estLoading || !selectedId) return;
    async function loadAll() {
      setLoading(true);
      const sb = getSupabase();
      const [{ data: membersData }, { data: shiftsData }] = await Promise.all([
        sb
          .from("team_members")
          .select("*")
          .eq("active", true)
          .eq("establishment_id", selectedId)
          .order("full_name"),
        sb
          .from("shifts")
          .select("*, team_member:team_members(*)")
          .gte("date", startDate)
          .lte("date", endDate)
          .order("start_time"),
      ]);
      setMembers(membersData ?? []);
      setShifts((shiftsData as ShiftWithMember[]) ?? []);
      setLoading(false);
    }
    loadAll();
  }, [startDate, endDate, selectedId, estLoading]);

  async function refreshShifts() {
    if (!selectedId) return;
    const { data, error } = await getSupabase()
      .from("shifts")
      .select("*, team_member:team_members(*)")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("start_time");
    if (error) console.error("Erreur refresh shifts:", error);
    setShifts((data as ShiftWithMember[]) ?? []);
  }

  function navigate(weeks: number) {
    setReferenceDate((d) => addWeeks(d, weeks));
  }

  function shiftsFor(memberId: string, date: Date) {
    const d = formatDate(date);
    return shifts.filter((s) => s.employee_id === memberId && s.date === d);
  }

  function plannedHours(memberId: string): number {
    const minutes = shifts
      .filter((s) => s.employee_id === memberId)
      .reduce(
        (acc, s) =>
          acc + shiftDurationMinutes(s.start_time, s.end_time, s.break_minutes || 0),
        0
      );
    return Math.round((minutes / 60) * 10) / 10;
  }

  function openCreate(member: TeamMember, date: Date) {
    setModalError(null);
    setModal({ mode: "create", member, date });
  }

  function openEdit(shift: ShiftWithMember, e: React.MouseEvent) {
    e.stopPropagation();
    setModalError(null);
    setModal({
      mode: "edit",
      member: shift.team_member,
      date: new Date(shift.date + "T00:00:00"),
      shift,
    });
  }

  async function handleSave(form: ShiftFormState) {
    if (!modal) return;
    setModalError(null);
    setModalSaving(true);

    let error: { message: string } | null = null;

    if (modal.mode === "create") {
      const payload = {
        employee_id: modal.member.id,
        date: formatDate(modal.date),
        start_time: form.start_time,
        end_time: form.end_time,
        label: form.label,
        break_minutes: form.break_minutes,
        notes: form.notes.trim() || null,
        color: modal.member.color,
      };
      ({ error } = await getSupabase().from("shifts").insert(payload));
    } else if (modal.shift) {
      const patch = {
        start_time: form.start_time,
        end_time: form.end_time,
        label: form.label,
        break_minutes: form.break_minutes,
        notes: form.notes.trim() || null,
      };
      ({ error } = await getSupabase()
        .from("shifts")
        .update(patch)
        .eq("id", modal.shift.id));
    }

    setModalSaving(false);

    if (error) {
      console.error("Erreur shift:", error);
      setModalError(`Erreur : ${error.message}`);
      return;
    }

    setModal(null);
    await refreshShifts();
  }

  async function handleDelete() {
    if (!modal?.shift) return;
    setModalSaving(true);
    const { error } = await getSupabase()
      .from("shifts")
      .delete()
      .eq("id", modal.shift.id);
    setModalSaving(false);

    if (error) {
      console.error("Erreur suppression shift:", error);
      setModalError(`Erreur : ${error.message}`);
      return;
    }

    setModal(null);
    await refreshShifts();
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Week navigation */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-zinc-200">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 transition-colors text-base font-medium"
          aria-label="Semaine précédente"
        >
          ‹
        </button>
        <span className="text-sm font-medium text-zinc-700">
          {getWeekRange(weekDates)}
        </span>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 flex items-center justify-center rounded-full border border-zinc-200 text-zinc-500 hover:bg-zinc-50 hover:border-zinc-300 transition-colors text-base font-medium"
          aria-label="Semaine suivante"
        >
          ›
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full border-collapse text-sm" style={{ minWidth: colWidth + 7 * 90 }}>
          <colgroup>
            <col style={{ width: colWidth }} />
            {weekDates.map((d) => (
              <col key={d.toISOString()} style={{ minWidth: 90 }} />
            ))}
          </colgroup>

          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Équipe
              </th>
              {weekDates.map((d) => {
                const { weekday, day } = getDayParts(d);
                const today = isToday(d);
                return (
                  <th
                    key={d.toISOString()}
                    className={`px-3 py-3 text-center ${today ? "bg-indigo-50" : ""}`}
                  >
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-[11px] font-medium text-zinc-400 uppercase">
                        {weekday}
                      </span>
                      <span
                        className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                          today ? "bg-indigo-600 text-white" : "text-zinc-700"
                        }`}
                      >
                        {day}
                      </span>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="py-20 text-center text-zinc-400 text-sm">
                  Chargement…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center text-zinc-400 text-sm">
                  Aucun employé actif.
                </td>
              </tr>
            ) : (
              members.map((member, i) => {
                const planned = plannedHours(member.id);
                return (
                  <tr
                    key={member.id}
                    className={`border-b border-zinc-100 ${
                      i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                    }`}
                  >
                    {/* Employee column */}
                    <td className="px-2 md:px-4 py-2 md:py-3 border-r border-zinc-100">
                      <div className="flex items-center gap-1.5 md:gap-2.5">
                        <EmployeeAvatar member={member} size="sm" />
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 text-xs md:text-sm leading-tight truncate">
                            <span className="md:hidden">{member.full_name.split(" ")[0]}</span>
                            <span className="hidden md:inline">{member.full_name}</span>
                          </p>
                          <p className="text-xs text-zinc-400 leading-tight mt-0.5 hidden md:block">
                            {member.role}
                          </p>
                          <p className="text-[11px] leading-tight mt-0.5 hidden md:block">
                            <span className={planned > member.contract_hours ? "text-amber-600 font-medium" : "text-zinc-400"}>
                              {planned}h
                            </span>
                            <span className="text-zinc-300"> / {member.contract_hours}h</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Day cells */}
                    {weekDates.map((d) => {
                      const today = isToday(d);
                      const dayShifts = shiftsFor(member.id, d);
                      return (
                        <td
                          key={d.toISOString()}
                          onClick={() => openCreate(member, d)}
                          className={`px-1 py-1 md:px-2 md:py-2 border-r border-zinc-100 align-top cursor-pointer transition-colors group ${
                            today ? "bg-indigo-50/30 hover:bg-indigo-50/60" : "hover:bg-zinc-50"
                          }`}
                          style={{ minHeight: 72 }}
                        >
                          <div className="flex flex-col gap-1">
                            {dayShifts.map((s) => (
                              <ShiftCard
                                key={s.id}
                                shift={s}
                                onClick={(e) => openEdit(s, e)}
                              />
                            ))}
                            {dayShifts.length === 0 && (
                              <span className="text-[11px] text-zinc-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                + Ajouter
                              </span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Shift modal */}
      {modal && (
        <ShiftModal
          mode={modal.mode}
          member={modal.member}
          date={modal.date}
          initialForm={
            modal.shift
              ? {
                  label: modal.shift.label ?? SHIFT_LABELS[0],
                  start_time: modal.shift.start_time,
                  end_time: modal.shift.end_time,
                  break_minutes: modal.shift.break_minutes || 30,
                  notes: modal.shift.notes ?? "",
                }
              : undefined
          }
          saving={modalSaving}
          error={modalError}
          onClose={() => setModal(null)}
          onSave={handleSave}
          onDelete={modal.mode === "edit" ? handleDelete : undefined}
        />
      )}
    </div>
  );
}
