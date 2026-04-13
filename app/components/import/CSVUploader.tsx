"use client";

import { useCallback, useState } from 'react';
import Papa from 'papaparse';

interface CSVUploaderProps {
  onDataParsed: (headers: string[], rows: any[]) => void;
}

export default function CSVUploader({ onDataParsed }: CSVUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (file: File) => {
    setError("");
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError("Por favor sube un archivo CSV válido.");
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
           setError("Hubo un error al leer el archivo CSV.");
           return;
        }
        if (!results.meta.fields || results.meta.fields.length === 0) {
           setError("El archivo parece no tener encabezados de columnas.");
           return;
        }
        onDataParsed(results.meta.fields, results.data);
      },
      error: (error) => {
        setError(error.message);
      }
    });
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full">
      <div 
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50 shadow-sm' : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'}`}
      >
         <div className="mx-auto w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center mb-4 shadow-sm text-indigo-600">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
         </div>
         <h3 className="text-lg font-bold text-slate-800 mb-1">Arrastra tu archivo delimitado por comas (.CSV)</h3>
         <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">El archivo debe contener el formato de plantilla con columnas predefinidas para mapeo.</p>
         
         <label className="cursor-pointer inline-flex items-center justify-center px-6 py-2.5 bg-white text-indigo-600 border border-slate-200 shadow-sm text-sm font-bold rounded-lg hover:bg-slate-50 hover:border-indigo-200 hover:text-indigo-700 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500/20">
            <span>Seleccionar Archivo</span>
            <input type="file" accept=".csv" className="hidden" onChange={(e) => e.target.files && handleFile(e.target.files[0])} />
         </label>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}
    </div>
  );
}
