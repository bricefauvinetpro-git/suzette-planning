import WeeklyPlanningGrid from "@/components/planning/WeeklyPlanningGrid";

export const metadata = {
  title: "Planning — Suzette",
};

export default function PlanningPage() {
  return (
    <main className="flex-1 flex flex-col py-6 px-4 max-w-7xl mx-auto w-full gap-4">
      <h1 className="text-xl font-bold text-zinc-900 px-2">Planning de l&apos;équipe</h1>
      <div className="rounded-xl overflow-hidden border border-zinc-200 shadow-sm bg-white">
        <WeeklyPlanningGrid />
      </div>
    </main>
  );
}
