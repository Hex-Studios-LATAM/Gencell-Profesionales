"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  contentType: "ARTICLE" | "NEWS" | "WHITE_PAPER";
  categoryId: string;
  category: { id: string; name: string };
  author?: { name: string; email: string };
  createdAt: string;
  audienceType: "ALL_DOCTORS" | "BY_SPECIALTY";
  specialties?: Array<{ specialtyId: string, specialty?: { name: string } }>;
};

export default function AdminArticulosPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const artRes = await fetch("/api/articles");
      if (!artRes.ok) throw new Error("Error cargando artículos");
      setArticles(await artRes.json());
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
    if (!confirm("¿Seguro que deseas eliminar este artículo? Esta acción no se puede deshacer.")) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar el artículo");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm">Publicado</span>;
      case "PENDING_REVIEW":
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 shadow-sm">En Revisión</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 shadow-sm">Borrador</span>;
    }
  };

  return (
    <main className="p-6 md:p-8 max-w-[1600px] mx-auto w-full">
      {/* Header Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin" className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition mb-3 w-max">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
             Volver al Panel
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Artículos</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Gestiona tu contenido, noticias y documentación clínica.</p>
        </div>
        <Link 
          href="/admin/articulos/crear" 
          className="inline-flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 w-full sm:w-auto"
        >
          <svg className="w-5 h-5 mr-1.5 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo Artículo
        </Link>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Table Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200">
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Título / Autor</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[20%]">Categoría</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider w-[15%]">Estado</th>
                <th className="py-4 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider text-right w-[120px]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-16 px-6 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      Cargando publicaciones...
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 px-6 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                        <svg className="w-8 h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
                      </div>
                      <h3 className="text-slate-900 font-bold text-lg">No hay artículos</h3>
                      <p className="text-slate-500 text-sm max-w-sm">Aún no has creado ningún artículo o publicación. Comienza a construir tu base de conocimientos ahora.</p>
                      <Link href="/admin/articulos/crear" className="text-indigo-600 font-semibold text-sm hover:text-indigo-700 mt-2 bg-indigo-50 px-4 py-2 rounded-lg transition-colors">
                        Crear tu primer artículo
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 text-sm mb-1">{article.title}</div>
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <span>{article.author ? `POR ${article.author.name}` : `ADMINISTRACIÓN`}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-slate-600">
                        {article.category?.name || "Sin Categoría"}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                       {getStatusBadge(article.status)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => router.push(`/admin/articulos/crear?id=${article.id}`)} 
                          className="p-2 text-indigo-400 object-contain hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors"
                          title="Editar artículo"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(article.id)} 
                          className="p-2 text-red-300 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Eliminar artículo"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

