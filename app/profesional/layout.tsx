import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SignOutButton } from "../admin/SignOutButton";

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "DOCTOR") {
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/login");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex h-screen bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
       <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 flex-shrink-0 relative hidden lg:flex">
          <div className="h-20 flex items-center px-8 border-b border-slate-100">
             <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-md shadow-sky-200 mr-3">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
             </div>
             <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Gencell <span className="text-sky-600 font-medium font-mono text-sm tracking-widest ml-1 uppercase">Médicos</span></h2>
          </div>
          
          <nav className="flex-1 overflow-y-auto px-4 py-8 space-y-2">
             <Link href="/profesional" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition font-semibold text-sm group">
               <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600 flex items-center justify-center transition">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
               </div>
               Inicio Resumen
             </Link>
             
             <Link href="/profesional/articulos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition font-semibold text-sm group">
               <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600 flex items-center justify-center transition relative">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
               </div>
               Mis Artículos Clínicos
             </Link>

             <a target="_blank" href="/productos" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition font-semibold text-sm group">
               <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600 flex items-center justify-center transition">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
               </div>
               Catálogo Comercial ↗
             </a>
          </nav>

          <div className="p-4 border-t border-slate-100 bg-white">
             <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center flex-shrink-0">
                   {session.user.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-slate-900 truncate">Dr. {session.user.name}</div>
                  <div className="text-xs text-slate-500 truncate">{session.user.email}</div>
                </div>
             </div>
             <SignOutButton />
          </div>
       </aside>

       <main className="flex-1 flex flex-col items-stretch overflow-y-auto relative w-full pb-16 lg:pb-0 shadow-inner">
          {children}
       </main>
    </div>
  );
}
