"use client";

import { useState } from "react";
import Link from "next/link";
import TemplateDownload from "@/app/components/import/TemplateDownload";
import CSVUploader from "@/app/components/import/CSVUploader";
import ColumnMapper from "@/app/components/import/ColumnMapper";
import ImportPreview from "@/app/components/import/ImportPreview";
import ImportSummary from "@/app/components/import/ImportSummary";

type Phase = "UPLOAD" | "MAPPING" | "VALIDATING" | "REVIEW" | "IMPORTING" | "SUMMARY";

export default function ImportProductosPage() {
  const [phase, setPhase] = useState<Phase>("UPLOAD");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [processedRows, setProcessedRows] = useState<any[]>([]);
  const [importResults, setImportResults] = useState<any>(null);
  const [importProgress, setImportProgress] = useState(0);

  const handleDataParsed = (headers: string[], rows: any[]) => {
    setCsvHeaders(headers);
    setCsvData(rows);
    setPhase("MAPPING");
  };

  const handleMapComplete = async (mapping: Record<string, string>) => {
    setPhase("VALIDATING");
    try {
       // Convertir CSV Data usando el mapeo
       const mappedRows = csvData.map((rawRow) => {
         return {
            nombre: rawRow[mapping.nombre] || '',
            categorias: mapping.categorias ? rawRow[mapping.categorias] : '',
            imagen: mapping.imagen ? rawRow[mapping.imagen] : '',
            especialidades: mapping.especialidades ? rawRow[mapping.especialidades] : '',
            descripcion: mapping.descripcion ? rawRow[mapping.descripcion] : '',
         };
       });

       // Enviar al servidor para validar contra BD
       const res = await fetch("/api/products/import/validate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ rows: mappedRows })
       });

       if (!res.ok) throw new Error("Error en la validación");
       const { validatedRows } = await res.json();
       
       setProcessedRows(validatedRows);
       setPhase("REVIEW");
    } catch (e) {
       console.error(e);
       alert("Ocurrió un error al validar los datos. Revisa la consola.");
       setPhase("MAPPING");
    }
  };

  const handleConfirmImport = async (rowsToImport: any[]) => {
    setPhase("IMPORTING");
    setImportProgress(0);

    // Podemos simular progreso mandando todo de una, o dividir en batches si son muchos.
    // Por simplicidad en MVP, mandamos todo al backend.
    try {
       // Mantenemos actualizados los skips u overrides del preview
       const cleanRows = rowsToImport.map(r => ({ ...r.data, skip: r.skip || r.status === 'ERROR' }));
       
       // Simulamos un leve avance de progreso visual
       const progressInterval = setInterval(() => {
          setImportProgress(p => p < 90 ? p + 5 : p);
       }, 500);

       const res = await fetch("/api/products/import", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ rows: cleanRows })
       });
       
       clearInterval(progressInterval);
       setImportProgress(100);

       if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error);
       }

       const results = await res.json();
       setImportResults(results);
       setPhase("SUMMARY");
    } catch (e: any) {
       console.error(e);
       alert(`Error crítico durante la importación: ${e.message}`);
       setPhase("REVIEW");
    }
  };

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8 min-h-screen pb-32">
       {/* Header de la Vista */}
      <div className="mb-8">
        <Link href="/admin/productos" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Productos
        </Link>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Importación Inteligente</h1>
            <p className="text-slate-500 mt-1.5 font-medium max-w-xl">
              Sube tu catálogo mediante archivo delimitado (CSV) con auto-mapeo, validación de referencias y descarga automática de imágenes cruzadas.
            </p>
          </div>
          {(phase === "UPLOAD" || phase === "MAPPING") && (
             <TemplateDownload />
          )}
        </div>
      </div>

      {/* Stepper Visual Opcional */}
      <div className="mb-8">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2 text-sm font-bold text-slate-400">
           <span className={`px-3 py-1.5 rounded-md transition-colors ${phase === 'UPLOAD' ? 'bg-indigo-100 text-indigo-700' : (phase !== 'UPLOAD' ? 'text-indigo-600' : '')}`}>1. Subir CSV</span>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
           <span className={`px-3 py-1.5 rounded-md transition-colors ${phase === 'MAPPING' ? 'bg-indigo-100 text-indigo-700' : (phase === 'REVIEW' || phase === 'IMPORTING' || phase === 'SUMMARY' ? 'text-indigo-600' : '')}`}>2. Mapeo</span>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
           <span className={`px-3 py-1.5 rounded-md transition-colors ${phase === 'REVIEW' ? 'bg-indigo-100 text-indigo-700' : (phase === 'IMPORTING' || phase === 'SUMMARY' ? 'text-indigo-600' : '')}`}>3. Revisión</span>
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
           <span className={`px-3 py-1.5 rounded-md transition-colors ${phase === 'SUMMARY' ? 'bg-indigo-100 text-indigo-700' : ''}`}>4. Resultado</span>
        </div>
      </div>

      {/* Renders Conditionales por Fase */}
      {phase === "UPLOAD" && (
        <div className="bg-white p-8 border border-slate-200 rounded-2xl shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
           <CSVUploader onDataParsed={handleDataParsed} />
        </div>
      )}

      {phase === "MAPPING" && (
        <ColumnMapper csvHeaders={csvHeaders} onMapComplete={handleMapComplete} />
      )}

      {phase === "VALIDATING" && (
        <div className="bg-white p-16 border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
           <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6"></div>
           <h3 className="text-xl font-bold text-slate-800">Analizando Datos...</h3>
           <p className="text-slate-500 mt-2">Estamos comprobando las relaciones y diagnosticando el contenido.</p>
        </div>
      )}

      {phase === "REVIEW" && (
        <ImportPreview 
          rows={processedRows} 
          onConfirm={handleConfirmImport} 
          onCancel={() => setPhase("MAPPING")} 
        />
      )}

      {phase === "IMPORTING" && (
        <div className="bg-white p-16 border border-slate-200 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center animate-in zoom-in duration-500">
           <div className="w-full max-w-md mx-auto mb-6">
              <div className="flex justify-between text-sm font-bold text-slate-700 mb-2">
                 <span>Creando Productos...</span>
                 <span>{importProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                 <div className="bg-indigo-600 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${importProgress}%` }}></div>
              </div>
           </div>
           <p className="text-slate-500">Por favor, no cierres esta ventana. Descargando imágenes y construyendo catálogo.</p>
        </div>
      )}

      {phase === "SUMMARY" && importResults && (
        <ImportSummary 
          results={importResults} 
          onReset={() => {
            setCsvData([]);
            setCsvHeaders([]);
            setProcessedRows([]);
            setImportResults(null);
            setPhase("UPLOAD");
          }} 
        />
      )}

    </main>
  );
}
