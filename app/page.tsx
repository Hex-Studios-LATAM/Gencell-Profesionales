export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-indigo-200 shadow-md">
             <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">Gencell</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium">
          <a href="/productos" className="text-slate-600 hover:text-indigo-600 transition">Productos</a>
          <a href="/articulos" className="text-slate-600 hover:text-indigo-600 transition">Artículos</a>
          <div className="w-px h-4 bg-slate-300"></div>
          <a href="/login" className="text-slate-900 hover:text-indigo-600 transition">Ingresar</a>
          <a href="/registro-profesional" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 shadow-sm shadow-indigo-200 transition">
            Soy Médico
          </a>
        </div>
      </nav>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center text-center">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-semibold tracking-wide text-xs mb-8">
           NUEVO PORTAL PROFESIONAL
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6 max-w-4xl">
          Ciencia, tecnología y respaldo <br className="hidden md:block"/> para tu práctica médica.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl leading-relaxed">
          Accede a equipos médicos de última generación, protocolos validados y un ecosistema de artículos clínicos creados por y para profesionales de la salud.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-20 w-full sm:w-auto">
          <a href="/registro-profesional" className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-medium text-lg hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2">
            Solicitar Acceso Médico
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
          <a href="/productos" className="px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-xl font-medium text-lg hover:border-indigo-300 hover:text-indigo-700 hover:bg-indigo-50 transition flex items-center justify-center">
            Explorar Catálogo
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Catálogo Certificado</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Explora productos validados clínicamente, con descripciones técnicas y soporte continuo.</p>
           </div>
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Publicaciones Médicas</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Mantente al día con artículos redactados por colegas enfocados en salud preventiva y celular.</p>
           </div>
           <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-md transition">
              <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Red Confiable</h3>
              <p className="text-slate-500 leading-relaxed text-sm">Validación rigurosa de identidad y cédula profesional para un ecosistema de alto nivel.</p>
           </div>
        </div>
      </div>
{/* 
        <a href="/admin/aprobaciones" className="">Solicitudes (Aprobaciones)</a>
        <a href="/admin/especialidades" className="">Especialidades</a>
        <a href="/admin/productos" className="">Productos Admin</a>
        <a href="/admin" className="">Área Admin</a> 
*/}
    </main>
  );
}
