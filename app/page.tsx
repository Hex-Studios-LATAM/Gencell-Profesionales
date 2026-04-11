"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Logo from "@/app/components/Logo";

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
        router.push("/admin"); 
        router.refresh();
      }
    } catch (err) {
      setError("Error de comunicación, por favor intenta de nuevo");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex text-slate-900 bg-white">
      {/* Panel Izquierdo: Formulario */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 sm:p-12 xl:p-24 relative z-10 bg-white shadow-[20px_0_40px_-15px_rgba(0,0,0,0.05)]">
        
        <div className="absolute top-8 left-8 flex items-center gap-2 font-medium text-sm text-slate-500">
           {/* Welcome area (no back button needed since this is index) */}
           <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase">Portal Privado</span>
        </div>

        <div className="w-full max-w-sm">
           {/* ── Bloque de marca ─────────────────────────────── */}
           <div className="mb-10 text-center lg:text-left">
             <img 
               src="/assets/logos/logo-black.svg" 
               alt="Gencell" 
               className="h-10 w-auto mb-6 inline-block lg:block"
             />
             <div className="flex items-center gap-2">
               <span className="h-px flex-1 bg-gradient-to-r from-blue-200 to-transparent" />
               <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-blue-600">
                 Portal Médico
               </span>
             </div>
           </div>
           
           <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-center lg:text-left">Bienvenido de nuevo</h1>
           <p className="text-slate-500 mb-8 text-center lg:text-left">Ingresa a tu portal profesional Gencell.</p>

           {error && <div className="p-3 mb-6 font-medium text-red-600 bg-red-50 border border-red-100 rounded-lg text-sm text-center animate-in fade-in zoom-in-95">{error}</div>}

           <form onSubmit={handleSubmit} className="space-y-5">
             <div className="space-y-1">
               <label className="block text-sm font-semibold text-slate-700">Correo Electrónico</label>
               <input 
                 type="email" 
                 required 
                 value={email} 
                 onChange={e => setEmail(e.target.value)} 
                 className="w-full border border-slate-200 p-3 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition px-4 bg-slate-50 focus:bg-white"
                 placeholder="dr.nombre@clinica.com"
               />
             </div>
             <div className="space-y-1">
               <label className="block text-sm font-semibold text-slate-700">Contraseña</label>
               <input 
                 type="password" 
                 required 
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className="w-full border border-slate-200 p-3 rounded-lg focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition px-4 bg-slate-50 focus:bg-white"
                 placeholder="••••••••"
               />
               <div className="flex justify-end pt-1">
                  <a href="#" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition">¿Olvidaste tu contraseña?</a>
               </div>
             </div>
             
             <button 
               type="submit" 
               disabled={loading}
               className="w-full bg-indigo-600 text-white font-semibold py-3.5 rounded-lg mt-2 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
             >
               {loading ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Conectando...
                 </>
               ) : 'Ingresar al Portal'}
             </button>
           </form>

           <div className="mt-8 pt-8 border-t border-slate-100 text-center">
             <p className="text-slate-500 text-sm">¿Eres nuevo en Gencell?</p>
             <Link href="/registro-profesional" className="inline-block mt-2 font-semibold text-slate-900 hover:text-indigo-600 transition">Solicitar Cuenta de Médico Profesional →</Link>
           </div>
        </div>
      </div>

      {/* Panel Derecho: Imagen / Decoración */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 overflow-hidden items-center justify-center">
         {/* Gradientes abstractos de fondo biomédico */}
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-sky-900 opacity-90 mix-blend-multiply"></div>
         <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500 rounded-full mix-blend-screen filter blur-[150px] opacity-20 animate-pulse"></div>
         <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-400 rounded-full mix-blend-screen filter blur-[150px] opacity-20"></div>
         
         <div className="relative z-20 max-w-lg p-12 text-white">
            <h2 className="text-4xl font-bold mb-6 leading-tight">Elevando el estándar en tecnología médica.</h2>
            <p className="text-indigo-200 text-lg leading-relaxed">Únete a la red exclusiva de profesionales y descubre soluciones con verdadero impacto clínico e investigativo.</p>
            
            <div className="mt-12 flex items-center gap-4">
               <div className="flex -space-x-4">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                       <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                  ))}
               </div>
               <span className="text-sm font-medium text-indigo-300">+2,000 médicos confían en nosotros</span>
            </div>
         </div>
         
         {/* Patrón superpuesto sutil */}
         <div className="absolute inset-0 opacity-[0.03] select-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
      </div>
    </main>
  );
}
