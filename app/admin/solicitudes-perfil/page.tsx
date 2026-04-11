"use client";

import { useState, useEffect } from "react";

type Request = {
  id: string;
  userId: string;
  fieldType: string;
  currentValue: string;
  requestedValue: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  user: {
    name: string;
    email: string;
    professionalLicense: string | null;
  }
};

export default function SolicitudesPerfilPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/profile-requests");
      if (!res.ok) throw new Error("Error cargando solicitudes");
      setRequests(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    let reason = "";
    if (action === "REJECT") {
      const input = prompt("¿Cuál es el motivo del rechazo? (Opcional)");
      if (input === null) return;
      reason = input;
    } else {
      if (!confirm("¿Estás seguro de aprobar este cambio de nombre?")) return;
    }

    setProcessing(id);
    setError("");
    try {
      const res = await fetch(`/api/admin/profile-requests/${id}`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ action, reason })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Error ${res.status} al procesar la solicitud`);
      }
      fetchData();
    } catch(e: any) {
      setError(e.message);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-10 flex flex-col justify-start items-start gap-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Solicitudes de Cambio de Perfil</h1>
        <p className="text-slate-500 font-medium">Revisa y aprueba los cambios de nombre solicitados por los doctores.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Doctor</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Cambio Solicitado</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium">Cargando solicitudes...</td></tr>
            ) : requests.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">No hay solicitudes pendientes.</td></tr>
            ) : (
              requests.map(req => (
                <tr key={req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="font-bold text-slate-900">{req.user.name}</div>
                    <div className="text-xs text-slate-500">{req.user.email}</div>
                    <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Cédula: {req.user.professionalLicense || "N/D"}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm">
                      <span className="text-slate-400 line-through mr-2">{req.currentValue}</span>
                      <span className="font-bold text-indigo-600">→ {req.requestedValue}</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">Fecha: {new Date(req.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5">
                     <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                     }`}>
                        {req.status === 'APPROVED' ? 'Aprobado' : req.status === 'REJECTED' ? 'Rechazado' : 'Pendiente'}
                     </span>
                  </td>
                  <td className="p-5 text-right">
                    {req.status === 'PENDING' && (
                       <div className="flex items-center justify-end gap-2">
                           <button onClick={() => handleAction(req.id, "APPROVE")} disabled={processing === req.id} className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                             {processing === req.id ? "Procesando…" : "Aprobar"}
                           </button>
                           <button onClick={() => handleAction(req.id, "REJECT")} disabled={processing === req.id} className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed">
                             Rechazar
                           </button>
                       </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
