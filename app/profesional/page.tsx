import { auth } from "@/auth";

export default async function ProfesionalDashboardPage() {
  const session = await auth();
  
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Bienvenido, {session?.user?.name}</h1>
        <p className="text-slate-500 text-lg mt-2">Panel exclusivo para profesionales de la salud.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Tarjeta de Artículos */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Tus Artículos</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Redacta, publica y gestiona contenido médico y científico avalado para la comunidad de Gencell.
            </p>
            <button disabled className="bg-slate-100 text-slate-400 px-4 py-2 rounded font-medium text-sm cursor-not-allowed">
              Próximamente
            </button>
         </div>

         {/* Tarjeta de Material de Apoyo */}
         <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="h-12 w-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Vincular Productos</h2>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              Explora el catálogo oficial de suplementos y equipos médicos para recomendarlos o vincularlos a tus publicaciones.
            </p>
            <button disabled className="bg-slate-100 text-slate-400 px-4 py-2 rounded font-medium text-sm cursor-not-allowed">
              Próximamente
            </button>
         </div>
      </div>
    </div>
  );
}
