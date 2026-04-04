"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Credenciales inválidas o cuenta inactiva");
        setLoading(false);
      } else {
        router.push("/admin"); // The layouts will redirect if role doesn't match
        router.refresh();
      }
    } catch (err) {
      setError("Error de comunicación, por favor intenta de nuevo");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
      <div className="bg-white p-8 rounded-lg shadow-md border border-gray-100 max-w-sm w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Acceso al Portal</h1>
        <p className="text-gray-600 mb-6 text-sm text-center">Ingresa con tus credenciales de profesional o administrativo.</p>
        
        {error && <div className="p-3 mb-4 text-red-700 bg-red-50 border border-red-200 rounded text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="tu@correo.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="••••••••"
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-medium py-3 rounded mt-4 hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Ingresando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm border-t pt-4">
          <p className="text-gray-500 mb-2">¿No tienes cuenta?</p>
          <a href="/registro-profesional" className="text-blue-600 font-medium hover:underline">Solicitar Acceso como Profesional</a>
        </div>
      </div>
    </main>
  );
}
