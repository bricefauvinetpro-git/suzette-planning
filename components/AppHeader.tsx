"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useEstablishment } from "@/lib/establishment-context";

export default function AppHeader() {
  const { establishments, selectedId, setSelectedId, loading } = useEstablishment();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <header style={{ backgroundColor: "#1a1a2e" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <span className="text-white font-bold text-lg tracking-tight shrink-0">
          Suzette
        </span>

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

        <nav className="flex items-center gap-5 flex-1">
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
        </nav>

        {/* Settings button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              color: menuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
              backgroundColor: menuOpen ? "rgba(255,255,255,0.12)" : "transparent",
            }}
            title="Configuration"
          >
            <Settings size={17} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50 bg-white"
            >
              <div className="p-1.5">
                <Link
                  href="/configuration/etablissements"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  Établissements
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
