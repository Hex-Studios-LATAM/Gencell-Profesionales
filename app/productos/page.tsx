import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function PublicProductosPage() {
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: { 
       category: true,
       specialties: { include: { specialty: true } }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Catálogo de Productos</h1>
          <p className="text-lg text-gray-600">Descubre equipos médicos integrales y líneas certificadas.</p>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-lg">Aún no hay productos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => (
              <Link key={prod.id} href={`/productos/${prod.slug}`} className="group h-full">
                <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 h-full flex flex-col overflow-hidden">
                  {prod.imageUrl ? (
                    <div className="h-56 bg-gray-200 overflow-hidden">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-56 bg-slate-50 flex items-center justify-center text-slate-300 border-b">
                       <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex flex-wrap gap-2 mb-3">
                       <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md uppercase tracking-wide">
                          {prod.category?.name}
                       </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition">
                      {prod.name}
                    </h2>
                    {prod.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                    {prod.specialties.length > 0 && (
                      <div className="mt-auto pt-4 border-t border-gray-100 flex flex-wrap gap-1">
                         {prod.specialties.map(s => (
                            <span key={s.specialtyId} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-1 rounded">
                               {s.specialty.name}
                            </span>
                         ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
