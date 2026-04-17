import WeeklyPlanningGrid from "@/components/planning/WeeklyPlanningGrid";

export const metadata = {
  title: "Planning — Suzette",
};

export default function PlanningPage() {
  return (
    <main className="flex-1 px-6 py-8 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Planning de l&apos;équipe</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Visualisez les shifts de toute l&apos;équipe par semaine.
        </p>
      </div>
      <WeeklyPlanningGrid />
    </main>
  );
}
