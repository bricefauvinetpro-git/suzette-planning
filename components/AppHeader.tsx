"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Settings, ChevronRight, ChevronLeft } from "lucide-react";
import { useEstablishment } from "@/lib/establishment-context";

type Panel = "root" | "configuration";

export default function AppHeader() {
  const { establishments, selectedId, setSelectedId, loading } = useEstablishment();
  const [menuOpen, setMenuOpen] = useState(false);
  const [panel, setPanel] = useState<Panel>("root");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setPanel("root");
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  function toggleMenu() {
    if (menuOpen) {
      setMenuOpen(false);
      setPanel("root");
    } else {
      setMenuOpen(true);
      setPanel("root");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
    setPanel("root");
  }

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
            onClick={toggleMenu}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              color: menuOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
              backgroundColor: menuOpen ? "rgba(255,255,255,0.12)" : "transparent",
            }}
            title="Paramètres"
          >
            <Settings size={17} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border border-zinc-100 bg-white overflow-hidden z-50">

              {/* Panel root */}
              {panel === "root" && (
                <div className="p-1.5">
                  <button
                    onClick={() => setPanel("configuration")}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="font-medium">Configuration</span>
                    <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                  </button>
                </div>
              )}

              {/* Panel configuration */}
              {panel === "configuration" && (
                <div className="p-1.5">
                  <button
                    onClick={() => setPanel("root")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors mb-0.5"
                  >
                    <ChevronLeft size={14} className="shrink-0" />
                    <span>Configuration</span>
                  </button>
                  <div className="mx-1 mb-1.5 border-t border-zinc-100" />
                  <Link
                    href="/configuration/etablissements"
                    onClick={closeMenu}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Établissements
                  </Link>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </header>
  );
}
