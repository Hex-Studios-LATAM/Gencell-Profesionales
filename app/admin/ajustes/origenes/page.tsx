"use client";

import { useState, useEffect } from "react";

type LeadOrigin = {
  id: string;
  name: string;
  domain: string | null;
  token: string;
  createdAt: string;
  _count: { leads: number };
};

export default function AdminOrigenesPage() {
  const [origins, setOrigins] = useState<LeadOrigin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [saving, setSaving] = useState(false);

  // Token visible toggle
  const [visibleToken, setVisibleToken] = useState<string | null>(null);

  const fetchOrigins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lead-origins");
      if (!res.ok) throw new Error("Error cargando orígenes");
      setOrigins(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrigins();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/lead-origins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), domain: domain.trim() || null }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear origen");
      }
      setName("");
      setDomain("");
      setSuccess("Origen creado exitosamente");
      fetchOrigins();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este origen de leads?")) return;
    setError("");
    try {
      const res = await fetch(`/api/lead-origins/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar");
      }
      fetchOrigins();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token);
    setSuccess("Token copiado al portapapeles");
    setTimeout(() => setSuccess(""), 3000);
  };

  const getWebhookUrl = (token: string) => {
    if (typeof window !== "undefined") {
      return `${window.location.origin}/api/webhooks/leads?token=${token}`;
    }
    return `/api/webhooks/leads?token=${token}`;
  };

  return (
    <main className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <a
          href="/admin"
          className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al Panel
        </a>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Orígenes de Leads
        </h1>
        <p className="text-slate-500 mt-1">
          Administra los sitios web que envían leads vía webhook. Cada origen tiene un token único para validar las peticiones.
        </p>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl mb-6 text-sm font-medium">
          {success}
        </div>
      )}

      {/* Formulario crear */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm mb-8">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Nuevo Origen</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Nombre del Sitio *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Gencell Biotechnology"
              required
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider">
              Dominio (opcional)
            </label>
            <input
              type="url"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="https://gencellbiotechnology.com"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="px-6 py-2.5 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creando..." : "Crear Origen"}
          </button>
        </form>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Sitio</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Dominio</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Leads</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Token / Webhook</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[80px] text-right">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-slate-500 font-medium">
                    Cargando orígenes...
                  </td>
                </tr>
              ) : origins.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-14 text-center text-slate-400 font-medium">
                    No hay orígenes configurados.
                  </td>
                </tr>
              ) : (
                origins.map((origin) => (
                  <tr
                    key={origin.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                  >
                    {/* Sitio */}
                    <td className="p-5">
                      <div className="font-bold text-slate-900 text-sm">{origin.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {new Date(origin.createdAt).toLocaleDateString("es-MX", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Dominio */}
                    <td className="p-5">
                      {origin.domain ? (
                        <a
                          href={origin.domain}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm text-blue-500 hover:underline truncate block max-w-[200px]"
                        >
                          {origin.domain.replace(/^https?:\/\//, "")}
                        </a>
                      ) : (
                        <span className="text-sm text-slate-300">—</span>
                      )}
                    </td>

                    {/* Leads count */}
                    <td className="p-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-700 text-sm font-bold rounded-lg border border-slate-200">
                        {origin._count.leads}
                      </span>
                    </td>

                    {/* Token / Webhook */}
                    <td className="p-5">
                      {visibleToken === origin.id ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-mono break-all max-w-[220px]">
                              {origin.token.slice(0, 16)}...
                            </code>
                            <button
                              onClick={() => copyToken(origin.token)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                            >
                              Copiar
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => copyToken(getWebhookUrl(origin.token))}
                              className="text-xs font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                            >
                              Copiar URL Webhook
                            </button>
                            <button
                              onClick={() => setVisibleToken(null)}
                              className="text-xs text-slate-400 hover:text-slate-600"
                            >
                              Ocultar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setVisibleToken(origin.id)}
                          className="text-xs font-bold text-slate-500 hover:text-indigo-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
                        >
                          Mostrar token
                        </button>
                      )}
                    </td>

                    {/* Acciones */}
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleDelete(origin.id)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                      >
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
