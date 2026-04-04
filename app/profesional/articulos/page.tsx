"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
};

export default function ProfesionalArticulosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/articles");
      if (!res.ok) throw new Error("Error cargando artículos");
      setArticles(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este borrador de forma permanente?")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const statusLabel = (status: string) => {
    switch (status) {
       case "DRAFT": return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">Borrador</span>;
       case "PENDING_REVIEW": return <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs font-medium">Revisión Pendiente</span>;
       case "PUBLISHED": return <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">Publicado</span>;
       default: return status;
    }
  };

  return (
    <main className="p-8 max-w-5xl mx-auto w-full pt-12">
      <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <a href="/profesional" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center transition mb-3 gap-1">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Volver a inicio
           </a>
           <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Mis Artículos Clínicos</h1>
        </div>
        <Link href="/profesional/articulos/nuevo" className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-md shadow-indigo-200 transition flex items-center gap-2 text-sm">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
           Nuevo Artículo
        </Link>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Título del Artículo</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
              <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium">Cargando datos...</td></tr>
            ) : articles.length === 0 ? (
              <tr>
                 <td colSpan={4} className="p-12 text-center text-slate-500 bg-slate-50/50">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg></div>
                    Aún no has escrito ningún artículo. Anímate a redactar conocimiento médico.
                 </td>
              </tr>
            ) : (
              articles.map(article => (
                <tr key={article.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                  <td className="p-5">
                    <div className="font-bold text-slate-900 focus:outline-none">{article.title}</div>
                    <div className="text-xs font-medium text-slate-400 mt-1 uppercase tracking-wider">{new Date(article.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td className="p-5 text-sm font-semibold text-slate-600">{article.category?.name}</td>
                  <td className="p-5">{statusLabel(article.status)}</td>
                  <td className="p-5 text-right flex items-center justify-end gap-3 h-full pt-6">
                    <Link href={`/profesional/articulos/${article.id}/editar`} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition">Editar</Link>
                    <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-800 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Borrar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
