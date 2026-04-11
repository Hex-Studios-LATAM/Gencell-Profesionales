"use client";

import { useState, useEffect, useRef } from "react";
import QuillEditor from "@/app/components/QuillEditor";

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
  const [specialties, setSpecialties] = useState<{ id: string; name: string }[]>([]);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    categoryId: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    contentType: "ARTICLE" as "ARTICLE" | "NEWS" | "WHITE_PAPER",
    status: "DRAFT" as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED",
    audienceType: "ALL_DOCTORS",
    specialtyIds: [] as string[]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [artRes, catRes, specRes] = await Promise.all([
        fetch("/api/articles"),
        fetch("/api/article-categories"),
        fetch("/api/specialties")
      ]);
      
      if (!artRes.ok || !catRes.ok || !specRes.ok) throw new Error("Error cargando datos");
      
      setArticles(await artRes.json());
      setCategories(await catRes.json());
      setSpecialties(await specRes.json());
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
        setImagePreview(data.imageUrl || "");
        setImageFile(null);
        setFormData({
          title: data.title,
          slug: data.slug,
          categoryId: data.categoryId,
          excerpt: data.excerpt || "",
          content: data.content,
          imageUrl: data.imageUrl || "",
          contentType: data.contentType || "ARTICLE",
          status: data.status,
          audienceType: data.audienceType || "ALL_DOCTORS",
          specialtyIds: data.specialties?.map((s: any) => s.specialtyId) || []
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
    if (formData.audienceType === "BY_SPECIALTY" && formData.specialtyIds.length === 0) {
       alert("Debes seleccionar al menos una especialidad");
       return;
    }
    
    const url = isEditing ? `/api/articles/${currentId}` : "/api/articles";
    const method = isEditing ? "PATCH" : "POST";

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const upData = new FormData();
        upData.append("file", imageFile);
        upData.append("folder", "articles");
        const upRes = await fetch("/api/upload", { method: "POST", body: upData });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || "Error al subir la imagen");
        finalImageUrl = upJson.url;
      }

      const submitData = { ...formData, imageUrl: finalImageUrl };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
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
    setImageFile(null);
    setImagePreview("");
    setFormData({
      title: "",
      slug: "",
      categoryId: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      contentType: "ARTICLE",
      status: "DRAFT",
      audienceType: "ALL_DOCTORS",
      specialtyIds: []
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Contenido</label>
              <select value={formData.contentType} onChange={e => setFormData({...formData, contentType: e.target.value as any})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="ARTICLE">Artículo Clínico</option>
                <option value="NEWS">Noticia</option>
                <option value="WHITE_PAPER">White Paper</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alcance / Audiencia</label>
              <select value={formData.audienceType} onChange={e => setFormData({...formData, audienceType: e.target.value as any, specialtyIds: e.target.value === 'ALL_DOCTORS' ? [] : formData.specialtyIds})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="ALL_DOCTORS">Todos los Doctores (Global)</option>
                <option value="BY_SPECIALTY">Solo Especialidades Específicas</option>
              </select>
            </div>
            
            {formData.audienceType === "BY_SPECIALTY" && (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
                <label className="block text-sm font-bold text-slate-700 mb-3">Especialidades Relacionadas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2">
                  {specialties.map(spec => (
                    <label key={spec.id} className="flex items-center space-x-2 bg-white p-2 border border-slate-100 rounded shadow-sm hover:border-indigo-200 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={formData.specialtyIds.includes(spec.id)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData({...formData, specialtyIds: [...formData.specialtyIds, spec.id]});
                          else setFormData({...formData, specialtyIds: formData.specialtyIds.filter(id => id !== spec.id)});
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700">{spec.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="DRAFT">Borrador</option>
                <option value="PENDING_REVIEW">Revisión Pendiente</option>
                <option value="PUBLISHED">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagen Principal</label>
              <div className="border border-slate-200 rounded p-3 bg-slate-50 flex flex-col gap-3">
                 {(imagePreview || imageFile) && (
                   <div className="relative w-full h-32 bg-slate-200 rounded overflow-hidden shadow-inner">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageFile ? URL.createObjectURL(imageFile) : imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => { setImageFile(null); setImagePreview(""); setFormData(f => ({...f, imageUrl: ""})); }} className="absolute top-2 right-2 bg-red-600/80 text-white p-1 rounded-full hover:bg-red-700">
                         <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                   </div>
                 )}
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={e => {
                     if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                   }} 
                   className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 outline-none cursor-pointer" 
                 />
                 <p className="text-xs text-slate-400">Si no configuras una nueva, se mantendrá la actual.</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resumen (Excerpt)</label>
              <textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-20" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contenido (Editor Visual)</label>
              <div className="border border-slate-200 rounded overflow-hidden shadow-sm">
                 <QuillEditor
                   value={formData.content}
                   onChange={(content) => setFormData({...formData, content})}
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
