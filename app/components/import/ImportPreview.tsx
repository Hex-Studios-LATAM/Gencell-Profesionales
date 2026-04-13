"use client";

import { useState } from "react";

interface ValidationRow {
  originalIndex: number;
  data: {
    nombre: string;
    descripcion: string;
    imagenUrl: string;
    mappedCategories: any[];
    missingCategories: string[];
    mappedSpecialties: any[];
    missingSpecialties: string[];
  };
  status: 'OK' | 'WARNING' | 'ERROR';
  errors: string[];
  warnings: string[];
  skip?: boolean;
}

interface ImportPreviewProps {
  rows: ValidationRow[];
  onConfirm: (processedRows: ValidationRow[]) => void;
  onCancel: () => void;
}

export default function ImportPreview({ rows, onConfirm, onCancel }: ImportPreviewProps) {
  const [dataRows, setDataRows] = useState<ValidationRow[]>(rows);

  const toggleSkip = (index: number) => {
    const updated = [...dataRows];
    updated[index].skip = !updated[index].skip;
    setDataRows(updated);
  };

  const total = dataRows.length;
  const toImport = dataRows.filter(r => !r.skip && r.status !== 'ERROR').length;
  const withErrors = dataRows.filter(r => r.status === 'ERROR').length;
  const missedWarnings = dataRows.filter(r => r.status === 'WARNING' && !r.skip).length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col min-h-[500px] animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
         <div>
            <h3 className="text-xl font-extrabold text-slate-800">Paso 2 de 2 · Revisión Final</h3>
            <p className="text-sm text-slate-500 mt-1">
              Se detectaron <strong className="text-slate-700">{total} filas</strong>. Las que estén marcadas con error no podrán ser subidas.
            </p>
         </div>
         <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
             <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> {toImport} Listas</div>
             <div className="w-px h-4 bg-slate-200"></div>
             <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 block"></span> {missedWarnings} Alertas</div>
             <div className="w-px h-4 bg-slate-200"></div>
             <div className="flex items-center gap-1.5 text-red-600"><span className="w-2 h-2 rounded-full bg-red-500 block"></span> {withErrors} Errores</div>
         </div>
      </div>

      <div className="overflow-auto flex-1 custom-scrollbar max-h-[60vh]">
         <table className="w-full text-left text-sm whitespace-nowrap">
           <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider sticky top-0 z-10 shadow-sm">
             <tr>
               <th className="px-5 py-4 w-12 text-center">Incluir</th>
               <th className="px-5 py-4 w-16">Estado</th>
               <th className="px-5 py-4">Producto</th>
               <th className="px-5 py-4">Categorías</th>
               <th className="px-5 py-4">Especialidades</th>
               <th className="px-5 py-4">Feedback del Analizador</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {dataRows.map((row, idx) => {
               const StatusIcon = () => {
                  if (row.skip) return <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-500 font-bold text-[10px] uppercase">Omitido</span>;
                  if (row.status === 'ERROR') return <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 font-bold text-[10px] uppercase">Error</span>;
                  if (row.status === 'WARNING') return <span className="px-2.5 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px] uppercase">Aviso</span>;
                  return <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">OK</span>;
               };

               return (
                 <tr key={idx} className={`transition-colors ${row.skip ? 'opacity-40 bg-slate-50' : (row.status === 'ERROR' ? 'bg-red-50/30' : 'hover:bg-slate-50')}`}>
                   <td className="px-5 py-4 text-center">
                     <input 
                       type="checkbox" 
                       checked={!row.skip && row.status !== 'ERROR'} 
                       disabled={row.status === 'ERROR'}
                       onChange={() => toggleSkip(idx)}
                       className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4 cursor-pointer disabled:opacity-50"
                     />
                   </td>
                   <td className="px-5 py-4"><StatusIcon /></td>
                   <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                         {row.data.imagenUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={row.data.imagenUrl} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-white" />
                         ) : (
                            <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 flex items-center justify-center bg-slate-50">
                              <svg className="w-4 h-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                         )}
                         <div className="font-semibold text-slate-800 truncate max-w-[200px]" title={row.data.nombre}>{row.data.nombre || 'Sin Título'}</div>
                      </div>
                   </td>
                   <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {row.data.mappedCategories.map(c => <span key={c.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full inline-block truncate max-w-[150px]">{c.name}</span>)}
                        {row.data.missingCategories.map(c => <span key={c} className="text-xs bg-slate-100 text-slate-500 border border-amber-200 px-2 py-0.5 rounded-full inline-block truncate max-w-[150px]" title="Se creará al importar">+ Crear: "{c}"</span>)}
                      </div>
                   </td>
                   <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        {row.data.mappedSpecialties.map(s => <span key={s.id} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full inline-block truncate max-w-[150px]">{s.name}</span>)}
                        {row.data.missingSpecialties.map(s => <span key={s} className="text-xs bg-slate-100 text-slate-500 border border-amber-200 px-2 py-0.5 rounded-full inline-block truncate max-w-[150px]" title="Se creará al importar">+ Crear: "{s}"</span>)}
                      </div>
                   </td>
                   <td className="px-5 py-4 whitespace-normal text-xs min-w-[200px]">
                      {row.errors.length > 0 && <ul className="text-red-600 list-disc list-inside">{row.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}
                      {row.warnings.length > 0 && <ul className="text-amber-600 list-disc list-inside mt-0.5">{row.warnings.map((w, i) => <li key={i}>{w}</li>)}</ul>}
                      {row.errors.length === 0 && row.warnings.length === 0 && <span className="text-emerald-500 font-medium">Todo Correcto</span>}
                   </td>
                 </tr>
               )
             })}
           </tbody>
         </table>
      </div>

      <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 relative z-20">
         <button 
           onClick={onCancel}
           className="px-6 py-2.5 bg-white text-slate-600 font-semibold rounded-lg hover:bg-slate-100 border border-slate-300 transition-colors shadow-sm"
         >
           Atrás / Cancelar
         </button>
         <button 
           onClick={() => onConfirm(dataRows)}
           disabled={toImport === 0}
           className="px-8 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:ring-offset-2 focus:ring-2 focus:ring-indigo-600 inline-flex items-center gap-2"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
           Importar {toImport} Productos
         </button>
      </div>
    </div>
  );
}
