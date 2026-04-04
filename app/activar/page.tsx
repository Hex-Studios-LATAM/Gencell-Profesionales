"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function ActivationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [loadingToken, setLoadingToken] = useState(true);
  const [tokenError, setTokenError] = useState("");
  const [userInfo, setUserInfo] = useState<{name: string, email: string} | null>(null);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
       setTokenError("No se proporcionó un token de activación válido.");
       setLoadingToken(false);
       return;
    }

    fetch(`/api/auth/setup-password?token=${token}`)
      .then(res => res.json().then(data => ({ status: res.status, data })))
      .then(({ status, data }) => {
         if (status !== 200 || data.error) {
            setTokenError(data.error || "Token inválido");
         } else {
            setUserInfo(data);
         }
      })
      .catch((err) => setTokenError("Error de comunicación"))
      .finally(() => setLoadingToken(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");
    
    if (password !== confirmPassword) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setSubmitError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setSubmitting(true);
    try {
       const res = await fetch('/api/auth/setup-password', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ token, password })
       });
       const data = await res.json();
       
       if (!res.ok) throw new Error(data.error || 'Ocurrió un error al activar');
       
       setSuccess(true);
    } catch (err: any) {
       setSubmitError(err.message);
    } finally {
       setSubmitting(false);
    }
  };

  if (loadingToken) {
    return <div className="text-center p-10 text-gray-500">Validando enlace de activación...</div>;
  }

  if (tokenError) {
    return (
      <div className="bg-red-50 text-red-700 p-10 rounded-3xl shadow-xl shadow-red-100/50 border border-red-200 text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
        <h2 className="text-2xl font-extrabold mb-3">Enlace no válido</h2>
        <p className="font-medium text-red-800/80 mb-6">{tokenError}</p>
        <p className="text-sm font-medium bg-white/50 p-4 rounded-xl">Si crees que esto es un error, por favor contacta con soporte o vuelve a solicitar acceso.</p>
        <Link href="/" className="inline-block mt-6 text-red-800 font-bold hover:underline">Regresar al inicio</Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-white p-10 rounded-3xl shadow-xl shadow-emerald-100/50 border border-emerald-100 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
           <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-3xl font-extrabold mb-4 text-slate-900 tracking-tight">¡Cuenta Activada!</h2>
        <p className="text-lg text-slate-600 mb-8 font-medium">Tu perfil profesional y contraseña están configurados correctamente.</p>
        <Link href="/login" className="block w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition shadow-lg shadow-slate-200">Acceder Ahora</Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 max-w-lg w-full">
      <div className="text-center mb-8">
         <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
           <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
         </div>
         <h1 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">Activa tu Acceso</h1>
         <p className="text-slate-500 font-medium leading-relaxed">
           Bienvenido <strong>Dr(a). {userInfo?.name}</strong>.<br/> Tu solicitud ha sido aprobada. Establece tu contraseña definitiva para finalizar la activación de <br/>
           <span className="inline-block mt-2 font-mono text-sm bg-slate-50 px-3 py-1 rounded-lg text-slate-700 border border-slate-200">{userInfo?.email}</span>
         </p>
      </div>

      {submitError && <div className="p-4 mb-6 text-red-700 bg-red-50 border border-red-100 rounded-xl font-medium text-sm text-center">{submitError}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
           <label className="block text-sm font-semibold text-slate-700">Contraseña Segura</label>
           <input 
             type="password" 
             required 
             disabled={submitting}
             value={password} 
             onChange={e => setPassword(e.target.value)} 
             className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
             placeholder="Mínimo 6 caracteres"
           />
        </div>
        <div className="space-y-1.5">
           <label className="block text-sm font-semibold text-slate-700">Confirma la Contraseña</label>
           <input 
             type="password" 
             required 
             disabled={submitting}
             value={confirmPassword} 
             onChange={e => setConfirmPassword(e.target.value)} 
             className="w-full border border-slate-200 p-3.5 rounded-xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition bg-slate-50 focus:bg-white"
             placeholder="Repite la clave elegida"
           />
        </div>
        <div className="pt-4">
           <button 
             type="submit" 
             disabled={submitting}
             className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200/50 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {submitting ? 'Confirmando...' : 'Establecer Contraseña y Entrar'}
           </button>
        </div>
      </form>
    </div>
  );
}

export default function ActivarPage() {
  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <Suspense fallback={<div className="text-center font-bold text-slate-400">Verificando enlace seguro...</div>}>
         <ActivationForm />
      </Suspense>
    </main>
  );
}
