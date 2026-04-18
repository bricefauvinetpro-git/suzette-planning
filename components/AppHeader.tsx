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

        {/* Establishment switcher */}
        {!loading && establishments.length > 0 && (
          <select
            value={selectedId ?? ""}
            onChange={(e) => setSelectedId(e.target.value)}
            className="text-sm font-medium rounded-md px-2 py-1 border-0 outline-none cursor-pointer"
            style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.9)" }}
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
          <Link href="/planning" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            Planning
          </Link>
          <Link href="/team" className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.7)" }}>
            Équipe
          </Link>
        </nav>

        {/* Settings */}
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

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-xl border border-zinc-100 bg-white overflow-hidden z-50">
              <div className="px-4 py-2.5">
                <p className="text-xs font-semibold text-zinc-900">Configuration</p>
              </div>
              <div className="mx-3 border-t border-zinc-100" />
              <div className="p-1.5">
                <Link
                  href="/configuration/etablissements"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                >
                  <span className="text-base leading-none">🏢</span>
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
