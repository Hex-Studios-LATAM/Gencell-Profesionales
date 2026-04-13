"use client";

import Link from "next/link";

interface ImportSummaryProps {
  results: {
    success: number;
    errors: number;
    skipped: number;
    imagesDownloaded: number;
    details: any[];
  };
  onReset: () => void;
}

export default function ImportSummary({ results, onReset }: ImportSummaryProps) {
  const isPerfect = results.errors === 0 && results.success > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 text-center animate-in zoom-in duration-500">
      <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 shadow-sm border-2 ${isPerfect ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'}`}>
        {isPerfect ? (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        )}
      </div>

      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
        {isPerfect ? '¡Importación Completada Exitosamente!' : 'Importación Finalizada con Detalles'}
      </h2>
      <p className="text-slate-500 max-w-lg mx-auto mb-10">
        El proceso de importación masiva de productos ha concluido. A continuación puedes ver el resumen de los registros procesados.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
         <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-emerald-600 mb-1">{results.success}</span>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Importados</span>
         </div>
         <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-amber-500 mb-1">{results.skipped}</span>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Omitidos</span>
         </div>
         <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-red-500 mb-1">{results.errors}</span>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Con Error</span>
         </div>
         <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-indigo-500 mb-1">{results.imagesDownloaded}</span>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Imágenes Listas</span>
         </div>
      </div>

      {results.errors > 0 && (
         <div className="max-w-2xl mx-auto text-left mb-8 max-h-48 overflow-y-auto custom-scrollbar border border-red-100 bg-red-50/30 rounded-xl p-4 text-sm">
            <h4 className="font-bold text-red-800 mb-2">Detalle de Errores:</h4>
            <ul className="list-disc list-inside text-red-600 space-y-1">
               {results.details.filter(d => d.status === 'ERROR').map((e, idx) => (
                 <li key={idx}><strong>{e.nombre || `Fila ${idx}`}:</strong> {e.error}</li>
               ))}
            </ul>
         </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
         <button 
           onClick={onReset}
           className="px-6 py-3 w-full sm:w-auto bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors"
         >
           Nueva Importación
         </button>
         <Link 
           href="/admin/productos"
           className="px-6 py-3 w-full sm:w-auto bg-indigo-600 border border-transparent text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
         >
           Ver Catálogo de Productos
         </Link>
      </div>
    </div>
  );
}
