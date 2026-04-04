"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
      <div className="bg-red-50 text-red-700 p-8 rounded-lg shadow-sm border border-red-200">
        <h2 className="text-xl font-bold mb-2">Enlace no válido</h2>
        <p>{tokenError}</p>
        <p className="mt-4 text-sm">Si crees que esto es un error, por favor contacta con soporte o vuelve a solicitar acceso.</p>
        <a href="/" className="inline-block mt-4 text-red-800 underline">Ir al inicio</a>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 text-green-800 p-8 rounded-lg shadow-sm border border-green-200 text-center">
        <h2 className="text-2xl font-bold mb-4">¡Activación Exitosa!</h2>
        <p className="text-lg">Tu cuenta ha sido activada correctamente.</p>
        <p className="mt-2 text-sm">Pronto podrás acceder con tus credenciales.</p>
        {/* Aquí luego se cambiará el enlace al Login */}
        <a href="/" className="inline-block mt-6 text-green-700 font-medium underline">Regresar al inicio</a>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Activar Cuenta Profesional</h1>
      <p className="text-gray-600 mb-6 font-sm">
        Hola <strong>{userInfo?.name}</strong>, tu solicitud ha sido aprobada. Establece tu contraseña para finalizar la activación de tu perfil (<strong>{userInfo?.email}</strong>).
      </p>

      {submitError && <div className="p-3 mb-4 text-red-700 bg-red-50 border border-red-200 rounded text-sm">{submitError}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
           <input 
             type="password" 
             required 
             disabled={submitting}
             value={password} 
             onChange={e => setPassword(e.target.value)} 
             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
             placeholder="Mínimo 6 caracteres"
           />
        </div>
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
           <input 
             type="password" 
             required 
             disabled={submitting}
             value={confirmPassword} 
             onChange={e => setConfirmPassword(e.target.value)} 
             className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
             placeholder="Repite tu contraseña"
           />
        </div>
        <button 
          type="submit" 
          disabled={submitting}
          className="w-full bg-blue-600 text-white font-medium py-3 rounded mt-4 hover:bg-blue-700 transition disabled:opacity-50"
        >
          {submitting ? 'Activando...' : 'Establecer Contraseña y Activar'}
        </button>
      </form>
    </div>
  );
}

export default function ActivarPage() {
  return (
    <main className="p-8 max-w-md mx-auto mt-10">
      <Suspense fallback={<div className="text-center text-gray-500">Cargando...</div>}>
         <ActivationForm />
      </Suspense>
    </main>
  );
}
