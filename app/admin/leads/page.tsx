"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { exportAllLeadsAction } from "./actions";

type Lead = {
  id: string;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
  pageUrl?: string;
  status: string;
  createdAt: string;
  origin: { id: string; name: string };
};

const statusOptions = [
  { value: "NUEVO",      label: "Nuevo",      color: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "CONTACTADO", label: "Contactado", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "EN_PROCESO", label: "En Proceso", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "CERRADO",    label: "Cerrado",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "DESCARTADO", label: "Descartado", color: "bg-slate-100 text-slate-500 border-slate-200" },
];

const rangoOptions = [
  { value: "",              label: "Todos" },
  { value: "hoy",           label: "Hoy" },
  { value: "esta_semana",   label: "Esta Semana" },
  { value: "este_mes",      label: "Este Mes" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads]         = useState<Lead[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const [totalCount, setTotalCount]   = useState(0);

  // KPIs — fetched once without filters
  const [kpiData, setKpiData] = useState({ total: 0, esteMes: 0, estaSemana: 0, nuevos: 0 });

  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");
  const [filterRango, setFilterRango]   = useState("");
  const [startDate, setStartDate]       = useState("");
  const [endDate, setEndDate]           = useState("");

  // Close export menu on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ── Fetch KPI data (no filters, no pagination) ────────────────
  const fetchKPIs = async () => {
    try {
      const res = await fetch("/api/leads?limit=100000&page=1");
      if (!res.ok) return;
      const data = await res.json();
      const allLeads: Lead[] = data.leads || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);

      setKpiData({
        total: data.total || allLeads.length,
        esteMes: allLeads.filter(l => new Date(l.createdAt) >= startOfMonth).length,
        estaSemana: allLeads.filter(l => new Date(l.createdAt) >= startOfWeek).length,
        nuevos: allLeads.filter(l => l.status === "NUEVO").length,
      });
    } catch { /* silent */ }
  };

  // ── Fetch filtered + paginated leads ──────────────────────────
  const fetchLeads = async (page = currentPage) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (!startDate && !endDate && filterRango) params.set("rango", filterRango);
      params.set("page", String(page));
      params.set("limit", "10");

      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Error cargando leads");
      }

      const data = await res.json();
      setLeads(data.leads || []);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setCurrentPage(data.currentPage || 1);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchKPIs(); }, []);

  // When filters change, reset to page 1
  useEffect(() => {
    setCurrentPage(1);
    fetchLeads(1);
  }, [filterStatus, filterRango, startDate, endDate]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    fetchLeads(p);
  };

  // ── Actions ───────────────────────────────────────────────────
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      fetchLeads();
      fetchKPIs();
    } catch {
      alert("Error al actualizar estatus");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este lead permanentemente?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchLeads();
      fetchKPIs();
    } catch {
      alert("Error al eliminar");
    }
  };

  // ── CSV Export ─────────────────────────────────────────────────
  const generateCSV = (dataList: any[], filenameParam: string) => {
    const headers = ["Nombre", "Cédula", "Correo", "Teléfono", "Origen", "Página", "Status", "Fecha de Registro"];
    const rows = dataList.map(l => [
      l.nombre,
      l.cedula || "",
      l.email,
      l.telefono || "",
      l.origin?.name || "",
      l.pageUrl || "",
      statusOptions.find(s => s.value === l.status)?.label || l.status,
      new Date(l.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit", year: "numeric" }),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads-${filenameParam}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportFiltered = () => {
    generateCSV(leads, "filtrados");
    setExportMenuOpen(false);
  };

  const exportAll = async () => {
    setExportMenuOpen(false);
    try {
      const totalLeads = await exportAllLeadsAction();
      generateCSV(totalLeads, "todos");
    } catch (e: any) {
      alert(e.message || "Error al exportar todos los leads");
    }
  };

  const clearFilters = () => {
    setFilterStatus("");
    setFilterRango("");
    setStartDate("");
    setEndDate("");
  };

  const getStatusStyle = (status: string) =>
    statusOptions.find(s => s.value === status)?.color || "bg-slate-100 text-slate-600 border-slate-200";

  // ── KPI Cards ─────────────────────────────────────────────────
  const kpiCards = [
    {
      label: "Total de Leads", value: kpiData.total,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>),
      accent: "text-slate-600 bg-slate-50 border-slate-200", valueColor: "text-slate-900",
    },
    {
      label: "Este Mes", value: kpiData.esteMes,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>),
      accent: "text-indigo-600 bg-indigo-50 border-indigo-200", valueColor: "text-indigo-700",
    },
    {
      label: "Esta Semana", value: kpiData.estaSemana,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>),
      accent: "text-sky-600 bg-sky-50 border-sky-200", valueColor: "text-sky-700",
    },
    {
      label: "Sin Contactar", value: kpiData.nuevos,
      icon: (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>),
      accent: "text-amber-600 bg-amber-50 border-amber-200", valueColor: "text-amber-700",
    },
  ];

  // ── Pagination helpers ────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }, [currentPage, totalPages]);

  return (
    <main className="p-8 max-w-[90rem] mx-auto">
      {/* Header */}
      <div className="mb-8">
        <a href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Panel
        </a>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Centro de Leads</h1>
            <p className="text-slate-500 mt-1">Panel comercial — seguimiento de solicitudes desde formularios web externos.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"></span>
            {totalCount} resultado{totalCount !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpiCards.map(kpi => (
          <div key={kpi.label} className={`rounded-2xl border p-5 flex items-start gap-4 ${kpi.accent}`}>
            <div className="mt-0.5 opacity-70">{kpi.icon}</div>
            <div>
              <div className={`text-2xl font-extrabold tracking-tight ${kpi.valueColor}`}>{kpi.value}</div>
              <div className="text-xs font-bold uppercase tracking-wider mt-0.5 opacity-70">{kpi.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filtros + Exportar ─────────────────────────────────────── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none w-36">
            <option value="">Todos</option>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Período</label>
          <select value={filterRango} onChange={e => { setFilterRango(e.target.value); setStartDate(""); setEndDate(""); }}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none w-36">
            {rangoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Desde</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none w-[140px]" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Hasta</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none w-[140px]" />
        </div>

        <button onClick={clearFilters} title="Limpiar filtros"
          className="text-slate-400 hover:text-slate-700 transition p-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-transparent hover:border-slate-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Dropdown Exportar CSV */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Exportar CSV
            <svg className={`w-4 h-4 transition-transform ${exportMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {exportMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-xl shadow-lg z-50 overflow-hidden text-sm font-medium text-slate-700">
              <button onClick={exportFiltered} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition border-b border-slate-50 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                Exportar Filtrados
              </button>
              <button onClick={exportAll} className="w-full text-left px-4 py-3 hover:bg-slate-50 transition flex items-center gap-2">
                 <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
                 Exportar Todos
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      {/* ── Tabla ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cédula</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa (Origen)</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Página</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[80px] text-right">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="p-10 text-center text-slate-500 font-medium">Cargando leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={8} className="p-14 text-center text-slate-400 font-medium">No hay leads registrados.</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    <td className="p-5">
                      <div className="font-bold text-slate-900 text-sm">{lead.nombre}</div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-medium text-slate-600 font-mono">{lead.cedula || "—"}</span>
                    </td>
                    <td className="p-5">
                      <div className="text-sm text-slate-700">{lead.email}</div>
                      {lead.telefono && <div className="text-xs text-slate-400 mt-0.5">{lead.telefono}</div>}
                    </td>
                    <td className="p-5">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-200">
                        {lead.origin?.name || "—"}
                      </span>
                    </td>
                    <td className="p-5">
                      {lead.pageUrl ? (
                        <a href={lead.pageUrl} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition border border-transparent hover:border-indigo-100"
                          title={lead.pageUrl}>
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                          </svg>
                          Ver Página
                        </a>
                      ) : (
                        <span className="text-[11px] font-medium text-slate-400 px-2">—</span>
                      )}
                    </td>
                    <td className="p-5" onClick={e => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider py-1.5 px-2.5 outline-none cursor-pointer rounded-lg border ${getStatusStyle(lead.status)}`}
                      >
                        {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="p-5 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        {new Date(lead.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>
                    <td className="p-5 text-right">
                      <button onClick={() => handleDelete(lead.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1.5 rounded-lg transition">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Paginación ───────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs font-semibold text-slate-400">
              Página {currentPage} de {totalPages} · {totalCount} leads totales
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button onClick={() => goToPage(1)}
                    className="w-8 h-8 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    1
                  </button>
                  {pageNumbers[0] > 2 && <span className="text-slate-300 text-xs px-1">…</span>}
                </>
              )}

              {pageNumbers.map(p => (
                <button key={p} onClick={() => goToPage(p)}
                  className={`w-8 h-8 text-xs font-bold rounded-lg transition ${
                    p === currentPage
                      ? "bg-indigo-600 text-white border border-indigo-600 shadow-sm"
                      : "text-slate-500 bg-white border border-slate-200 hover:bg-slate-50"
                  }`}>
                  {p}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && <span className="text-slate-300 text-xs px-1">…</span>}
                  <button onClick={() => goToPage(totalPages)}
                    className="w-8 h-8 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    {totalPages}
                  </button>
                </>
              )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="px-3 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
