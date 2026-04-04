import { auth } from "@/auth";

export default async function ProfesionalDashboardPage() {
  const session = await auth();
  
  return (
    <div className="p-8 max-w-5xl mx-auto w-full pt-12">
      <header className="mb-10 text-center lg:text-left">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Bienvenido, <span className="text-indigo-600">Dr. {session?.user?.name}</span></h1>
        <p className="text-slate-500 text-lg mt-3 font-medium">Panel analítico y operativo de salud.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Tarjeta de Artículos */}
         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-100/50 hover:border-indigo-100 hover:-translate-y-1 transition duration-300">
            <div className="h-16 w-16 bg-gradient-to-br from-indigo-50 to-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Publicaciones Clínicas</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Redacta, publica y gestiona contenido médico y científico avalado para la comunidad de Gencell.
            </p>
            <a href="/profesional/articulos" className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition">
              Gestor de Artículos →
            </a>
         </div>

         <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-100 hover:-translate-y-1 transition duration-300">
            <div className="h-16 w-16 bg-gradient-to-br from-sky-50 to-sky-100 text-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3 tracking-tight">Catálogo de Especialidad</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed">
              Explora el catálogo oficial de suplementos y equipos médicos para recomendarlos o vincularlos a tus publicaciones.
            </p>
            <a target="_blank" href="/productos" className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-xl font-semibold text-sm hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition">
              Explorar Catálogo ↗
            </a>
         </div>
      </div>

    </div>
  );
}
