"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TiptapEditor from "@/app/components/TiptapEditor";

type Category = { id: string; name: string };
type Specialty = { id: string; name: string };

function ArticleForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    contentType: "ARTICLE" as "ARTICLE" | "NEWS" | "WHITE_PAPER",
    status: "DRAFT" as "DRAFT" | "PENDING_REVIEW" | "PUBLISHED",
    audienceType: "ALL_DOCTORS",
    categoryIds: [] as string[],
    specialtyIds: [] as string[]
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, specRes] = await Promise.all([
          fetch("/api/article-categories"),
          fetch("/api/specialties")
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (specRes.ok) setSpecialties(await specRes.json());

        if (isEditing) {
          const artRes = await fetch(`/api/articles/${editId}`);
          if (artRes.ok) {
            const data = await artRes.json();
            setImagePreview(data.imageUrl || "");
            setFormData({
              title: data.title || "",
              slug: data.slug || "",
              excerpt: data.excerpt || "",
              content: data.content || "",
              imageUrl: data.imageUrl || "",
              contentType: data.contentType || "ARTICLE",
              status: data.status || "DRAFT",
              audienceType: data.audienceType || "ALL_DOCTORS",
              categoryIds: data.categories?.map((c: any) => c.id) || [],
              specialtyIds: data.specialties?.map((s: any) => s.specialtyId) || []
            });
          } else {
            setError("No se pudo cargar el artículo para editar.");
          }
        }
      } catch (err) {
        console.error("Error loading initial data", err);
        setError("Error de conexión al cargar datos.");
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchSelectData();
  }, [isEditing, editId]);

  const saveArticle = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    if (!formData.title.trim()) {
      alert("El título es obligatorio.");
      return;
    }
    if (formData.categoryIds.length === 0) {
       alert("Selecciona al menos una categoría antes de guardar.");
       return;
    }
    if (formData.audienceType === "BY_SPECIALTY" && formData.specialtyIds.length === 0) {
       alert("Debes seleccionar al menos una especialidad.");
       return;
    }
    
    setIsSaving(true);
    setError("");
    const url = isEditing ? `/api/articles/${editId}` : "/api/articles";
    const method = isEditing ? "PATCH" : "POST";

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const upData = new FormData();
        upData.append("file", imageFile);
        upData.append("folder", "articles");
        const upRes = await fetch("/api/upload", { method: "POST", body: upData });
        const upJson = await upRes.json();
        if (!upRes.ok) throw new Error(upJson.error || "Error al subir la imagen principal");
        finalImageUrl = upJson.url;
      }

      const submitData = { 
        ...formData, 
        imageUrl: finalImageUrl, 
        status: publishStatus 
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar el artículo");
      
      router.push("/admin/articulos");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium tracking-tight">Preparando entorno de redacción...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen pb-32">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/articulos" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver a Artículos
        </Link>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-widest border ${formData.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {formData.status === 'PUBLISHED' ? 'Público' : 'Borrador'}
          </span>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {/* Main Form Fields */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-24">
        <div className="p-8 space-y-8">
          
          {/* Title Area */}
          <div>
            <input 
              type="text" 
              placeholder="Escribe el título principal aquí..." 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              className="w-full text-4xl font-extrabold text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-300 p-0" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categorías Principales<span className="text-red-500 ml-1">*</span></label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-lg p-3 bg-slate-50">
                {categories.length === 0 && (
                  <p className="text-slate-400 text-sm italic col-span-full">No hay categorías creadas. Crea una primero.</p>
                )}
                {categories.map(c => (
                  <label key={c.id} className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.categoryIds?.includes(c.id) ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.categoryIds?.includes(c.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) setFormData({...formData, categoryIds: [...formData.categoryIds, c.id]});
                        else setFormData({...formData, categoryIds: formData.categoryIds.filter(id => id !== c.id)});
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className={`text-sm ${formData.categoryIds?.includes(c.id) ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>{c.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tipo de Contenido</label>
              <select 
                value={formData.contentType} 
                onChange={e => setFormData({...formData, contentType: e.target.value as any})} 
                className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-slate-50 hover:bg-white transition-colors text-sm font-medium text-slate-700"
              >
                <option value="ARTICLE">Artículo Clínico</option>
                <option value="NEWS">Noticia / Anuncio</option>
                <option value="WHITE_PAPER">White Paper</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Imagen Principal Conmemorativa</label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors group flex flex-col items-center justify-center gap-3 relative">
               {(imagePreview || imageFile) ? (
                 <div className="relative w-full h-48 sm:h-64 bg-slate-200 rounded-lg overflow-hidden shadow-inner group-hover:opacity-90 transition-opacity">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageFile ? URL.createObjectURL(imageFile) : imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(""); setFormData(f => ({...f, imageUrl: ""})); }} 
                      className="absolute top-3 right-3 bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white shadow-sm transition-colors"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
               ) : (
                 <div className="py-8 text-center px-4 w-full cursor-pointer relative">
                    <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Click para subir una imagen</p>
                    <p className="text-xs text-slate-500">JPG, PNG o WEBP (Recomendado 1200x630)</p>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={e => {
                        if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                      }} 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                    />
                 </div>
               )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Público Objetivo</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <label className={`flex p-3 border rounded-xl cursor-pointer transition-colors ${formData.audienceType === 'ALL_DOCTORS' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                 <input type="radio" value="ALL_DOCTORS" checked={formData.audienceType === 'ALL_DOCTORS'} onChange={() => setFormData({...formData, audienceType: 'ALL_DOCTORS', specialtyIds: []})} className="mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                 <div className="ml-3">
                   <h4 className={`text-sm font-bold ${formData.audienceType === 'ALL_DOCTORS' ? 'text-indigo-900' : 'text-slate-900'}`}>Plataforma Global</h4>
                   <p className="text-xs text-slate-500 mt-0.5">Visible para cualquier profesional dentro de Gencell.</p>
                 </div>
               </label>
               <label className={`flex p-3 border rounded-xl cursor-pointer transition-colors ${formData.audienceType === 'BY_SPECIALTY' ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                 <input type="radio" value="BY_SPECIALTY" checked={formData.audienceType === 'BY_SPECIALTY'} onChange={() => setFormData({...formData, audienceType: 'BY_SPECIALTY'})} className="mt-0.5 text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                 <div className="ml-3">
                   <h4 className={`text-sm font-bold ${formData.audienceType === 'BY_SPECIALTY' ? 'text-indigo-900' : 'text-slate-900'}`}>Solo Especialidades</h4>
                   <p className="text-xs text-slate-500 mt-0.5">Visible solo para los campos médicos seleccionados.</p>
                 </div>
               </label>
            </div>
            
            {formData.audienceType === "BY_SPECIALTY" && (
              <div className="mt-4 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Especialidades Permitidas</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                  {specialties.map(spec => (
                    <label key={spec.id} className={`flex items-center space-x-2 p-2 border rounded-lg cursor-pointer transition-colors ${formData.specialtyIds.includes(spec.id) ? 'bg-indigo-50/50 border-indigo-200' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                      <input 
                        type="checkbox" 
                        checked={formData.specialtyIds.includes(spec.id)}
                        onChange={(e) => {
                          if (e.target.checked) setFormData({...formData, specialtyIds: [...formData.specialtyIds, spec.id]});
                          else setFormData({...formData, specialtyIds: formData.specialtyIds.filter(id => id !== spec.id)});
                        }}
                        className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300"
                      />
                      <span className={`text-sm ${formData.specialtyIds.includes(spec.id) ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>{spec.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Resumen Editorial (Excerpt)</label>
            <textarea 
              value={formData.excerpt} 
              onChange={e => setFormData({...formData, excerpt: e.target.value})} 
              placeholder="Un breve resumen que aparecerá en previsualizaciones estructuradas..."
              className="w-full border border-slate-200 p-3 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none h-24 text-sm resize-none bg-slate-50 hover:bg-white transition-colors" 
            />
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cuerpo de la Publicación</label>
            <div className="min-h-[400px] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-shadow">
               <TiptapEditor
                 value={formData.content}
                 onChange={(content) => setFormData({...formData, content})}
               />
            </div>
          </div>
        </div>
      </div>
      
      {/* Sticky Bottom Context Actions */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white/80 backdrop-blur-md border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
           <div className="hidden sm:block">
             <p className="text-sm font-medium text-slate-500">
               {isSaving ? "Guardando cambios..." : "Los cambios no guardados se perderán si sales."}
             </p>
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <button 
               type="button" 
               disabled={isSaving}
               onClick={() => saveArticle("DRAFT")}
               className="flex-1 sm:flex-none justify-center items-center px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50"
             >
               Guardar como Borrador
             </button>
             <button 
               type="button" 
               disabled={isSaving}
               onClick={() => saveArticle("PUBLISHED")}
               className="flex-1 sm:flex-none justify-center items-center px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition-all disabled:opacity-50 shadow-indigo-600/20 inline-flex"
             >
               {isSaving ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Publicando...
                 </>
               ) : (
                 "Publicar Artículo"
               )}
             </button>
           </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminArticulosCrearPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
         <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-slate-500 font-medium">Cargando editor...</p>
      </div>
    }>
      <ArticleForm />
    </Suspense>
  )
}
