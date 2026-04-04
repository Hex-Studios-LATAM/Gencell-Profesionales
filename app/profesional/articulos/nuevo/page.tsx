"use client";

import { useState, useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { useRouter } from "next/navigation";

export default function NuevoArticuloProfesional() {
  const router = useRouter();
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    categoryId: "",
    excerpt: "",
    content: "",
    status: "DRAFT" as "DRAFT" | "PENDING_REVIEW"
  });

  useEffect(() => {
    fetch("/api/article-categories")
      .then(r => r.json())
      .then(data => setCategories(Array.isArray(data) ? data : []));
  }, []);

  const handleSubmit = async (e: React.FormEvent, isSubmitForReview: boolean) => {
    e.preventDefault();
    if (!formData.categoryId) {
       alert("Selecciona una categoría");
       return;
    }
    
    setLoading(true);
    const finalStatus = isSubmitForReview ? "PENDING_REVIEW" : "DRAFT";

    try {
      const res = await fetch("/api/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, status: finalStatus })
      });
      
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }
      
      router.push("/profesional/articulos");
    } catch (err: any) {
      alert(err.message);
      setLoading(false);
    }
  };

  return (
    <main className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <a href="/profesional/articulos" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition mb-2">
           ← Regresar
        </a>
        <h1 className="text-3xl font-bold text-gray-900">Escribir Artículo</h1>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del Artículo</label>
            <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none text-lg font-medium" placeholder="Ej. Avances en Terapias..." />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                <option value="" disabled>Seleccionar...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Breve Resumen (Excerpt)</label>
            <textarea required value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} className="w-full border p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none h-20" placeholder="Un pequeño extracto de 2 líneas de lo que trata el artículo..." />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo Técnico</label>
            <div className="border rounded-xl overflow-hidden shadow-sm">
               <Editor
                 apiKey="no-api-key"
                 value={formData.content}
                 onEditorChange={(content) => setFormData({...formData, content})}
                 init={{
                   height: 600,
                   menubar: false,
                   plugins: ['advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'table', 'wordcount'],
                   toolbar: 'undo redo | blocks | bold italic underline | bullist numlist | link image | table',
                   content_style: 'body { font-family:Inter,Helvetica,Arial,sans-serif; font-size:16px; color:#1f2937 }'
                 }}
               />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-100">
            <button disabled={loading} type="button" onClick={(e) => handleSubmit(e, false)} className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded hover:bg-gray-200 transition disabled:opacity-50">
              Solo Guardar Borrador
            </button>
            <button disabled={loading} type="button" onClick={(e) => handleSubmit(e, true)} className="px-6 py-3 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition disabled:opacity-50 shadow-md">
              Mandar a Revisión Editorial
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
