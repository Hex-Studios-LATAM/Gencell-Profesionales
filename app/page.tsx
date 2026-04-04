export default function HomePage() {
  return (
    <main className="p-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gencell Profesionales</h1>
      <p className="text-gray-600">Bienvenido al sitio público de salud e información profesional.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/admin/aprobaciones" className="p-4 border rounded shadow-sm hover:shadow-md transition bg-blue-50 text-blue-900 border-blue-200 font-medium col-span-full mb-2">Solicitudes de Profesionales (Aprobaciones)</a>
        <a href="/admin/especialidades" className="p-4 border rounded shadow-sm hover:shadow-md transition">Especialidades</a>
        <a href="/admin/productos" className="p-4 border rounded shadow-sm hover:shadow-md transition">Productos Administrativo</a>
        <a href="/productos" className="block p-4 border rounded hover:bg-gray-50 transition text-blue-600 font-medium">
           Ver Catálogo de Productos
        </a>
        <a href="/articulos" className="block p-4 border rounded hover:bg-gray-50 transition text-blue-600 font-medium">
          Ver Artículos Publicados
        </a>
        <a href="/admin" className="text-purple-600 hover:underline">Área Admin</a>
        <a href="/registro-profesional" className="text-green-600 hover:underline font-medium">Registro Profesional</a>
      </div>
    </main>
  );
}
