import type { TeamMember } from "@/types/index";
import { initials } from "@/lib/utils";

type Props = {
  member: TeamMember;
  size?: "sm" | "md";
};

export default function EmployeeAvatar({ member, size = "md" }: Props) {
  const dim = size === "sm" ? "w-6 h-6 text-[10px]" : "w-9 h-9 text-sm";
  if (member.avatar_url) {
    return (
      <img
        src={member.avatar_url}
        alt={member.full_name}
        className={`${dim} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <span
      className={`${dim} rounded-full flex items-center justify-center font-bold text-white shrink-0`}
      style={{ backgroundColor: member.color }}
      title={member.full_name}
    >
      {initials(member.full_name)}
    </span>
  );
}
