import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "./SignOutButton";
import Logo from "@/app/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
       
       <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0 relative hidden lg:flex">
          <div className="h-24 flex flex-col justify-center px-7 border-b border-slate-100 flex-shrink-0 gap-1">
             <Logo theme="light" variant="admin" size="md" />
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
                   <Link href="/admin/doctores" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                     Doctores
                   </Link>
                   <Link href="/admin/solicitudes-perfil" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                     Solicitudes Perfil
                   </Link>
                </nav>
             </div>

             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contenido</p>
                <nav className="space-y-1">
                   <Link href="/admin/articulos" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
                     Artículos / Noticias / WP
                   </Link>
                   <Link href="/admin/categorias/articulos" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                     Cat. Artículos
                   </Link>
                   <Link href="/admin/productos" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                     Productos
                   </Link>
                   <Link href="/admin/categorias/productos" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition font-medium text-sm">
                     <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                     Cat. Productos
                   </Link>
                </nav>
             </div>

             <div>
                <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Comercial</p>
                <nav className="space-y-1">
                   <Link href="/admin/leads" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium text-sm group">
                     <svg className="w-5 h-5 flex-shrink-0 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                     Leads
                   </Link>
                   <Link href="/admin/ajustes/origenes" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition font-medium text-sm group">
                     <svg className="w-5 h-5 flex-shrink-0 group-hover:text-indigo-500 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                     Orígenes de Leads
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
