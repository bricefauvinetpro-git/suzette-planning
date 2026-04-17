"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import {
  getWeekDates,
  formatDate,
  formatDayLabel,
  getWeekRange,
  addWeeks,
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
  const weekRange = getWeekRange(weekDates);
  const startDate = formatDate(weekDates[0]);
  const endDate = formatDate(weekDates[6]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const sb = getSupabase();
      const [{ data: membersData }, { data: shiftsData }] = await Promise.all([
        sb.from("team_members").select("*").order("name"),
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
    return shifts.filter(
      (s) => s.team_member_id === memberId && s.date === d
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm hover:bg-zinc-50 transition-colors"
        >
          ← Semaine précédente
        </button>
        <h2 className="text-sm font-medium text-zinc-600">{weekRange}</h2>
        <button
          onClick={() => navigate(1)}
          className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm hover:bg-zinc-50 transition-colors"
        >
          Semaine suivante →
        </button>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-sm">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-zinc-100">
              <th className="w-44 px-4 py-3 text-left font-medium text-zinc-500">
                Employé
              </th>
              {weekDates.map((d) => (
                <th
                  key={d.toISOString()}
                  className="px-3 py-3 text-center font-medium text-zinc-500 capitalize min-w-[120px]"
                >
                  {formatDayLabel(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center text-zinc-400 text-sm"
                >
                  Chargement…
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-16 text-center text-zinc-400 text-sm"
                >
                  Aucun employé trouvé.
                </td>
              </tr>
            ) : (
              members.map((member, i) => (
                <tr
                  key={member.id}
                  className={i % 2 === 0 ? "bg-white" : "bg-zinc-50/50"}
                >
                  <td className="px-4 py-3 border-b border-zinc-100">
                    <div className="flex items-center gap-2">
                      <EmployeeAvatar member={member} />
                      <div>
                        <p className="font-medium text-zinc-900 leading-tight">
                          {member.name}
                        </p>
                        <p className="text-xs text-zinc-400 leading-tight">
                          {member.role}
                        </p>
                      </div>
                    </div>
                  </td>
                  {weekDates.map((d) => {
                    const dayShifts = shiftsFor(member.id, d);
                    return (
                      <td
                        key={d.toISOString()}
                        className="px-2 py-2 border-b border-zinc-100 align-top"
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
