"use client";

import { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  categoryId: string;
  category: { id: string; name: string };
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
    status: "DRAFT" as "DRAFT" | "PUBLISHED"
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
      <div className="mb-6">
        <a href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition mb-2">
           ← Volver al Panel
        </a>
        <h1 className="text-3xl font-bold text-gray-900">Artículos</h1>
      </div>

      {error && <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white p-6 rounded shadow-sm border border-gray-200 self-start">
          <h2 className="text-xl font-bold mb-4">{isEditing ? "Editar Artículo" : "Nuevo Artículo"}</h2>
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
        <div className="lg:col-span-2 bg-white rounded shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="p-3 font-medium text-gray-600">Título / Slug</th>
                <th className="p-3 font-medium text-gray-600">Categoría</th>
                <th className="p-3 font-medium text-gray-600">Estado</th>
                <th className="p-3 font-medium text-gray-600 w-[150px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && articles.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">Cargando...</td></tr>
              ) : articles.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay artículos</td></tr>
              ) : (
                articles.map(article => (
                  <tr key={article.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="p-3">
                      <div className="font-medium text-gray-900">{article.title}</div>
                      <div className="text-xs text-gray-500">{article.slug}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">
                      {article.category?.name}
                    </td>
                    <td className="p-3">
                       <select 
                         value={article.status}
                         onChange={(e) => handleStatusChange(article.id, e.target.value)}
                         className={`text-xs border rounded p-1 outline-none ${article.status === 'PUBLISHED' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}`}
                       >
                         <option value="DRAFT">DRAFT</option>
                         <option value="PUBLISHED">PUBLISHED</option>
                       </select>
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => handleEdit(article)} className="text-blue-600 hover:underline text-sm mr-3">Editar</button>
                      <button onClick={() => handleDelete(article.id)} className="text-red-600 hover:underline text-sm">Borrar</button>
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
