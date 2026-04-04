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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <a href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition mb-2">
             ← Volver al Panel
          </a>
          <h1 className="text-3xl font-bold text-gray-900">Aprobaciones de Profesionales</h1>
        </div>
        <div className="flex gap-2">
           <select 
             value={filter} 
             onChange={e => setFilter(e.target.value)} 
             className="border p-2 rounded bg-white outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
           >
             <option value="ALL">Todas</option>
             <option value="PENDING">Pendientes</option>
             <option value="APPROVED">Aprobadas</option>
             <option value="REJECTED">Rechazadas</option>
           </select>
        </div>
      </div>

      {error && <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded mb-4">{error}</div>}

      <div className="bg-white border rounded shadow-sm overflow-x-auto overflow-y-visible">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-3 font-medium text-gray-600">Fecha / Revisión</th>
              <th className="p-3 font-medium text-gray-600">Nombre / Correo / Tel.</th>
              <th className="p-3 font-medium text-gray-600">Especialidad Escrita / Cédula</th>
              <th className="p-3 font-medium text-gray-600">Estado / Notas</th>
              <th className="p-3 font-medium text-gray-600 w-[240px] text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">Cargando...</td></tr>
            ) : applications.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No hay solicitudes para mostrar.</td></tr>
            ) : (
              applications.map(app => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                  <td className="p-3 text-sm text-gray-600">
                    <div>{new Date(app.createdAt).toLocaleDateString()}</div>
                    {app.reviewedAt && (
                        <div className="text-xs text-gray-400 mt-1" title="Fecha de revisión">
                           Rev: {new Date(app.reviewedAt).toLocaleDateString()}
                        </div>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-gray-900">{app.name}</div>
                    <div className="text-xs text-gray-500">{app.email}</div>
                    <div className="text-xs text-gray-500">{app.phone}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-sm text-gray-800 font-medium">{app.specialtyText}</div>
                    <div className="text-xs text-gray-500 font-mono mt-1">Cédula: {app.professionalLicense}</div>
                  </td>
                  <td className="p-3 text-sm font-medium">
                     <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                        app.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                        {app.status}
                     </span>
                     {app.status === 'REJECTED' && app.rejectionReason && (
                        <div className="text-xs text-red-500 mt-2 bg-red-50 p-1 rounded border border-red-100 w-full max-w-[200px] break-words">
                           <strong>Razón:</strong> {app.rejectionReason}
                        </div>
                     )}
                     {app.notes && (
                         <div className="text-[10px] text-gray-500 mt-1 max-w-[200px] truncate" title={app.notes}>
                            Nota: {app.notes}
                         </div>
                     )}
                  </td>
                  <td className="p-3 text-right vertical-middle">
                    {app.status === 'PENDING' ? (
                      <div className="flex flex-col gap-2 justify-end items-end">
                        <select 
                           value={mappedSpecialties[app.id] || ''}
                           onChange={e => setMappedSpecialties({...mappedSpecialties, [app.id]: e.target.value})}
                           className="text-xs border p-1 rounded w-full max-w-[180px] outline-none"
                        >
                           <option value="" disabled>Selecciona Especialidad...</option>
                           {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                        <div className="flex gap-2">
                           <button onClick={() => handleApprove(app.id)} className="bg-green-600 text-white px-3 py-1 text-xs rounded hover:bg-green-700 transition">Aprobar</button>
                           <button onClick={() => handleReject(app.id)} className="border border-red-200 text-red-600 bg-red-50 px-3 py-1 text-xs rounded hover:bg-red-100 transition">Rechazar</button>
                        </div>
                      </div>
                    ) : app.status === 'APPROVED' && app.activationToken && process.env.NODE_ENV !== 'production' ? (
                      <a href={`/activar?token=${app.activationToken}`} target="_blank" className="text-blue-500 hover:text-blue-700 text-xs font-medium underline flex items-center justify-end gap-1">
                          Test Link Activar ↗
                      </a>
                    ) : (
                      <span className="text-gray-400 text-sm">Resuelta</span>
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
