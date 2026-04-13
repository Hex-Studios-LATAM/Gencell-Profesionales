"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import TiptapEditor from "@/app/components/TiptapEditor";

type Category = { id: string; name: string };
type Specialty = { id: string; name: string };

function ProductForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");
  const isEditing = !!editId;

  const [categories, setCategories] = useState<Category[]>([]);
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryIds: [] as string[],
    description: "",
    imageUrl: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    specialtyIds: [] as string[]
  });

  useEffect(() => {
    const fetchSelectData = async () => {
      try {
        const [catRes, specRes] = await Promise.all([
          fetch("/api/product-categories"),
          fetch("/api/specialties")
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (specRes.ok) setSpecialtiesList(await specRes.json());

        if (isEditing) {
          const prodRes = await fetch(`/api/products/${editId}`);
          if (prodRes.ok) {
            const data = await prodRes.json();
            setImagePreview(data.imageUrl || "");
            setFormData({
              name: data.name || "",
              slug: data.slug || "",
              categoryIds: data.categories?.map((c: any) => c.id) || [],
              description: data.description || "",
              imageUrl: data.imageUrl || "",
              status: data.status || "DRAFT",
              specialtyIds: data.specialties?.map((s: any) => s.specialtyId) || []
            });
          } else {
            setError("No se pudo cargar el producto para editar.");
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

  const toggleSpecialty = (id: string) => {
    setFormData(prev => {
      const list = prev.specialtyIds.includes(id) 
        ? prev.specialtyIds.filter(x => x !== id)
        : [...prev.specialtyIds, id];
      return { ...prev, specialtyIds: list };
    });
  };

  const saveProduct = async (publishStatus: "DRAFT" | "PUBLISHED") => {
    if (!formData.name.trim()) {
      alert("El nombre es obligatorio.");
      return;
    }
    if (formData.categoryIds.length === 0) {
       alert("Selecciona al menos una categoría principal.");
       return;
    }
    
    setIsSaving(true);
    setError("");
    const url = isEditing ? `/api/products/${editId}` : "/api/products";
    const method = isEditing ? "PATCH" : "POST";

    try {
      let finalImageUrl = formData.imageUrl;
      
      if (imageFile) {
        const upData = new FormData();
        upData.append("file", imageFile);
        upData.append("folder", "products");
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
      if (!res.ok) throw new Error(data.error || "Error al guardar el producto");
      
      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/productos");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Excepción inesperada.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-500 font-medium tracking-tight">Preparando entorno...</p>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen pb-32">
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/admin/productos" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 transition">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Volver al Catálogo
        </Link>
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-widest border ${formData.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
            {formData.status === 'PUBLISHED' ? 'Publicado' : 'Borrador'}
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
              placeholder="Nombre de producto / Activo médico..." 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              className="w-full text-4xl font-extrabold text-slate-900 border-none outline-none focus:ring-0 placeholder:text-slate-300 p-0" 
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Categorías Principales<span className="text-red-500 ml-1">*</span></label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar border border-slate-200 rounded-lg p-3 bg-slate-50">
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

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Imagen del Producto</label>
            <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors group flex flex-col items-center justify-center gap-3 relative">
               {(imagePreview || imageFile) ? (
                 <div className="relative w-full h-48 sm:h-64 bg-slate-200 rounded-lg overflow-hidden shadow-inner group-hover:opacity-90 transition-opacity flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageFile ? URL.createObjectURL(imageFile) : imagePreview} alt="Preview" className="max-w-full max-h-full object-contain" />
                    <button 
                      type="button" 
                      onClick={() => { setImageFile(null); setImagePreview(""); setFormData(f => ({...f, imageUrl: ""})); }} 
                      className="absolute top-3 right-3 bg-white/90 text-red-600 p-2 rounded-full hover:bg-red-600 hover:text-white shadow-sm transition-colors z-10"
                    >
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                 </div>
               ) : (
                 <div className="py-8 text-center px-4 w-full cursor-pointer relative">
                    <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-sm font-medium text-indigo-600 mb-1">Click para subir una imagen</p>
                    <p className="text-xs text-slate-500">JPG o PNG con fondo transparente (Recomendado 800x800)</p>
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
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Especialidades Relacionadas</label>
             <p className="text-xs text-slate-400 mb-4">Selecciona aquellas especialidades a las que recomendarías este activo. Si dejas todo desmarcado, se considera un artículo Universal.</p>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {specialtiesList.length === 0 && <p className="text-gray-400 text-sm">No hay especialidades disponibles.</p>}
                {specialtiesList.map(spec => (
                  <label key={spec.id} className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.specialtyIds.includes(spec.id) ? 'bg-indigo-50/50 border-indigo-200 shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.specialtyIds.includes(spec.id)}
                      onChange={() => toggleSpecialty(spec.id)}
                      className="rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 w-4 h-4"
                    />
                    <span className={`text-sm ${formData.specialtyIds.includes(spec.id) ? 'text-indigo-900 font-semibold' : 'text-slate-700'}`}>{spec.name}</span>
                  </label>
                ))}
             </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Descripción Detallada (Rich Text) - Opcional</label>
            <div className="min-h-[400px] border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-shadow">
               <TiptapEditor
                 value={formData.description}
                 onChange={(content) => setFormData({...formData, description: content})}
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
               {isSaving ? "Guardando en la base de datos..." : "Asegúrate de revisar la información antes de publicarla."}
             </p>
           </div>
           <div className="flex items-center gap-3 w-full sm:w-auto">
             <button 
               type="button" 
               disabled={isSaving || success}
               onClick={() => saveProduct("DRAFT")}
               className="flex-1 sm:flex-none justify-center items-center px-6 py-2.5 bg-white border border-slate-300 text-slate-700 text-sm font-semibold rounded-lg hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 transition-all disabled:opacity-50"
             >
               {success ? "Completado" : "Mantener Oculto (Borrador)"}
             </button>
             <button 
               type="button" 
               disabled={isSaving || success}
               onClick={() => saveProduct("PUBLISHED")}
               className={`flex-1 sm:flex-none justify-center items-center px-6 py-2.5 text-white text-sm font-semibold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-50 inline-flex ${success ? 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500 shadow-emerald-500/20' : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600 shadow-indigo-600/20'}`}
             >
               {isSaving ? (
                 <>
                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                   Guardando...
                 </>
               ) : success ? (
                 <>
                   <svg className="w-5 h-5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                   ¡Guardado Exitosamente!
                 </>
               ) : (
                 "Publicar en Catálogo"
               )}
             </button>
           </div>
        </div>
      </div>
    </main>
  );
}

export default function AdminProductosCrearPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
         <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
         <p className="text-slate-500 font-medium">Cargando...</p>
      </div>
    }>
      <ProductForm />
    </Suspense>
  )
}
