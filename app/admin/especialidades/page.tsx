import CrudManager, { Field } from "../components/CrudManager";

export default function AdminEspecialidadesPage() {
  const fields: Field[] = [
    { name: "name", label: "Nombre", type: "text", required: true },
    { name: "slug", label: "Slug", type: "text", required: false },
    { name: "description", label: "Descripción", type: "textarea", required: false },
  ];

  return (
    <main className="p-8">
      <div className="mb-6">
        <a href="/admin" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition">
           ← Volver al Panel
        </a>
      </div>
      <CrudManager 
         title="Especialidades" 
         endpoint="/api/specialties" 
         fields={fields} 
      />
    </main>
  );
}
