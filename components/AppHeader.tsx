"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Settings, ChevronRight, ChevronLeft, Menu, X, LogOut } from "lucide-react";
import { useEstablishment } from "@/lib/establishment-context";
import { getSupabase } from "@/lib/supabase";

type SettingsPanel = "root" | "configuration";

export default function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const { establishments, selectedId, setSelectedId, loading } = useEstablishment();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const match = document.cookie.match(/suzette_role=([^;]+)/);
    setUserRole(match ? match[1] : null);
  }, []);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsPanel, setSettingsPanel] = useState<SettingsPanel>("root");
  const settingsRef = useRef<HTMLDivElement>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
        setSettingsPanel("root");
      }
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) {
        setMobileOpen(false);
      }
    }
    if (settingsOpen || mobileOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [settingsOpen, mobileOpen]);

  function closeSettings() {
    setSettingsOpen(false);
    setSettingsPanel("root");
  }

  async function handleSignOut() {
    await getSupabase().auth.signOut();
    document.cookie = "suzette_role=; path=/; max-age=0";
    router.replace("/login");
  }

  const navLinkCls = (href: string) => {
    const active = pathname === href || pathname.startsWith(href + "/");
    return `text-sm font-medium transition-colors ${active ? "text-white" : "text-white/60 hover:text-white/90"}`;
  };

  return (
    <header style={{ backgroundColor: "#1a1a2e" }} className="relative z-20">
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

        {/* Desktop separator + nav */}
        <span className="hidden md:inline" style={{ color: "rgba(255,255,255,0.2)" }}>|</span>
        <nav className="hidden md:flex items-center gap-5 flex-1">
          <Link href="/planning" className={navLinkCls("/planning")}>
            Planning
          </Link>
          {userRole !== "employee" && (
            <Link href="/team" className={navLinkCls("/team")}>
              Équipe
            </Link>
          )}
        </nav>

        {/* Spacer on mobile */}
        <div className="flex-1 md:hidden" />

        {/* Desktop settings ⚙️ */}
        <div className="relative hidden md:block" ref={settingsRef}>
          <button
            onClick={() => { setSettingsOpen((o) => !o); setSettingsPanel("root"); }}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              color: settingsOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
              backgroundColor: settingsOpen ? "rgba(255,255,255,0.12)" : "transparent",
            }}
            title="Configuration"
          >
            <Settings size={17} />
          </button>

          {settingsOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 rounded-xl shadow-xl border border-zinc-100 bg-white overflow-hidden z-50">
              {settingsPanel === "root" && (
                <div className="p-1.5">
                  <button
                    onClick={() => setSettingsPanel("configuration")}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    <span className="font-medium">Configuration</span>
                    <ChevronRight size={14} className="text-zinc-400 shrink-0" />
                  </button>
                  <div className="mx-1 my-1 border-t border-zinc-100" />
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={14} className="shrink-0" />
                    Se déconnecter
                  </button>
                </div>
              )}
              {settingsPanel === "configuration" && (
                <div className="p-1.5">
                  <button
                    onClick={() => setSettingsPanel("root")}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors mb-0.5"
                  >
                    <ChevronLeft size={14} className="shrink-0" />
                    <span>Configuration</span>
                  </button>
                  <div className="mx-1 mb-1.5 border-t border-zinc-100" />
                  <Link
                    href="/configuration/etablissements"
                    onClick={closeSettings}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-zinc-700 hover:bg-zinc-50 transition-colors"
                  >
                    Établissements
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile ☰ */}
        <div className="relative md:hidden" ref={mobileRef}>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex items-center justify-center w-8 h-8 rounded-lg transition-colors"
            style={{
              color: mobileOpen ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.6)",
              backgroundColor: mobileOpen ? "rgba(255,255,255,0.12)" : "transparent",
            }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          {mobileOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-xl border border-zinc-100 bg-white overflow-hidden z-50">
              <div className="p-1.5">
                <Link
                  href="/planning"
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname === "/planning" ? "bg-zinc-100 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"}`}
                >
                  Planning
                </Link>
                {userRole !== "employee" && (
                  <Link
                    href="/team"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${pathname.startsWith("/team") ? "bg-zinc-100 text-zinc-900" : "text-zinc-700 hover:bg-zinc-50"}`}
                  >
                    Équipe
                  </Link>
                )}
                <div className="mx-1 my-1.5 border-t border-zinc-100" />
                <Link
                  href="/configuration/etablissements"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700 transition-colors"
                >
                  <Settings size={14} />
                  Établissements
                </Link>
                <div className="mx-1 my-1.5 border-t border-zinc-100" />
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} className="shrink-0" />
                  Se déconnecter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
