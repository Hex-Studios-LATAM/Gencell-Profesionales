"use client";

import { useState, useEffect } from "react";

interface ColumnMapperProps {
  csvHeaders: string[];
  onMapComplete: (mappedData: Record<string, string>) => void;
}

const REQUIRED_FIELDS = [
  { key: "nombre", label: "Nombre del Producto / Título", required: true },
  { key: "categorias", label: "Categorías (Opcional, separadas por '|')", required: false },
  { key: "imagen", label: "Enlace de la Imagen completa (URL externa)", required: false },
  { key: "especialidades", label: "Especialidades (Opcional, separadas por '|')", required: false },
  { key: "descripcion", label: "Descripción o Texto (HTML válido / Rich Text)", required: false },
];

export default function ColumnMapper({ csvHeaders, onMapComplete }: ColumnMapperProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});

  useEffect(() => {
    // Automaepado inteligente
    const initialMapping: Record<string, string> = {};
    REQUIRED_FIELDS.forEach(field => {
      const bestMatch = csvHeaders.find(h => 
        h.toLowerCase().includes(field.key.toLowerCase()) || 
        h.toLowerCase() === field.key
      );
      if (bestMatch) {
         initialMapping[field.key] = bestMatch;
      }
    });
    setMapping(initialMapping);
  }, [csvHeaders]);

  const isValid = REQUIRED_FIELDS.filter(f => f.required).every(f => !!mapping[f.key]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in duration-300">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
         <h3 className="text-lg font-bold text-slate-800">Mapeo Inteligente de Columnas</h3>
         <p className="text-sm text-slate-500 mt-1">Conecta las columnas detectadas en tu archivo CSV con los campos internos del sistema.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold tracking-wider">
            <tr>
              <th className="px-6 py-4">Campo del Producto</th>
              <th className="px-6 py-4">Columna en el Archivo CSV</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {REQUIRED_FIELDS.map(field => (
              <tr key={field.key} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-6 py-4">
                   <div className="flex items-center gap-2">
                     <span className="font-semibold text-slate-700">{field.label}</span>
                     {field.required && <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold tracking-widest uppercase">Req</span>}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={mapping[field.key] || ""}
                    onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                    className="w-full sm:w-64 border border-slate-200 rounded-lg p-2.5 text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white hover:border-slate-300 transition-all font-medium"
                  >
                    <option value="" disabled>-- Ignorar campo --</option>
                    {csvHeaders.map(header => (
                       <option key={header} value={header}>{header}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 gap-4 flex-wrap">
         <p className="text-sm text-slate-500">
           Se ignorarán las columnas que no mapees aquí.
         </p>
         <button 
           onClick={() => onMapComplete(mapping)}
           disabled={!isValid}
           className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:ring-offset-2 focus:ring-2 focus:ring-indigo-600 inline-flex items-center gap-2"
         >
           Continuar a Revisión
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
         </button>
      </div>
    </div>
  );
}
