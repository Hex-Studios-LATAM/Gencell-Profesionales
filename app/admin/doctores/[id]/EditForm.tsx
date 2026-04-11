"use client";

import { useActionState } from "react";
import { updateDoctorAction } from "./actions";
import Link from "next/link";

interface Props {
  doctor: any;
  specialties: any[];
}

export default function EditForm({ doctor, specialties }: Props) {
  const [state, formAction, pending] = useActionState(updateDoctorAction, null);

  const inputClass = "w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-50 focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none";
  const labelClass = "block text-xs font-bold text-slate-500 mb-1.5 uppercase tracking-wider";

  return (
    <form action={formAction} className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-700 font-medium text-sm rounded-xl">
          {state.error}
        </div>
      )}

      {/* Input oculto con el ID */}
      <input type="hidden" name="id" value={doctor.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className={labelClass}>Nombre Completo *</label>
          <input type="text" name="name" required defaultValue={doctor.name} className={inputClass} placeholder="Ej: Dr. Juan Pérez" />
        </div>
        <div>
          <label className={labelClass}>Correo Electrónico *</label>
          <input type="email" name="email" required defaultValue={doctor.email} className={inputClass} placeholder="correo@ejemplo.com" />
        </div>
        <div>
          <label className={labelClass}>Teléfono</label>
          <input type="tel" name="phone" defaultValue={doctor.phone || ""} className={inputClass} placeholder="+52 000 000 0000" />
        </div>
        <div>
          <label className={labelClass}>Cédula Profesional</label>
          <input type="text" name="professionalLicense" defaultValue={doctor.professionalLicense || ""} className={inputClass} placeholder="Ej: 12345678" />
        </div>
        <div>
          <label className={labelClass}>Especialidad</label>
          <select name="specialtyId" defaultValue={doctor.specialtyId || ""} className={inputClass}>
            <option value="">Sin especialidad / General</option>
            {specialties.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Estado de la Cuenta *</label>
          <select name="status" defaultValue={doctor.status} className={inputClass}>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo / Suspendido</option>
            <option value="PENDING_ACTIVATION">Pendiente de Activación</option>
          </select>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 mt-8">
        <h3 className="text-sm font-bold text-slate-800 mb-3">Seguridad / Contraseña</h3>
        <p className="text-xs text-slate-500 mb-4">Si deseas cambiar o forzar una nueva contraseña para este médico, escríbela aquí. De lo contrario, déjala en blanco.</p>
        <div className="max-w-md">
          <label className={labelClass}>Nueva Contraseña (Opcional)</label>
          <input 
            type="password" 
            name="newPassword" 
            className={inputClass} 
            placeholder="Mínimo 6 caracteres" 
            minLength={6} 
          />
        </div>
      </div>

      <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
        <Link href="/admin/doctores" className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition">
          Cancelar
        </Link>
        <button 
          type="submit" 
          disabled={pending}
          className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {pending && (
            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
              <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
            </svg>
          )}
          {pending ? "Guardando..." : "Guardar Cambios"}
        </button>
      </div>
    </form>
  );
}
