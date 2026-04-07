"use client";

import { useState, useEffect } from "react";

type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
  sourceType: string;
  sourceId?: string;
  sourceLabel?: string;
  intent: string;
  status: string;
  channel: string;
  websiteName?: string;
  formName?: string;
  pageUrl?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  createdAt: string;
  user?: { name: string; email: string };
};

const sourceLabels: Record<string, string> = {
  HOME_CTA:        "Dashboard",
  PRODUCT_CTA:     "Producto",
  NEWS_CTA:        "Noticia",
  WHITE_PAPER_CTA: "White Paper",
  ARTICLE_CTA:     "Artículo",
  ELEMENTOR_FORM:  "Form. Elementor",
  EXTERNAL_FORM:   "Form. Externo",
};

const intentLabels: Record<string, string> = {
  PERSONALIZED_ATTENTION: "Atención",
  ORDER_REQUEST:          "Pedido",
  GENERAL_INQUIRY:        "Consulta",
};

const statusOptions = [
  { value: "NEW",         label: "Nuevo",      color: "bg-sky-50 text-sky-700 border-sky-200" },
  { value: "CONTACTED",   label: "Contactado", color: "bg-amber-50 text-amber-700 border-amber-200" },
  { value: "IN_PROGRESS", label: "En Proceso", color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  { value: "CLOSED",      label: "Cerrado",    color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { value: "DISCARDED",   label: "Descartado", color: "bg-slate-100 text-slate-500 border-slate-200" },
];

export default function AdminLeadsPage() {
  const [leads, setLeads]               = useState<Lead[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [expanded, setExpanded]         = useState<string | null>(null);

  // Filtros
  const [filterStatus,  setFilterStatus]  = useState("");
  const [filterChannel, setFilterChannel] = useState("");
  const [filterSource,  setFilterSource]  = useState("");

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterStatus)  params.set("status",     filterStatus);
      if (filterChannel) params.set("channel",    filterChannel);
      if (filterSource)  params.set("sourceType", filterSource);
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
  }, [filterStatus, filterChannel, filterSource]);

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
      if (expanded === id) setExpanded(null);
      fetchLeads();
    } catch {
      alert("Error al eliminar");
    }
  };

  const getStatusStyle = (status: string) =>
    statusOptions.find(s => s.value === status)?.color || "bg-slate-100 text-slate-600 border-slate-200";

  const portalCount  = leads.filter(l => l.channel === "PORTAL").length;
  const websiteCount = leads.filter(l => l.channel === "WEBSITE").length;

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
            <p className="text-slate-500 mt-1">Solicitudes del portal médico y formularios web externos.</p>
          </div>

          {/* Contadores por canal */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => { setFilterChannel(filterChannel === "PORTAL" ? "" : "PORTAL"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition ${
                filterChannel === "PORTAL"
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              }`}
            >
              <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
              Portal Médico
              <span className="font-bold">{portalCount}</span>
            </div>
            <div
              onClick={() => { setFilterChannel(filterChannel === "WEBSITE" ? "" : "WEBSITE"); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold cursor-pointer transition ${
                filterChannel === "WEBSITE"
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
              }`}
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
              Sitios Web
              <span className="font-bold">{websiteCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Canal</label>
          <select value={filterChannel} onChange={e => setFilterChannel(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
            <option value="">Todos los canales</option>
            <option value="PORTAL">Portal Médico</option>
            <option value="WEBSITE">Sitios Web / Elementor</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
            <option value="">Todos</option>
            {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">Origen</label>
          <select value={filterSource} onChange={e => setFilterSource(e.target.value)}
            className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none">
            <option value="">Todos</option>
            <optgroup label="Portal Médico">
              <option value="HOME_CTA">Dashboard</option>
              <option value="PRODUCT_CTA">Producto</option>
              <option value="NEWS_CTA">Noticia</option>
              <option value="WHITE_PAPER_CTA">White Paper</option>
              <option value="ARTICLE_CTA">Artículo</option>
            </optgroup>
            <optgroup label="Sitios Web">
              <option value="ELEMENTOR_FORM">Formulario Elementor</option>
              <option value="EXTERNAL_FORM">Formulario Externo</option>
            </optgroup>
          </select>
        </div>
        <button onClick={() => { setFilterStatus(""); setFilterChannel(""); setFilterSource(""); }}
          className="text-sm font-semibold text-slate-400 hover:text-slate-700 transition px-3 py-2">
          Limpiar filtros
        </button>
        <div className="ml-auto flex items-center gap-2 text-sm font-bold text-slate-400">
          <span className="w-2.5 h-2.5 bg-sky-400 rounded-full animate-pulse"></span>
          {leads.length} resultado{leads.length !== 1 ? "s" : ""}
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      {/* Tabla */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Contacto</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Canal / Origen</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Intención</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[80px] text-right">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="p-10 text-center text-slate-500 font-medium">Cargando leads...</td></tr>
              ) : leads.length === 0 ? (
                <tr><td colSpan={6} className="p-14 text-center text-slate-400 font-medium">No hay leads registrados.</td></tr>
              ) : (
                leads.map(lead => (
                  <>
                    <tr key={lead.id}
                      className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition cursor-pointer"
                      onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                    >
                      {/* Contacto */}
                      <td className="p-5">
                        <div className="font-bold text-slate-900 text-sm">{lead.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{lead.email}</div>
                        {lead.phone && <div className="text-xs text-slate-400 mt-0.5">{lead.phone}</div>}
                        {lead.message && (
                          <div className="text-xs text-slate-500 mt-1.5 bg-slate-50 border border-slate-100 rounded-lg p-2 max-w-[220px] line-clamp-2 italic">
                            {lead.message}
                          </div>
                        )}
                      </td>

                      {/* Canal / Origen */}
                      <td className="p-5">
                        {/* Badge canal */}
                        <div className="flex items-center gap-1.5 mb-1.5">
                          {lead.channel === "WEBSITE" ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded border border-emerald-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>Web
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold rounded border border-blue-200 uppercase tracking-wider">
                              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full"></span>Portal
                            </span>
                          )}
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {sourceLabels[lead.sourceType] || lead.sourceType}
                          </span>
                        </div>

                        {/* Detalles web */}
                        {lead.channel === "WEBSITE" && (
                          <div className="space-y-0.5">
                            {lead.websiteName && (
                              <div className="text-xs font-semibold text-slate-600">{lead.websiteName}</div>
                            )}
                            {lead.formName && lead.formName !== lead.sourceLabel && (
                              <div className="text-xs text-slate-400">{lead.formName}</div>
                            )}
                            {lead.pageUrl && (
                              <a href={lead.pageUrl} target="_blank" rel="noreferrer"
                                className="text-[10px] text-blue-500 hover:underline truncate block max-w-[180px]"
                                onClick={e => e.stopPropagation()}
                              >
                                {lead.pageUrl.replace(/^https?:\/\//, '').slice(0, 35)}…
                              </a>
                            )}
                          </div>
                        )}

                        {/* Detalles portal */}
                        {lead.channel === "PORTAL" && lead.user && (
                          <div className="text-xs text-slate-500 mt-0.5">Dr. {lead.user.name}</div>
                        )}
                        {lead.sourceLabel && (
                          <div className="text-xs text-slate-400 mt-0.5 max-w-[150px] truncate">{lead.sourceLabel}</div>
                        )}
                      </td>

                      {/* Intención */}
                      <td className="p-5">
                        <span className="text-sm font-medium text-slate-600">
                          {intentLabels[lead.intent] || lead.intent}
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
                      <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                        <button onClick={() => handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1.5 rounded-lg transition">
                          Eliminar
                        </button>
                      </td>
                    </tr>

                    {/* Panel expandido: datos UTM + info adicional */}
                    {expanded === lead.id && (
                      <tr key={`${lead.id}-expanded`} className="bg-slate-50">
                        <td colSpan={6} className="px-8 py-5 border-b border-slate-100">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                            {lead.channel === "WEBSITE" && (
                              <>
                                <div>
                                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Sitio</p>
                                  <p className="text-slate-700 font-medium">{lead.websiteName || "—"}</p>
                                </div>
                                <div>
                                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Formulario</p>
                                  <p className="text-slate-700 font-medium">{lead.formName || "—"}</p>
                                </div>
                                <div>
                                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Página</p>
                                  {lead.pageUrl ? (
                                    <a href={lead.pageUrl} target="_blank" rel="noreferrer"
                                      className="text-blue-500 hover:underline font-medium break-all">
                                      {lead.pageUrl}
                                    </a>
                                  ) : <p className="text-slate-700 font-medium">—</p>}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">UTMs</p>
                                  <div className="space-y-0.5 text-slate-600">
                                    {lead.utmSource   && <p><span className="text-slate-400">source:</span> {lead.utmSource}</p>}
                                    {lead.utmMedium   && <p><span className="text-slate-400">medium:</span> {lead.utmMedium}</p>}
                                    {lead.utmCampaign && <p><span className="text-slate-400">campaign:</span> {lead.utmCampaign}</p>}
                                    {!lead.utmSource && !lead.utmMedium && !lead.utmCampaign && <p className="text-slate-400">Sin datos UTM</p>}
                                  </div>
                                </div>
                              </>
                            )}
                            {lead.channel === "PORTAL" && lead.user && (
                              <>
                                <div>
                                  <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Doctor</p>
                                  <p className="text-slate-700 font-medium">Dr. {lead.user.name}</p>
                                  <p className="text-slate-400">{lead.user.email}</p>
                                </div>
                              </>
                            )}
                            <div>
                              <p className="font-bold text-slate-400 uppercase tracking-wider mb-1">Mensaje completo</p>
                              <p className="text-slate-600 leading-relaxed">{lead.message || "Sin mensaje"}</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
