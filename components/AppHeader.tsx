"use client";

import Link from "next/link";
import { useEstablishment } from "@/lib/establishment-context";

export default function AppHeader() {
  const { establishments, selectedId, setSelectedId, loading } = useEstablishment();

  return (
    <header style={{ backgroundColor: "#1a1a2e" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <span className="text-white font-bold text-lg tracking-tight shrink-0">
          Suzette
        </span>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>

        {/* Establishment selector */}
        {!loading && establishments.length > 0 && (
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm font-medium rounded-md px-2 py-1 border-0 outline-none cursor-pointer"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.9)",
            }}
          >
            {establishments.map((est) => (
              <option key={est.id} value={est.id} style={{ backgroundColor: "#1a1a2e" }}>
                {est.name}
              </option>
            ))}
          </select>
        )}

        <span style={{ color: "rgba(255,255,255,0.2)" }}>|</span>

        <nav className="flex items-center gap-5">
          <Link
            href="/planning"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Planning
          </Link>
          <Link
            href="/team"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Équipe
          </Link>
          <Link
            href="/configuration"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Configuration
          </Link>
        </nav>
      </div>
    </header>
  );
}
