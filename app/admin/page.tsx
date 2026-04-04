export default function AdminDashboardPage() {
  return (
    <main className="p-8 max-w-5xl mx-auto w-full">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Dashboard Central</h1>
        <p className="text-slate-500 text-lg mt-2 font-medium">Panel de control unificado Gencell.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-indigo-100 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Revisar Solicitudes</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed pr-8">
              Evalúa y aprueba a los profesionales de la salud que desean ingresar a la plataforma exclusiva.
            </p>
            <a href="/admin/aprobaciones" className="inline-flex items-center justify-center bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition shadow-md shadow-indigo-200">
              Ver Aprobaciones
            </a>
         </div>

         <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-sky-100 transition group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-sky-50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
            <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Revisión Editorial</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed pr-8">
              Administra los artículos clínicos o revisa los borradores enviados por los Doctores avalados.
            </p>
            <a href="/admin/articulos" className="inline-flex items-center justify-center bg-white border border-slate-200 text-slate-700 px-6 py-2.5 rounded-lg font-semibold text-sm hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 transition">
              Gestor de Artículos
            </a>
         </div>

         <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md hover:border-purple-100 transition group relative overflow-hidden md:col-span-2">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-50 to-transparent rounded-bl-full -mr-4 -mt-4"></div>
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Catálogo de Productos</h2>
            <p className="text-slate-500 mb-8 text-sm leading-relaxed max-w-2xl">
              Agrega y administra la base maestra de suplementos y maquinaria disponible, enlazando especialidades específicas.
            </p>
            <a href="/admin/productos" className="inline-flex items-center justify-center bg-purple-600 text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-purple-700 transition shadow-md shadow-purple-200">
              Administrar Catálogo
            </a>
         </div>
      </div>
    </main>
  );
}
