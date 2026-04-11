"use client";

import { useState, useEffect } from "react";

type Lead = {
  id: string;
  nombre: string;
  cedula: string;
  email: string;
  telefono: string;
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

export default function AdminLeadsPage() {
  const [leads, setLeads]       = useState<Lead[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  // Filtros
  const [filterStatus, setFilterStatus] = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set("status", filterStatus);
      const res = await fetch(`/api/leads?${params.toString()}`);
      if (!res.ok) throw new Error("Error cargando leads");
      setLeads(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al actualizar");
      fetchLeads();
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
    } catch {
      alert("Error al eliminar");
    }
  };

  const getStatusStyle = (status: string) =>
    statusOptions.find(s => s.value === status)?.color || "bg-slate-100 text-slate-600 border-slate-200";

  return (
    <main className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <a href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Panel
        </a>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Leads</h1>
            <p className="text-slate-500 mt-1">Solicitudes recibidas desde formularios web externos.</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"></span>
            {leads.length} resultado{leads.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
            <option value="">Todos</option>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <button onClick={() => setFilterStatus("")}
          className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition px-3 py-2">
          Limpiar filtros
        </button>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cédula</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Empresa (Origen)</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[80px] text-right">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="p-10 text-center text-slate-500 font-medium">Cargando leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={7} className="p-14 text-center text-slate-400 font-medium">No hay leads registrados.</td></tr>
              ) : (
                leads.map(lead => (
                  <tr key={lead.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    {/* Nombre */}
                    <td className="p-5">
                      <div className="font-bold text-slate-900 text-sm">{lead.nombre}</div>
                    </td>

                    {/* Cédula */}
                    <td className="p-5">
                      <span className="text-sm font-medium text-slate-600 font-mono">{lead.cedula || "—"}</span>
                    </td>

                    {/* Contacto */}
                    <td className="p-5">
                      <div className="text-sm text-slate-700">{lead.email}</div>
                      {lead.telefono && <div className="text-xs text-slate-400 mt-0.5">{lead.telefono}</div>}
                    </td>

                    {/* Empresa (Origen) */}
                    <td className="p-5">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 inline-block px-2 py-0.5 rounded border border-indigo-200">
                        {lead.origin.name}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="p-5" onClick={e => e.stopPropagation()}>
                      <select
                        value={lead.status}
                        onChange={e => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold uppercase tracking-wider py-1.5 px-2.5 outline-none cursor-pointer rounded-lg border ${getStatusStyle(lead.status)}`}
                      >
                        {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>

                    {/* Fecha */}
                    <td className="p-5 text-xs font-semibold text-slate-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      <div className="text-[10px] text-slate-300 mt-0.5">
                        {new Date(lead.createdAt).toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    {/* Acciones */}
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
      </div>
    </main>
  );
}
