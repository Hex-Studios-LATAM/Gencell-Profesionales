"use client";

import { useState, useEffect } from "react";

type Product = {
  id: string;
  name: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  categoryId: string;
  category: { id: string; name: string };
  createdAt: string;
  specialties: { specialty: { id: string; name: string } }[];
};

type Category = { id: string; name: string };
type Specialty = { id: string; name: string };

export default function AdminProductosPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [specialtiesList, setSpecialtiesList] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    categoryId: "",
    description: "",
    imageUrl: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
    specialtyIds: [] as string[]
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, specRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/product-categories"),
        fetch("/api/specialties")
      ]);
      
      if (!prodRes.ok) throw new Error("Error cargando productos");
      
      setProducts(await prodRes.json());
      setCategories(await catRes.json());
      setSpecialtiesList(await specRes.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = async (product: Product) => {
    setIsEditing(true);
    setCurrentId(product.id);
    
    try {
      const res = await fetch(`/api/products/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setFormData({
          name: data.name,
          slug: data.slug,
          categoryId: data.categoryId,
          description: data.description || "",
          imageUrl: data.imageUrl || "",
          status: data.status,
          specialtyIds: data.specialties.map((s: any) => s.specialtyId)
        });
      }
    } catch (e) {
      alert("Error cargando detalles");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto permanentemente?")) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Error al eliminar");
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/products/${id}`, {
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

  const toggleSpecialty = (id: string) => {
    setFormData(prev => {
      const list = prev.specialtyIds.includes(id) 
        ? prev.specialtyIds.filter(x => x !== id)
        : [...prev.specialtyIds, id];
      return { ...prev, specialtyIds: list };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.categoryId) {
       alert("Selecciona una categoría principal");
       return;
    }
    
    const url = isEditing ? `/api/products/${currentId}` : "/api/products";
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
      name: "",
      slug: "",
      categoryId: "",
      description: "",
      imageUrl: "",
      status: "DRAFT",
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
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Catálogo de Productos</h1>
      </div>

      {error && <div className="p-4 bg-red-50 text-red-700 border border-red-100 rounded-xl mb-6 text-sm font-medium">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 self-start sticky top-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 tracking-tight">{isEditing ? "Editar Producto" : "Nuevo Producto"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" />
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
              <label className="block text-sm font-medium text-gray-700 mb-1 text-blue-800 border-t pt-4">Especialidades Relacionadas</label>
              <div className="max-h-40 overflow-y-auto space-y-1 border p-2 rounded bg-gray-50 text-sm">
                 {specialtiesList.length === 0 && <p className="text-gray-400">No hay especialidades cargadas.</p>}
                 {specialtiesList.map(spec => (
                   <label key={spec.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                     <input 
                       type="checkbox" 
                       checked={formData.specialtyIds.includes(spec.id)} 
                       onChange={() => toggleSpecialty(spec.id)} 
                     />
                     <span>{spec.name}</span>
                   </label>
                 ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 border-t pt-4">Descripción (Texto Simple)</label>
              <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none h-40 font-mono text-sm" />
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
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Nombre / Slug</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Categoría / Especialidades</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest">Estado</th>
                <th className="p-5 text-xs font-bold text-slate-500 uppercase tracking-widest w-[160px] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr><td colSpan={4} className="p-10 text-center text-slate-500 font-medium">Cargando catálogo...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={4} className="p-12 text-center text-slate-500 font-medium bg-slate-50/50">No hay productos en el catálogo.</td></tr>
              ) : (
                products.map(prod => (
                  <tr key={prod.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition">
                    <td className="p-5">
                      <div className="font-bold text-slate-900">{prod.name}</div>
                      <div className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mt-2">{prod.slug}</div>
                    </td>
                    <td className="p-5 text-sm font-semibold text-slate-600">
                      <div className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-indigo-100/50 mb-1">{prod.category?.name}</div>
                      <div className="text-xs text-slate-500 mt-2 flex flex-wrap gap-1">
                         {prod.specialties.length > 0 
                           ? prod.specialties.map(s => <span key={s.specialty.id} className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">{s.specialty.name}</span>) 
                           : <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider">Universal</span>}
                      </div>
                    </td>
                    <td className="p-5">
                       <select 
                         value={prod.status}
                         onChange={(e) => handleStatusChange(prod.id, e.target.value)}
                         className={`text-xs font-bold uppercase tracking-wider py-1.5 px-2 outline-none cursor-pointer rounded-lg border ${prod.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-slate-100 text-slate-600 border-slate-200'}`}
                       >
                         <option value="DRAFT">En Borrador</option>
                         <option value="PUBLISHED">Publicado</option>
                       </select>
                    </td>
                    <td className="p-5 text-right flex items-center justify-end gap-3 pt-6 h-full">
                      <button onClick={() => handleEdit(prod)} className="text-indigo-600 hover:text-indigo-800 text-sm font-bold bg-indigo-50 px-3 py-1.5 rounded-lg transition">Editar</button>
                      <button onClick={() => handleDelete(prod.id)} className="text-red-600 hover:text-red-800 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Borrar</button>
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
