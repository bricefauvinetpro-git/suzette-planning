"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getSupabase } from "./supabase";
import type { Establishment } from "@/types/index";

type EstablishmentContextType = {
  establishments: Establishment[];
  selectedId: string | null;
  setSelectedId: (id: string) => void;
  loading: boolean;
};

const EstablishmentContext = createContext<EstablishmentContextType>({
  establishments: [],
  selectedId: null,
  setSelectedId: () => {},
  loading: true,
});

const STORAGE_KEY = "suzette_establishment_id";

export function EstablishmentProvider({ children }: { children: React.ReactNode }) {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selectedId, setSelectedIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data, error } = await getSupabase()
        .from("establishments")
        .select("id, name, address")
        .order("name");
      if (error) console.error("Erreur chargement établissements:", error);
      const list = (data as Establishment[]) ?? [];
      setEstablishments(list);

      const saved = localStorage.getItem(STORAGE_KEY);
      const valid = list.find((e) => e.id === saved);
      if (valid) {
        setSelectedIdState(valid.id);
      } else if (list.length > 0) {
        setSelectedIdState(list[0].id);
      }
      setLoading(false);
    }
    load();
  }, []);

  function setSelectedId(id: string) {
    setSelectedIdState(id);
    localStorage.setItem(STORAGE_KEY, id);
  }

  return (
    <EstablishmentContext.Provider value={{ establishments, selectedId, setSelectedId, loading }}>
      {children}
    </EstablishmentContext.Provider>
  );
}

export function useEstablishment() {
  return useContext(EstablishmentContext);
}
