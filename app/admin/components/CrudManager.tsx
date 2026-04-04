"use client";

import { useState, useEffect } from "react";

export type Field = {
  name: string;
  label: string;
  type: "text" | "textarea";
  required?: boolean;
};

export default function CrudManager({
  title,
  endpoint,
  fields,
}: {
  title: string;
  endpoint: string;
  fields: Field[];
}) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formState, setFormState] = useState<any>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Error fetching data");
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [endpoint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `${endpoint}/${editingId}` : endpoint;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Error al guardar");
      }

      setFormState({});
      setEditingId(null);
      await fetchItems();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormState(item);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar el registro?")) return;
    setError("");
    try {
       const res = await fetch(`${endpoint}/${id}`, { method: "DELETE" });
       if (!res.ok) throw new Error("Error al eliminar");
       await fetchItems();
    } catch (err: any) {
       setError(err.message);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormState({});
    setError("");
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      </div>

      {error && <div className="p-3 text-red-700 bg-red-50 border border-red-200 rounded">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-1 bg-white p-6 border rounded shadow-sm h-fit">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {editingId ? "Editar Registro" : "Nuevo Registro"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium mb-1 text-gray-700">{f.label}</label>
                {f.type === "text" ? (
                  <input
                    type="text"
                    required={f.required}
                    value={formState[f.name] || ""}
                    onChange={e => setFormState({ ...formState, [f.name]: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={`Ingresa ${f.label.toLowerCase()}`}
                  />
                ) : (
                  <textarea
                    required={f.required}
                    value={formState[f.name] || ""}
                    onChange={e => setFormState({ ...formState, [f.name]: e.target.value })}
                    className="w-full border border-gray-300 p-2 rounded h-24 focus:ring-2 focus:ring-blue-500 outline-none transition"
                    placeholder={`Ingresa ${f.label.toLowerCase()}`}
                  />
                )}
                {f.name === 'slug' && <p className="text-xs text-gray-500 mt-1">Se autogenera si se deja vacío</p>}
              </div>
            ))}
            <div className="flex gap-2 pt-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition w-full md:w-auto"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
              {editingId && (
                <button 
                  type="button" 
                  onClick={cancelEdit}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listado */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="flex justify-center p-8 bg-white border rounded shadow-sm">
                <span className="text-gray-500">Cargando datos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white border rounded shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    {fields.map(f => (
                      <th key={f.name} className="p-3 font-medium text-gray-600 break-words">{f.label}</th>
                    ))}
                    <th className="p-3 font-medium text-gray-600 w-[150px] text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={fields.length + 1} className="p-6 text-center text-gray-500">
                        No hay registros disponibles. ¡Crea el primero!
                      </td>
                    </tr>
                  ) : (
                    items.map(item => (
                      <tr key={item.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                        {fields.map(f => (
                          <td key={f.name} className="p-3 text-sm text-gray-800 break-words max-w-[200px] truncate">
                            {item[f.name] || "-"}
                          </td>
                        ))}
                        <td className="p-3 text-right">
                          <button 
                            onClick={() => handleEdit(item)} 
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3 transition"
                          >
                            Editar
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)} 
                            className="text-red-500 hover:text-red-700 text-sm font-medium transition"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
