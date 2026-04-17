import type { ShiftWithMember } from "@/types/index";

type Props = {
  shift: ShiftWithMember;
};

const SPECIAL_LABELS: Record<string, { bg: string; text: string }> = {
  repos: { bg: "#e5e7eb", text: "#6b7280" },
  indisponible: { bg: "#374151", text: "#9ca3af" },
};

function detectSpecial(label: string | null) {
  const l = label?.toLowerCase() ?? "";
  if (l.includes("repos")) return SPECIAL_LABELS.repos;
  if (l.includes("indisponible")) return SPECIAL_LABELS.indisponible;
  return null;
}

export default function ShiftCard({ shift }: Props) {
  const { start_time, end_time, label, color } = shift;
  const special = detectSpecial(label);

  const bg = special?.bg ?? color;
  const textColor = special?.text ?? "#ffffff";
  const isLight = special != null;

  return (
    <div
      className="rounded-md px-2 py-1.5 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      <p
        className="text-xs font-semibold leading-tight truncate"
        style={{ color: textColor }}
      >
        {label ?? "Shift"}
      </p>
      {!isLight && (
        <p className="text-[11px] leading-tight mt-0.5" style={{ color: "rgba(255,255,255,0.8)" }}>
          {start_time}–{end_time}
        </p>
      )}
      {isLight && (
        <p className="text-[11px] leading-tight mt-0.5" style={{ color: textColor, opacity: 0.7 }}>
          {start_time}–{end_time}
        </p>
      )}
    </div>
  );
}
