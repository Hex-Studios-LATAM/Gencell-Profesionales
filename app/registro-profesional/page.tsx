"use client";

import { useEffect, useState } from "react";

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
      <main className="p-8 max-w-2xl mx-auto mt-10">
        <div className="bg-green-50 text-green-800 p-8 rounded-lg shadow border border-green-200 text-center">
          <h1 className="text-2xl font-bold mb-4">¡Solicitud Enviada!</h1>
          <p className="text-lg">Tu solicitud ha sido registrada correctamente y está en proceso de revisión.</p>
          <p className="mt-2">Te notificaremos una vez que el equipo médico apruebe tu acceso al portal profesional.</p>
          <a href="/" className="inline-block mt-6 text-green-700 underline font-medium hover:text-green-900">Volver al inicio</a>
        </div>
      </main>
    );
  }

  return (
    <main className="p-8 max-w-2xl mx-auto mt-10">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Registro de Profesionales</h1>
        <p className="text-gray-600 mb-6">Solicita acceso al portal médico completando el siguiente formulario.</p>
        
        {status === 'error' && <div className="p-4 mb-6 bg-red-50 text-red-700 border border-red-200 rounded">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input required type="text" value={formState.name} onChange={e => setFormState({...formState, name: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input required type="email" value={formState.email} onChange={e => setFormState({...formState, email: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input required type="tel" value={formState.phone} onChange={e => setFormState({...formState, phone: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cédula Profesional</label>
            <input required type="text" value={formState.professionalLicense} onChange={e => setFormState({...formState, professionalLicense: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad</label>
            <input required type="text" value={formState.specialtyText} onChange={e => setFormState({...formState, specialtyText: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Cardiólogo" />
          </div>
          
          <button type="submit" disabled={status === 'loading'} className="w-full bg-blue-600 text-white font-medium py-3 rounded mt-4 hover:bg-blue-700 transition disabled:opacity-50">
            {status === 'loading' ? 'Enviando...' : 'Enviar Solicitud'}
          </button>
        </form>
        <div className="mt-4 text-center">
            <a href="/" className="text-gray-500 hover:text-gray-800 text-sm">Cancelar y volver al inicio</a>
        </div>
      </div>
    </main>
  );
}
