import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "./SignOutButton";

// Exportamos un componente de cliente en un archivo aparte o lo hacemos asi para el logout:
// Para simplificar sin romper, usamos un form directo pero estilizado.

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    if (session.user.role === "DOCTOR") {
      redirect("/profesional");
    }
    redirect("/login");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
       
       <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0 relative hidden lg:flex">
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
             <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-200 mr-3">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gencell <span className="text-indigo-500 font-medium font-mono text-sm tracking-widest ml-1 uppercase">Admin</span></h2>
          </div>
          
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">General</p>
                <nav className="space-y-1">
                   <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                     Dashboard Central
                   </Link>
                </nav>
             </div>

             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Red Médica</p>
                <nav className="space-y-1">
                   <Link href="/admin/aprobaciones" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium text-sm group">
                     <svg className="w-5 h-5 flex-shrink-0 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                     Aprobaciones
                   </Link>
                   <Link href="/admin/especialidades" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                     Especialidades
                   </Link>
                </nav>
             </div>

             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contenidos Públicos</p>
                <nav className="space-y-1">
                   <Link href="/admin/articulos" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
                     Gestor de Artículos
                   </Link>
                   <Link href="/admin/categorias" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                     Categorías
                   </Link>
                   <Link href="/admin/productos" className="flex items-center justify-between px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <span className="flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        Productos Catálogo
                     </span>
                   </Link>
                </nav>
             </div>
          </div>

          {/* User Profile Mini */}
          <div className="p-4 border-t border-slate-100 bg-white">
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center flex-shrink-0">
                   {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">{session.user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{session.user.email}</div>
                </div>
             </div>
             
             <SignOutButton />
          </div>
       </aside>

       <main className="flex-1 flex flex-col items-stretch overflow-y-auto relative bg-slate-50 shadow-inner">
          {children}
       </main>
    </div>
  );
}
