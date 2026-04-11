"use client";

import { useState, useEffect } from "react";

type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  professionalLicense: string;
  specialtyId?: string;
  specialty?: { id: string; name: string };
  status: "PENDING_ACTIVATION" | "ACTIVE" | "INACTIVE";
  createdAt: string;
};

type Specialty = { id: string; name: string };

export default function AdminDoctoresPage() {
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state
  const [editDoctor, setEditDoctor] = useState<Doctor | null>(null);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState("");

  // Form fields
  const [form, setForm] = useState({
    name: "", email: "", phone: "", professionalLicense: "",
    specialtyId: "", status: "ACTIVE", newPassword: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, specRes] = await Promise.all([
        fetch("/api/admin/doctores"),
        fetch("/api/specialties"),
      ]);
      if (!docRes.ok) throw new Error("Error cargando doctores");
      setDoctores(await docRes.json());
      if (specRes.ok) setSpecialties(await specRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/doctores/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Error al cambiar el estado");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const openEdit = (doc: Doctor) => {
    setEditDoctor(doc);
    setModalError("");
    setForm({
      name: doc.name || "",
      email: doc.email || "",
      phone: doc.phone || "",
      professionalLicense: doc.professionalLicense || "",
      specialtyId: doc.specialty?.id || doc.specialtyId || "",
      status: doc.status || "ACTIVE",
      newPassword: "",
    });
  };

  const closeEdit = () => {
    setEditDoctor(null);
    setModalError("");
  };

  const handleSave = async () => {
    if (!editDoctor) return;
    if (!form.name.trim() || !form.email.trim()) {
      setModalError("Nombre y correo son obligatorios");
      return;
    }
    setSaving(true);
    setModalError("");
    try {
      const res = await fetch(`/api/admin/doctores/${editDoctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      closeEdit();
      fetchData();
    } catch (e: any) {
      setModalError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const statusStyle = (s: string) =>
    s === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "INACTIVE" ? "bg-red-50 text-red-700 border-red-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition";
  const labelClass = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <main className="p-8">
      <div className="mb-10 flex flex-col justify-start items-start gap-2">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Directorio de Médicos</h1>
        <p className="text-slate-500 font-medium">Gestión de usuarios activos con rol DOCTOR en la plataforma.</p>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Información Médico</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Credenciales</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Fecha Registro</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-center w-[160px]">Estado</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right w-[80px]">Acc.</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium">Consultando directorio...</td></tr>
              ) : doctores.length === 0 ? (
                <tr><td colSpan={5} className="p-10 text-center text-slate-500 font-medium bg-slate-50/50">No hay doctores en el sistema.</td></tr>
              ) : (
                doctores.map(doc => (
                  <tr key={doc.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition">
                    {/* Info */}
                    <td className="p-5">
                      <div className="font-bold text-slate-900 text-sm">{doc.name}</div>
                      <div className="text-xs font-medium text-slate-500 mt-0.5">{doc.email}</div>
                      {doc.phone && doc.phone !== "N/D" && (
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">{doc.phone}</div>
                      )}
                    </td>

                    {/* Credenciales */}
                    <td className="p-5">
                      <div className="text-sm font-bold text-slate-700">{doc.specialty?.name || "Sin especialidad"}</div>
                      <div className="text-xs font-medium text-slate-400 mt-0.5">
                        Cédula: {doc.professionalLicense || "N/A"}
                      </div>
                    </td>

                    {/* Fecha */}
                    <td className="p-5">
                      <div className="text-sm font-semibold text-slate-500">
                        {new Date(doc.createdAt).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="p-5 align-middle">
                      <select
                        value={doc.status}
                        onChange={e => handleStatusChange(doc.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider py-2 px-3 outline-none cursor-pointer rounded-lg border w-full transition ${statusStyle(doc.status)}`}
                      >
                        <option value="PENDING_ACTIVATION">P. Activación</option>
                        <option value="ACTIVE">Activo</option>
                        <option value="INACTIVE">Inactivo</option>
                      </select>
                    </td>

                    {/* Acciones — Icono de lápiz */}
                    <td className="p-5 text-right align-middle">
                      <button
                        onClick={() => openEdit(doc)}
                        title="Editar médico"
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition ml-auto"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modal de Edición ──────────────────────────────────────── */}
      {editDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={closeEdit} />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Editar Médico</h2>
                <p className="text-xs text-slate-400 mt-0.5">{editDoctor.email}</p>
              </div>
              <button onClick={closeEdit} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-700 text-sm font-medium rounded-xl">{modalError}</div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Nombre *</label>
                  <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Correo Electrónico *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className={inputClass} placeholder="+52 000 000 0000" />
                </div>
                <div>
                  <label className={labelClass}>Cédula Profesional</label>
                  <input type="text" value={form.professionalLicense} onChange={e => setForm({ ...form, professionalLicense: e.target.value })} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Especialidad</label>
                  <select value={form.specialtyId} onChange={e => setForm({ ...form, specialtyId: e.target.value })} className={inputClass}>
                    <option value="">Sin especialidad</option>
                    {specialties.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={inputClass}>
                    <option value="ACTIVE">Activo</option>
                    <option value="INACTIVE">Inactivo</option>
                    <option value="PENDING_ACTIVATION">Pendiente Activación</option>
                  </select>
                </div>
              </div>

              {/* Sección de contraseña */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-2">
                <h3 className="text-xs font-bold text-slate-600 mb-1 uppercase tracking-wider">Seguridad</h3>
                <p className="text-[11px] text-slate-400 mb-3">Déjalo vacío si no deseas cambiar la contraseña.</p>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={e => setForm({ ...form, newPassword: e.target.value })}
                  className={inputClass}
                  placeholder="Nueva contraseña (mín. 6 caracteres)"
                  minLength={6}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={closeEdit} className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                  </svg>
                )}
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
