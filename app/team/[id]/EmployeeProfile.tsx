"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { shiftDurationMinutes } from "@/lib/week-utils";
import type { TeamMember, EmployeeDocument } from "@/types/index";
import { initials } from "@/lib/utils";

const CONTRACT_TYPES = ["CDI", "CDD", "Extra", "Apprentissage", "Stage"];

const DOC_TYPES = [
  "Contrat d'extra",
  "Contrat CDI",
  "Contrat CDD",
  "Bulletin de paie",
  "Autre",
];

const WEEK_DAYS = [
  { key: "lundi", label: "Lundi" },
  { key: "mardi", label: "Mardi" },
  { key: "mercredi", label: "Mercredi" },
  { key: "jeudi", label: "Jeudi" },
  { key: "vendredi", label: "Vendredi" },
  { key: "samedi", label: "Samedi" },
  { key: "dimanche", label: "Dimanche" },
];

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 bg-white";

type Tab = "info" | "contract" | "time" | "docs" | "role";

type InfoForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
};

type ContractForm = {
  role: string;
  contractType: string;
  contractHours: number;
  startDate: string;
  hourlyRate: number;
};

type MonthEntry = {
  month: string;
  count: number;
  minutes: number;
};

export default function EmployeeProfile({ id }: { id: string }) {
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("info");

  const [editingInfo, setEditingInfo] = useState(false);
  const [infoForm, setInfoForm] = useState<InfoForm>({
    firstName: "", lastName: "", email: "", phone: "", birthDate: "",
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  const [editingContract, setEditingContract] = useState(false);
  const [contractForm, setContractForm] = useState<ContractForm>({
    role: "", contractType: "CDI", contractHours: 35, startDate: "", hourlyRate: 12,
  });
  const [savingContract, setSavingContract] = useState(false);
  const [contractError, setContractError] = useState<string | null>(null);

  const [monthlyData, setMonthlyData] = useState<MonthEntry[]>([]);
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  const [userRole, setUserRole] = useState<string>("employee");
  const [savingRole, setSavingRole] = useState(false);
  const [roleError, setRoleError] = useState<string | null>(null);

  // Documents tab state
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadDocType, setUploadDocType] = useState(DOC_TYPES[0]);
  const [uploadDocName, setUploadDocName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => { loadData(); }, [id]);

  async function loadData() {
    setLoading(true);
    const since = new Date();
    since.setFullYear(since.getFullYear() - 1);
    const sinceStr = since.toISOString().split("T")[0];

    const [{ data: m, error: mErr }, { data: shifts }, { data: docsData }] = await Promise.all([
      getSupabase().from("team_members").select("*").eq("id", id).single(),
      getSupabase()
        .from("shifts")
        .select("date, start_time, end_time, break_minutes")
        .eq("employee_id", id)
        .gte("date", sinceStr)
        .order("date"),
      getSupabase()
        .from("employee_documents")
        .select("*")
        .eq("employee_id", id)
        .order("created_at", { ascending: false }),
    ]);

    if (mErr || !m) { setNotFound(true); setLoading(false); return; }

    const tm = m as TeamMember;
    setMember(tm);

    const parts = (tm.full_name || "").split(" ");
    setInfoForm({
      firstName: parts[0] || "",
      lastName: parts.slice(1).join(" ") || "",
      email: tm.email || "",
      phone: tm.phone || "",
      birthDate: tm.birth_date || "",
    });
    setContractForm({
      role: tm.role || "",
      contractType: tm.contract_type || "CDI",
      contractHours: tm.contract_hours || 35,
      startDate: tm.start_date || "",
      hourlyRate: tm.hourly_rate ?? 12,
    });
    setAvailability(
      tm.availability ??
        Object.fromEntries(WEEK_DAYS.map(({ key }) => [key, key !== "dimanche"]))
    );
    setUserRole(tm.user_role ?? "employee");

    if (shifts) {
      const byMonth: Record<string, MonthEntry> = {};
      for (const s of shifts) {
        const mo = s.date.slice(0, 7);
        if (!byMonth[mo]) byMonth[mo] = { month: mo, count: 0, minutes: 0 };
        byMonth[mo].count++;
        byMonth[mo].minutes += shiftDurationMinutes(
          s.start_time, s.end_time, s.break_minutes || 0
        );
      }
      setMonthlyData(
        Object.values(byMonth).sort((a, b) => b.month.localeCompare(a.month))
      );
    }
    setDocs((docsData as EmployeeDocument[]) ?? []);
    setLoading(false);
  }

  async function loadDocs() {
    const { data } = await getSupabase()
      .from("employee_documents")
      .select("*")
      .eq("employee_id", id)
      .order("created_at", { ascending: false });
    setDocs((data as EmployeeDocument[]) ?? []);
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setInfoError(null);
    setSavingInfo(true);
    const { error } = await getSupabase()
      .from("team_members")
      .update({
        full_name: `${infoForm.firstName.trim()} ${infoForm.lastName.trim()}`.trim(),
        email: infoForm.email.trim() || null,
        phone: infoForm.phone.trim() || null,
        birth_date: infoForm.birthDate || null,
      })
      .eq("id", member.id);
    setSavingInfo(false);
    if (error) { setInfoError(error.message); return; }
    setEditingInfo(false);
    loadData();
  }

  async function handleSaveContract(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setContractError(null);
    setSavingContract(true);
    const { error } = await getSupabase()
      .from("team_members")
      .update({
        role: contractForm.role.trim(),
        contract_type: contractForm.contractType,
        contract_hours: contractForm.contractHours,
        start_date: contractForm.startDate || null,
        hourly_rate: contractForm.hourlyRate,
      })
      .eq("id", member.id);
    setSavingContract(false);
    if (error) { setContractError(error.message); return; }
    setEditingContract(false);
    loadData();
  }

  async function handleToggleAvailability(day: string) {
    if (!member) return;
    const newAvail = { ...availability, [day]: !(availability[day] ?? true) };
    setAvailability(newAvail);
    const { error } = await getSupabase()
      .from("team_members")
      .update({ availability: newAvail })
      .eq("id", member.id);
    if (error) console.error("Erreur disponibilité:", error);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedFile) return;
    setUploadError(null);
    setUploading(true);

    const safeFileName = `${Date.now()}_${selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const path = `${id}/${safeFileName}`;

    const { error: storageErr } = await getSupabase()
      .storage.from("documents")
      .upload(path, selectedFile, { contentType: "application/pdf" });

    if (storageErr) {
      setUploadError(storageErr.message);
      setUploading(false);
      return;
    }

    const displayName = uploadDocName.trim() || selectedFile.name;
    const { error: dbErr } = await getSupabase()
      .from("employee_documents")
      .insert({ employee_id: id, file_name: displayName, file_type: uploadDocType, storage_path: path });

    if (dbErr) {
      await getSupabase().storage.from("documents").remove([path]);
      setUploadError(dbErr.message);
      setUploading(false);
      return;
    }

    setShowUploadModal(false);
    setUploadDocName("");
    setUploadDocType(DOC_TYPES[0]);
    setSelectedFile(null);
    setUploading(false);
    loadDocs();
  }

  function handleViewDoc(doc: EmployeeDocument) {
    const { data } = getSupabase().storage.from("documents").getPublicUrl(doc.storage_path);
    window.open(data.publicUrl, "_blank", "noopener,noreferrer");
  }

  async function handleDeleteDoc(doc: EmployeeDocument) {
    if (!confirm(`Supprimer "${doc.file_name}" ?`)) return;
    await Promise.all([
      getSupabase().storage.from("documents").remove([doc.storage_path]),
      getSupabase().from("employee_documents").delete().eq("id", doc.id),
    ]);
    loadDocs();
  }

  async function handleSaveRole(e: React.FormEvent) {
    e.preventDefault();
    if (!member) return;
    setRoleError(null);
    setSavingRole(true);
    const { error } = await getSupabase()
      .from("team_members")
      .update({ user_role: userRole })
      .eq("id", member.id);
    setSavingRole(false);
    if (error) { setRoleError(error.message); return; }
    loadData();
  }

  function displayDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso + "T00:00:00").toLocaleDateString("fr-FR");
  }

  function formatMonth(ym: string) {
    const [y, mo] = ym.split("-").map(Number);
    return new Date(y, mo - 1, 1).toLocaleDateString("fr-FR", {
      month: "long", year: "numeric",
    });
  }

  if (loading)
    return (
      <main className="flex-1 flex items-center justify-center text-sm text-zinc-400">
        Chargement…
      </main>
    );

  if (notFound || !member)
    return (
      <main className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-zinc-500">Employé introuvable.</p>
        <Link href="/team" className="text-indigo-600 text-sm hover:underline">
          ← Retour à l&apos;équipe
        </Link>
      </main>
    );

  const TABS: { id: Tab; label: string }[] = [
    { id: "info", label: "Informations personnelles" },
    { id: "contract", label: "Contrat" },
    { id: "time", label: "Temps & planification" },
    { id: "docs", label: "Documents" },
    { id: "role", label: "Rôle et permissions" },
  ];

  return (
    <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
      <Link
        href="/team"
        className="inline-flex items-center text-xs text-zinc-400 hover:text-zinc-600 transition-colors mb-5"
      >
        ← Retour à l&apos;équipe
      </Link>

      {/* Profile header */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden mb-6">
        <div className="h-1.5" style={{ backgroundColor: member.color }} />
        <div className="px-6 py-5 flex items-start gap-5 flex-wrap">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold shrink-0"
            style={{ backgroundColor: member.color }}
          >
            {initials(member.full_name)}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-zinc-900 leading-tight">
              {member.full_name}
            </h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {member.role && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700">
                  {member.role}
                </span>
              )}
              {member.contract_type && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  {member.contract_type}
                </span>
              )}
            </div>
            <div className="flex gap-6 mt-3 text-sm text-zinc-600 flex-wrap">
              <span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide mr-1">Depuis</span>
                {displayDate(member.start_date)}
              </span>
              <span>
                <span className="text-xs text-zinc-400 uppercase tracking-wide mr-1">Heures</span>
                {member.contract_hours}h/sem.
              </span>
              {member.hourly_rate != null && (
                <span>
                  <span className="text-xs text-zinc-400 uppercase tracking-wide mr-1">Taux</span>
                  {member.hourly_rate}€/h
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-zinc-200 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* ── Tab: Informations personnelles ── */}
          {activeTab === "info" && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-zinc-900">État civil</h2>
                {!editingInfo && (
                  <button
                    onClick={() => setEditingInfo(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {editingInfo ? (
                <form onSubmit={handleSaveInfo} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabeledInput label="Prénom">
                      <input type="text" value={infoForm.firstName}
                        onChange={(e) => setInfoForm((f) => ({ ...f, firstName: e.target.value }))}
                        className={INPUT_CLS} />
                    </LabeledInput>
                    <LabeledInput label="Nom">
                      <input type="text" value={infoForm.lastName}
                        onChange={(e) => setInfoForm((f) => ({ ...f, lastName: e.target.value }))}
                        className={INPUT_CLS} />
                    </LabeledInput>
                  </div>
                  <LabeledInput label="Email">
                    <input type="email" value={infoForm.email} placeholder="marie@example.com"
                      onChange={(e) => setInfoForm((f) => ({ ...f, email: e.target.value }))}
                      className={INPUT_CLS} />
                  </LabeledInput>
                  <LabeledInput label="Téléphone">
                    <input type="tel" value={infoForm.phone} placeholder="06 12 34 56 78"
                      onChange={(e) => setInfoForm((f) => ({ ...f, phone: e.target.value }))}
                      className={INPUT_CLS} />
                  </LabeledInput>
                  <LabeledInput label="Date de naissance">
                    <input type="date" value={infoForm.birthDate}
                      onChange={(e) => setInfoForm((f) => ({ ...f, birthDate: e.target.value }))}
                      className={INPUT_CLS} />
                  </LabeledInput>
                  {infoError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{infoError}</p>
                  )}
                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => setEditingInfo(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                      Annuler
                    </button>
                    <button type="submit" disabled={savingInfo}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                      {savingInfo ? "Enregistrement…" : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                  <InfoField label="Prénom" value={member.full_name.split(" ")[0]} />
                  <InfoField label="Nom" value={member.full_name.split(" ").slice(1).join(" ")} />
                  <InfoField label="Email" value={member.email} />
                  <InfoField label="Téléphone" value={member.phone} />
                  <InfoField label="Date de naissance" value={displayDate(member.birth_date)} />
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Contrat ── */}
          {activeTab === "contract" && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-zinc-900">Détails du contrat</h2>
                {!editingContract && (
                  <button
                    onClick={() => setEditingContract(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Modifier
                  </button>
                )}
              </div>

              {editingContract ? (
                <form onSubmit={handleSaveContract} className="flex flex-col gap-4">
                  <LabeledInput label="Poste / Métier">
                    <input type="text" value={contractForm.role} placeholder="Serveuse, Cuisinier…"
                      onChange={(e) => setContractForm((f) => ({ ...f, role: e.target.value }))}
                      className={INPUT_CLS} />
                  </LabeledInput>
                  <LabeledInput label="Type de contrat">
                    <select value={contractForm.contractType}
                      onChange={(e) => setContractForm((f) => ({ ...f, contractType: e.target.value }))}
                      className={INPUT_CLS}>
                      {CONTRACT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </LabeledInput>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <LabeledInput label="Heures / semaine">
                      <input type="number" min={1} max={60} value={contractForm.contractHours}
                        onChange={(e) => setContractForm((f) => ({ ...f, contractHours: Number(e.target.value) }))}
                        className={INPUT_CLS} />
                    </LabeledInput>
                    <LabeledInput label="Taux horaire (€)">
                      <input type="number" min={0} step={0.01} value={contractForm.hourlyRate}
                        onChange={(e) => setContractForm((f) => ({ ...f, hourlyRate: Number(e.target.value) }))}
                        className={INPUT_CLS} />
                    </LabeledInput>
                  </div>
                  <LabeledInput label="Date de début de contrat">
                    <input type="date" value={contractForm.startDate}
                      onChange={(e) => setContractForm((f) => ({ ...f, startDate: e.target.value }))}
                      className={INPUT_CLS} />
                  </LabeledInput>
                  {contractError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{contractError}</p>
                  )}
                  <div className="flex gap-3 mt-1">
                    <button type="button" onClick={() => setEditingContract(false)}
                      className="px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-600 hover:bg-zinc-50">
                      Annuler
                    </button>
                    <button type="submit" disabled={savingContract}
                      className="px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                      {savingContract ? "Enregistrement…" : "Enregistrer"}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-5">
                  <InfoField label="Poste" value={member.role} />
                  <InfoField label="Type de contrat" value={member.contract_type} />
                  <InfoField label="Heures / semaine" value={member.contract_hours ? `${member.contract_hours}h` : null} />
                  <InfoField label="Taux horaire" value={member.hourly_rate != null ? `${member.hourly_rate} €/h` : null} />
                  <InfoField label="Date de début" value={displayDate(member.start_date)} />
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Documents ── */}
          {activeTab === "docs" && (
            <section>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-zinc-900">Documents</h2>
                <button
                  onClick={() => { setUploadError(null); setShowUploadModal(true); }}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 active:bg-indigo-800 transition-colors"
                >
                  + Ajouter un document
                </button>
              </div>

              {docs.length === 0 ? (
                <p className="text-sm text-zinc-400">Aucun document enregistré pour cet employé.</p>
              ) : (
                <div className="rounded-lg border border-zinc-200 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-zinc-50 border-b border-zinc-200">
                      <tr>
                        {["Nom", "Type", "Date d'ajout", "Actions"].map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider ${h === "Actions" ? "text-right" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {docs.map((doc, i) => (
                        <tr
                          key={doc.id}
                          className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}`}
                        >
                          <td className="px-4 py-3 font-medium text-zinc-900 max-w-[200px] truncate">
                            {doc.file_name}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600">
                              {doc.file_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                            {new Date(doc.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-3">
                              <button
                                onClick={() => handleViewDoc(doc)}
                                title="Voir / télécharger"
                                className="text-base hover:opacity-60 transition-opacity"
                              >
                                👁
                              </button>
                              <button
                                onClick={() => handleDeleteDoc(doc)}
                                title="Supprimer"
                                className="text-base hover:opacity-60 transition-opacity"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* ── Tab: Temps & planification ── */}
          {activeTab === "time" && (
            <section className="flex flex-col gap-8">
              {/* Monthly hours */}
              <div>
                <h2 className="text-base font-semibold text-zinc-900 mb-4">
                  Heures travaillées (12 derniers mois)
                </h2>
                {monthlyData.length === 0 ? (
                  <p className="text-sm text-zinc-400">
                    Aucun shift enregistré sur les 12 derniers mois.
                  </p>
                ) : (
                  <div className="rounded-lg border border-zinc-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          {["Mois", "Shifts", "Heures planifiées", "Contrat mensuel"].map((h) => (
                            <th key={h} className={`px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider ${h === "Mois" ? "text-left" : "text-right"}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {monthlyData.map((entry, i) => {
                          const plannedH =
                            Math.round((entry.minutes / 60) * 10) / 10;
                          const contractMonthly = Math.round(
                            member.contract_hours * 4.33
                          );
                          const diff =
                            Math.round((plannedH - contractMonthly) * 10) / 10;
                          return (
                            <tr key={entry.month}
                              className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}`}>
                              <td className="px-4 py-2.5 font-medium text-zinc-900 capitalize">
                                {formatMonth(entry.month)}
                              </td>
                              <td className="px-4 py-2.5 text-right text-zinc-500">
                                {entry.count}
                              </td>
                              <td className="px-4 py-2.5 text-right font-medium text-zinc-800">
                                {plannedH}h
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <span className="text-zinc-500">{contractMonthly}h</span>
                                {diff !== 0 && (
                                  <span className={`ml-2 text-xs font-semibold ${diff > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                                    {diff > 0 ? "+" : ""}{diff}h
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div>
                <h2 className="text-base font-semibold text-zinc-900 mb-1">
                  Disponibilités hebdomadaires
                </h2>
                <p className="text-xs text-zinc-400 mb-4">
                  Cliquez sur un jour pour basculer la disponibilité.
                </p>
                <div className="flex flex-wrap gap-2">
                  {WEEK_DAYS.map(({ key, label }) => {
                    const available = availability[key] !== false;
                    return (
                      <button
                        key={key}
                        onClick={() => handleToggleAvailability(key)}
                        className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl border-2 transition-all min-w-[72px] ${
                          available
                            ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                            : "border-zinc-200 bg-zinc-50 text-zinc-400"
                        }`}
                      >
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-[11px]">
                          {available ? "Disponible" : "Indisponible"}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}
          {/* ── Tab: Rôle et permissions ── */}
          {activeTab === "role" && (
            <section>
              <h2 className="text-base font-semibold text-zinc-900 mb-5">Rôle et permissions</h2>

              <form onSubmit={handleSaveRole} className="flex flex-col gap-6">
                {/* Role selector */}
                <div className="flex flex-col gap-3">
                  {[
                    {
                      value: "employee",
                      label: "Employé",
                      description: "Peut se connecter et voir son planning uniquement",
                    },
                    {
                      value: "admin",
                      label: "Administrateur",
                      description: "Accès complet à toutes les fonctionnalités",
                    },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                        userRole === opt.value
                          ? "border-indigo-400 bg-indigo-50"
                          : "border-zinc-200 hover:border-zinc-300 bg-white"
                      }`}
                    >
                      <input
                        type="radio"
                        name="user_role"
                        value={opt.value}
                        checked={userRole === opt.value}
                        onChange={() => setUserRole(opt.value)}
                        className="mt-0.5 accent-indigo-600"
                      />
                      <div>
                        <p className="text-sm font-semibold text-zinc-900">{opt.label}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Permissions table */}
                <div>
                  <h3 className="text-sm font-semibold text-zinc-700 mb-3">Tableau des permissions</h3>
                  <div className="rounded-lg border border-zinc-200 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 border-b border-zinc-200">
                        <tr>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Permission</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Employé</th>
                          <th className="px-4 py-2.5 text-center text-xs font-medium text-zinc-500 uppercase tracking-wider">Admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { section: "Planning", label: "Voir son planning", employee: true, admin: true },
                          { section: null, label: "Créer / modifier / supprimer des shifts", employee: false, admin: true },
                          { section: "Équipe", label: "Voir la liste des employés", employee: false, admin: true },
                          { section: null, label: "Ajouter / modifier / supprimer un employé", employee: false, admin: true },
                          { section: "Configuration", label: "Accès aux établissements", employee: false, admin: true },
                        ].map((row, i) => (
                          <tr key={i} className={`border-b border-zinc-100 ${i % 2 === 0 ? "bg-white" : "bg-zinc-50/40"}`}>
                            <td className="px-4 py-2.5 text-zinc-700">
                              {row.section && (
                                <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mr-2">
                                  {row.section}
                                </span>
                              )}
                              {row.label}
                            </td>
                            <td className="px-4 py-2.5 text-center text-base">
                              {row.employee ? "✅" : "❌"}
                            </td>
                            <td className="px-4 py-2.5 text-center text-base">
                              {row.admin ? "✅" : "❌"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {roleError && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{roleError}</p>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={savingRole}
                    className="px-5 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60"
                  >
                    {savingRole ? "Enregistrement…" : "Enregistrer"}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>

      {/* ── Upload modal ── */}
      {showUploadModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUploadModal(false); }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-zinc-900">Ajouter un document</h2>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-full text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors text-xl leading-none"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleUpload} className="flex flex-col gap-4">
              <LabeledInput label="Type de document">
                <select value={uploadDocType} onChange={(e) => setUploadDocType(e.target.value)} className={INPUT_CLS}>
                  {DOC_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </LabeledInput>
              <LabeledInput label="Nom (optionnel)">
                <input type="text" value={uploadDocName}
                  onChange={(e) => setUploadDocName(e.target.value)}
                  placeholder="Contrat Marie Dupont — Avril 2026"
                  className={INPUT_CLS} />
              </LabeledInput>
              <LabeledInput label="Fichier PDF">
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </LabeledInput>
              {selectedFile && (
                <p className="text-xs text-zinc-400 -mt-2">
                  {selectedFile.name} — {Math.round(selectedFile.size / 1024)} Ko
                </p>
              )}
              {uploadError && (
                <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{uploadError}</p>
              )}
              <div className="flex gap-3 mt-1">
                <button type="button" onClick={() => setShowUploadModal(false)}
                  className="flex-1 rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={uploading || !selectedFile}
                  className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-60">
                  {uploading ? "Upload en cours…" : "Uploader"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-0.5">
        {label}
      </p>
      <p className="text-sm font-medium text-zinc-900">{value ?? "—"}</p>
    </div>
  );
}

function LabeledInput({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
