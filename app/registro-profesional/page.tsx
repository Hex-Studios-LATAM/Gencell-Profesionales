"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function RegistroProfesionalPage() {
  const [formState, setFormState] = useState({ name: '', email: '', phone: '', specialtyText: '', professionalLicense: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/professional-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ocurrió un error');
      
      setStatus('success');
    } catch (err: any) {
      setErrorMsg(err.message);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-10 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-lg w-full text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-green-500"></div>
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
             <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4 tracking-tight">¡Solicitud Registrada!</h1>
          <p className="text-slate-600 text-lg mb-8 leading-relaxed">
            Tu perfil ha sido enviado correctamente. Un asesor médico revisará tu cédula profesional y especialidad.
            <br/><br/>
            Te enviaremos un correo para la <strong>activación de tu cuenta</strong> en cuanto seas aprobado.
          </p>
          <Link href="/" className="inline-block w-full bg-slate-900 text-white font-medium py-3.5 rounded-xl hover:bg-slate-800 transition">
            Volver al inicio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col pt-12 pb-24 items-center">
      <Link href="/" className="mb-8 text-slate-500 hover:text-indigo-600 transition flex items-center gap-2 font-medium text-sm">
         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
         Volver al inicio
      </Link>

      <div className="bg-white p-8 sm:p-12 rounded-2xl shadow-xl shadow-slate-200/40 border border-slate-100 max-w-xl w-full">
        <div className="text-center mb-10">
           <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-xl text-indigo-600 mb-4">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
           </div>
           <h1 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">Registro Profesional</h1>
           <p className="text-slate-500">Únete a la red médica Gencell. Tu solicitud será validada a la brevedad.</p>
        </div>
        
        {status === 'error' && (
          <div className="p-4 mb-8 bg-red-50 text-red-700 border border-red-100 rounded-xl flex items-start gap-3">
             <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             <span className="text-sm font-medium">{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Nombre Completo</label>
              <input required type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white" placeholder="Dr. Nombre Apellidos" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Correo Electrónico</label>
              <input required type="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white" placeholder="correo@clinica.com" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">Teléfono Movil</label>
              <input required type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white" placeholder="+52 000 000 0000" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Especialidad Principal</label>
              <input required type="text" value={formState.specialtyText} onChange={e => setFormState({...formState, specialtyText: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white" placeholder="Ej. Cardiología Clínica" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-700">Cédula Profesional</label>
              <input required type="text" value={formState.professionalLicense} onChange={e => setFormState({...formState, professionalLicense: e.target.value})} className="w-full border border-slate-200 p-3 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white font-mono uppercase tracking-widest" placeholder="12345678" />
            </div>
          </div>
          
          <div className="pt-4">
             <button type="submit" disabled={status === 'loading'} className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
               {status === 'loading' ? 'Procesando Envío...' : 'Enviar Solicitud de Acceso'}
               {!status && <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
             </button>
          </div>
        </form>
      </div>
      <div className="mt-8 text-center text-sm text-slate-500 max-w-sm">
         Al enviar esta solicitud aceptas que nuestro equipo médico verifique tus credenciales en los registros públicos de salud.
      </div>
    </main>
  );
}
