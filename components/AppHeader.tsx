"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Settings } from "lucide-react";
import { useEstablishment } from "@/lib/establishment-context";

export default function AppHeader() {
  const { establishments, selectedId, setSelectedId } = useEstablishment();
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

  const selectedName = establishments.find((e) => e.id === selectedId)?.name;

  return (
    <header style={{ backgroundColor: "#1a1a2e" }}>
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center gap-4">
        <span className="text-white font-bold text-lg tracking-tight shrink-0">
          Suzette
        </span>
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
          <Link
            href="/configuration"
            className="text-sm font-medium transition-colors"
            style={{ color: "rgba(255,255,255,0.7)" }}
          >
            Configuration
          </Link>
        </nav>

        {/* Settings button */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 transition-colors"
            style={{
              color: menuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
              backgroundColor: menuOpen ? "rgba(255,255,255,0.12)" : "transparent",
            }}
            title="Paramètres"
          >
            {selectedName && (
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.55)" }}>
                {selectedName}
              </span>
            )}
            <Settings size={17} />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-64 rounded-xl shadow-xl border border-zinc-100 overflow-hidden z-50"
              style={{ backgroundColor: "#fff" }}
            >
              {/* Établissement actif */}
              <div className="px-3 pt-3 pb-1">
                <p className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider px-1 mb-1.5">
                  Établissement actif
                </p>
                <div className="flex flex-col gap-0.5">
                  {establishments.map((est) => {
                    const active = est.id === selectedId;
                    return (
                      <button
                        key={est.id}
                        onClick={() => { setSelectedId(est.id); setMenuOpen(false); }}
                        className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                          active
                            ? "bg-indigo-50 text-indigo-700 font-medium"
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        <span>{est.name}</span>
                        {active && (
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7L5.5 10L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mx-3 my-2 border-t border-zinc-100" />

              {/* Gérer les établissements */}
              <div className="px-3 pb-3">
                <Link
                  href="/configuration/etablissements"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
                >
                  <Settings size={13} />
                  Gérer les établissements
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
