"use client";

import { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PENDING_REVIEW" | "PUBLISHED";
  categoryId: string;
  category: { id: string; name: string };
  author?: { name: string; email: string };
  createdAt: string;
};

type Category = {
  id: string;
  name: string;
};

export default function AdminArticulosPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // State for form
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    categoryId: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    status: "DRAFT" as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED"
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/article-categories")
      ]);
      
      if (!artRes.ok || !catRes.ok) throw new Error("Error cargando datos");
      
      setArticles(await artRes.json());
      setCategories(await catRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (article: Article) => {
    setIsEditing(true);
    setCurrentId(article.id);
    
    // Fetch full article to get content/excerpt
    try {
      const res = await fetch(`/api/articles/${article.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          excerpt: data.excerpt || "",
          content: data.content,
          imageUrl: data.imageUrl || "",
          status: data.status
        });
      }
    } catch (e) {
      alert("Error cargando detalles del artículo");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este artículo?")) return;
    
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Error al cambiar estado");
      fetchData();
    } catch (e) {
      alert("Error al cambiar estado");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
       alert("Selecciona una categoría");
       return;
    }
    
    const url = isEditing ? `/api/articles/${currentId}` : "/api/articles";
    const method = isEditing ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentId("");
    setFormData({
      title: "",
      slug: "",
      categoryId: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      status: "DRAFT"
    });
  };

  return (
    <main className="p-8">
      <div className="mb-10 flex flex-col justify-start items-start gap-2">
        <a href="/admin" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-3">
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
           Volver al Panel
        </a>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Gestor de Artículos</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 self-start sticky top-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{isEditing ? "Editar Artículo" : "Nuevo Artículo"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
              <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Slug (opcional)</label>
              <input type="text" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="autogenerado" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="DRAFT">Borrador</option>
                <option value="PENDING_REVIEW">Revisión Pendiente</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL de Imagen (opcional)</label>
              <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (Excerpt)</label>
              <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (Editor Visual)</label>
              <div className="border rounded overflow-hidden shadow-sm">
                 <Editor
                   apiKey="no-api-key"
                   value={formData.content}
                   onEditorChange={(content) => setFormData({...formData, content})}
                   init={{
                     height: 600,
                     menubar: true,
                     plugins: [
                       'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                       'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                       'insertdatetime', 'media', 'table', 'code', 'wordcount'
                     ],
                     toolbar: 'undo redo | formatselect | ' +
                       'bold italic underline | alignleft aligncenter ' +
                       'alignright alignjustify | bullist numlist outdent indent | ' +
                       'link image | table blockquote | insertCTA | removeformat | code fullscreen',
                     setup: (editor) => {
                       editor.ui.registry.addButton('insertCTA', {
                         text: 'Botón CTA',
                         tooltip: 'Inserta un botón con enlace',
                         onAction: () => {
                           const url = prompt('URL del enlace destino:', 'https://');
                           const text = prompt('Texto del botón:', 'Leer más');
                           if (url && text) {
                              editor.insertContent(`&nbsp;<a href="${url}" class="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-blue-700 transition my-4 shadow-md no-underline" target="_blank" rel="noopener noreferrer">${text}</a>&nbsp;`);
                           }
                         }
                       });
                     },
                     content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; color:#1f2937 } a.inline-block { display:inline-block; background-color:#2563eb; color:#ffffff; padding:0.75rem 2rem; border-radius:0.5rem; text-decoration:none; font-weight:600; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1); } a.inline-block:hover { background-color:#1d4ed8; }'
                   }}
                 />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                {isEditing ? 'Actualizar' : 'Guardar'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listado */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden self-start">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Título / Autor</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado Editorial</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[160px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && articles.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium">Cargando base editorial...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-medium bg-slate-50/50">No hay evidencia de publicaciones.</td></tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                    <td className="p-5">
                      <div className="font-bold text-slate-900 focus:outline-none">{article.title}</div>
                      <div className="text-[11px] font-bold text-slate-400 mt-2 tracking-widest uppercase">{article.author ? `POR ${article.author.name}` : `ADMINISTRACIÓN`}</div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-slate-600">
                      {article.category?.name}
                    </td>
                    <td className="p-5">
                       <select 
                         value={article.status}
                         onChange={(e) => handleStatusChange(article.id, e.target.value)}
                         className={`text-xs font-bold uppercase tracking-wider py-1.5 px-2 outline-none cursor-pointer rounded-lg border ${article.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : article.status === 'PENDING_REVIEW' ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.2)]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                       >
                         <option value="DRAFT">Borrador</option>
                         <option value="PENDING_REVIEW">En Revisión</option>
                         <option value="PUBLISHED">Publicar ↑</option>
                       </select>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-3 pt-6 h-full">
                      <button onClick={() => handleEdit(article)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition">Editar</button>
                      <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:text-red-800 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Borrar</button>
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
