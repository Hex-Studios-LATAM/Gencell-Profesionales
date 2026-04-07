import CrudManager, { Field } from "../../components/CrudManager";

export default function AdminProductosCategoriasPage() {
  const fields: Field[] = [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: false },
    { name: "logoUrl", label: "Logo URL", type: "image", required: false }
  ];

  return (
    <main className="p-8">
      <div className="mb-6">
        <a href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition">
           ← Volver al Panel
        </a>
      </div>
      <CrudManager 
         title="Categorías de Productos" 
         endpoint="/api/product-categories" 
         fields={fields} 
      />
    </main>
  );
}
