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

export default function WeeklyPlanningGrid() {
  const [referenceDate, setReferenceDate] = useState(new Date());
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [shifts, setShifts] = useState<ShiftWithMember[]>([]);
  const [loading, setLoading] = useState(true);

  const weekDates = getWeekDates(referenceDate);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const sb = getSupabase();
      const [{ data: membersData }, { data: shiftsData }] = await Promise.all([
        sb
          .from("team_members")
          .select("*")
          .eq("active", true)
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
    load();
  }, [startDate, endDate]);

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
          acc +
          shiftDurationMinutes(s.start_time, s.end_time, s.break_minutes || 0),
        0
      );
    return Math.round((minutes / 60) * 10) / 10;
  }

  return (
    <div className="flex flex-col min-h-0">
      {/* Week navigation bar */}
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
        <table className="w-full border-collapse text-sm" style={{ minWidth: 900 }}>
          <colgroup>
            <col style={{ width: 200 }} />
            {weekDates.map((d) => (
              <col key={d.toISOString()} style={{ minWidth: 120 }} />
            ))}
          </colgroup>

          {/* Day headers */}
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
                          today
                            ? "bg-indigo-600 text-white"
                            : "text-zinc-700"
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
                    {/* Employee cell */}
                    <td className="px-4 py-3 border-r border-zinc-100">
                      <div className="flex items-center gap-2.5">
                        <EmployeeAvatar member={member} />
                        <div className="min-w-0">
                          <p className="font-semibold text-zinc-900 text-sm leading-tight truncate">
                            {member.full_name}
                          </p>
                          <p className="text-xs text-zinc-400 leading-tight mt-0.5">
                            {member.role}
                          </p>
                          <p className="text-[11px] text-zinc-400 leading-tight mt-0.5">
                            <span
                              className={
                                planned > member.contract_hours
                                  ? "text-amber-600 font-medium"
                                  : "text-zinc-400"
                              }
                            >
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
                          className={`px-2 py-2 border-r border-zinc-100 align-top ${
                            today ? "bg-indigo-50/30" : ""
                          }`}
                          style={{ minHeight: 64 }}
                        >
                          <div className="flex flex-col gap-1">
                            {dayShifts.map((s) => (
                              <ShiftCard key={s.id} shift={s} />
                            ))}
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
    </div>
  );
}
