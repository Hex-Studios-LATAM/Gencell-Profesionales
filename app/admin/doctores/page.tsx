"use client";

import { useState, useEffect } from "react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  professionalLicense: string;
  specialty?: { name: string };
  status: "PENDING_ACTIVATION" | "ACTIVE" | "INACTIVE";
  createdAt: string;
};

export default function AdminDoctoresPage() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/doctores");
      if (!res.ok) throw new Error("Error cargando el listado de doctores");
      setDoctores(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/doctores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Error al cambiar el estado");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleEditCedula = async (id: string, currentCedula: string) => {
    const newCedula = prompt("Ingrese nueva cédula profesional", currentCedula);
    if (newCedula === null) return;
    try {
      const res = await fetch(`/api/admin/doctores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ professionalLicense: newCedula })
      });
      if (!res.ok) throw new Error("Error al actualizar la cédula");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <main className="p-8">
      <div className="mb-10 flex flex-col justify-start items-start gap-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Directorio de Médicos</h1>
        <p className="text-slate-500 font-medium">Gestión de usuarios activos con rol DOCTOR en la plataforma.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Información Médico</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Credenciales</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Registro</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-[160px]">Estado</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium">Consultando directoriio...</td></tr>
            ) : doctores.length === 0 ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">No hay doctores en el sistema.</td></tr>
            ) : (
              doctores.map(doc => (
                <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="font-bold text-slate-900 focus:outline-none">{doc.name}</div>
                    <div className="text-xs font-medium text-slate-500 mt-1">{doc.email}</div>
                    {doc.phone !== "N/D" && (
                       <div className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{doc.phone}</div>
                    )}
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-bold text-slate-700">{doc.specialty?.name || "Sin especialidad homologada"}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-xs font-medium text-slate-400">Cédula: {doc.professionalLicense || "N/A"}</div>
                      <button onClick={() => handleEditCedula(doc.id, doc.professionalLicense || "")} className="text-[10px] text-indigo-600 font-semibold hover:underline">Editar</button>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="text-sm font-semibold text-slate-500">{new Date(doc.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5 align-middle">
                     <select 
                       value={doc.status}
                       onChange={(e) => handleStatusChange(doc.id, e.target.value)}
                       className={`text-[10px] font-bold uppercase tracking-wider py-2 px-3 outline-none cursor-pointer rounded-lg border w-full transition ${
                         doc.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 
                         doc.status === 'INACTIVE' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' : 
                         'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                       }`}
                     >
                       <option value="PENDING_ACTIVATION">P. Activación</option>
                       <option value="ACTIVE">Activo</option>
                       <option value="INACTIVE">Inactivo</option>
                     </select>
                  </td>
                  <td className="p-5 text-right align-middle">
                     <div className="flex items-center justify-end gap-2">
                        <button onClick={() => alert("Función de edición en desarrollo")} className="text-slate-400 hover:text-indigo-600 font-medium text-xs bg-slate-50 hover:bg-indigo-50 px-3 py-2 rounded-lg transition border border-slate-100 shadow-sm whitespace-nowrap">
                          Editar / Ver
                        </button>
                     </div>
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
