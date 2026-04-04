"use client";

import { useState, useEffect } from "react";

export default function AdminAprobacionesPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [mappedSpecialties, setMappedSpecialties] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("PENDING");

  const fetchApplications = async () => {
    setLoading(true);
    let url = '/api/professional-applications';
    if (filter !== 'ALL') url += `?status=${filter}`;
    
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error fetching data");
      const data = await res.json();
      setApplications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const res = await fetch('/api/specialties');
      if (res.ok) {
        const data = await res.json();
        setSpecialties(data);
      }
    } catch (e) {}
  }

  useEffect(() => {
    fetchApplications();
    fetchSpecialties();
  }, [filter]);

  const handleApprove = async (id: string) => {
    const specialtyId = mappedSpecialties[id];
    if (!specialtyId) {
       alert("Por favor selecciona la Especialidad equivalente antes de aprobar.");
       return;
    }

    if (!confirm("¿Aprobar esta solicitud y crear usuario?")) return;
    try {
      const res = await fetch(`/api/professional-applications/${id}/approve`, { 
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ specialtyId })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al aprobar");
      }
      await fetchApplications();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Motivo de rechazo (opcional):");
    if (reason === null) return; // cancelled
    try {
      const res = await fetch(`/api/professional-applications/${id}/reject`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al rechazar");
      }
      await fetchApplications();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <a href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-3">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Volver al Panel
          </a>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Aprobaciones de Profesionales</h1>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <select 
             value={filter} 
             onChange={e => setFilter(e.target.value)} 
             className="border border-slate-200 p-2.5 rounded-xl bg-white outline-none focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 shadow-sm font-semibold text-slate-700 w-full sm:w-auto"
           >
             <option value="ALL">Mostrar Todas</option>
             <option value="PENDING">Revisión Pendiente</option>
             <option value="APPROVED">Ya Aprobadas</option>
             <option value="REJECTED">Rechazadas</option>
           </select>
        </div>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha / Revisión</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Profesional</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Especialidad Escrita / Cédula</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado / Notas</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[240px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium">Cargando base médica...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-slate-500 font-medium bg-slate-50/50">No existen solicitudes bajo este criterio.</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5 text-sm text-slate-600 font-medium">
                    <div className="font-semibold text-slate-800">{new Date(app.createdAt).toLocaleDateString()}</div>
                    {app.reviewedAt && (
                        <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 mt-2" title="Fecha de revisión">
                           Rev: {new Date(app.reviewedAt).toLocaleDateString()}
                        </div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="font-bold text-slate-900 border-b border-slate-100 pb-1 mb-1">{app.name}</div>
                    <div className="text-xs text-slate-500 font-medium mt-2">{app.email}</div>
                    <div className="text-xs text-slate-500 font-medium mt-0.5">{app.phone}</div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-bold text-indigo-700 bg-indigo-50 inline-block px-2 py-1 rounded border border-indigo-100">{app.specialtyText}</div>
                    <div className="text-xs font-mono font-bold text-slate-500 mt-3 uppercase tracking-widest border border-slate-200 inline-block px-2 py-0.5 rounded shadow-sm">CÉD {app.professionalLicense}</div>
                  </td>
                  <td className="p-5 text-sm font-medium">
                     <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border ${
                        app.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        app.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                     }`}>
                        {app.status === 'PENDING' ? 'EN ESPERA' : app.status === 'APPROVED' ? 'APROBADA' : 'RECHAZADA'}
                     </span>
                     {app.status === 'REJECTED' && app.rejectionReason && (
                        <div className="text-[11px] font-medium text-rose-600 mt-3 bg-rose-50 p-2 rounded-lg border border-rose-100 w-full max-w-[200px] break-words">
                           <strong>Razón:</strong> {app.rejectionReason}
                        </div>
                     )}
                  </td>
                  <td className="p-5 text-right vertical-middle">
                    {app.status === 'PENDING' ? (
                      <div className="flex flex-col gap-2 justify-end items-end">
                        <select 
                           value={mappedSpecialties[app.id] || ''}
                           onChange={e => setMappedSpecialties({...mappedSpecialties, [app.id]: e.target.value})}
                           className="text-xs border border-slate-200 bg-white font-semibold text-slate-700 p-2 rounded-lg w-full max-w-[200px] outline-none focus:ring-2 focus:ring-indigo-100 shadow-sm"
                        >
                           <option value="" disabled>1. Enlazar Especialidad...</option>
                           {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="flex gap-2 w-full max-w-[200px]">
                           <button onClick={() => handleApprove(app.id)} className="flex-1 bg-emerald-600 text-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-emerald-700 shadow-sm transition">Aprobar</button>
                           <button onClick={() => handleReject(app.id)} className="flex-1 border border-rose-200 text-rose-700 bg-white px-3 py-2 text-xs font-bold rounded-lg hover:bg-rose-50 hover:border-rose-300 transition shadow-sm border-b-[3px]">Rechazar</button>
                        </div>
                      </div>
                    ) : app.status === 'APPROVED' && app.activationToken && process.env.NODE_ENV !== 'production' ? (
                      <a href={`/activar?token=${app.activationToken}`} target="_blank" className="text-indigo-600 hover:text-indigo-800 text-[11px] font-bold uppercase tracking-wider bg-indigo-50 px-2 py-1.5 rounded flex items-center justify-center gap-1 border border-indigo-100 w-max ml-auto shadow-sm transition">
                          Activar Test ↗
                      </a>
                    ) : (
                      <span className="text-slate-400 text-xs font-bold uppercase tracking-widest mr-2">Resuelta</span>
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
