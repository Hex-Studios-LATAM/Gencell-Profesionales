export default function AdminDashboardPage() {
  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
      <p className="text-gray-600">Bienvenido al área administrativa.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/admin/aprobaciones" className="p-4 border rounded shadow-sm hover:shadow-md transition bg-blue-50 text-blue-900 border-blue-200 font-medium lg:col-span-3 mb-2 flex items-center justify-between">
           <span>Solicitudes de Profesionales (Aprobaciones)</span>
           <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Gestión de Acceso</span>
        </a>
        <a href="/admin/especialidades" className="p-4 border rounded shadow-sm hover:shadow-md transition">Especialidades</a>
        <a href="/admin/categorias/articulos" className="p-4 border rounded shadow-sm hover:shadow-md transition">Categorías de Artículos</a>
        <a href="/admin/categorias/productos" className="p-4 border rounded shadow-sm hover:shadow-md transition">Categorías de Productos</a>
        <a href="/admin/articulos" className="p-4 border rounded shadow-sm hover:shadow-md transition">Artículos</a>
        <a href="/admin/productos" className="p-4 border rounded shadow-sm hover:shadow-md transition">Productos</a>
      </div>
    </main>
  );
}
