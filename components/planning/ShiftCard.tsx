import type { ShiftWithMember } from "@/types/index";
import EmployeeAvatar from "./EmployeeAvatar";

type Props = {
  shift: ShiftWithMember;
};

export default function ShiftCard({ shift }: Props) {
  const { team_member, start_time, end_time, label } = shift;

  return (
    <div
      className="flex items-center gap-1.5 rounded px-2 py-1 text-white text-xs font-medium shadow-sm"
      style={{ backgroundColor: team_member.color }}
    >
      <EmployeeAvatar member={team_member} size="sm" />
      <div className="min-w-0">
        <p className="truncate leading-tight">{team_member.name}</p>
        <p className="opacity-80 leading-tight">
          {start_time}–{end_time}
          {label ? ` · ${label}` : ""}
        </p>
      </div>
    </div>
  );
}
