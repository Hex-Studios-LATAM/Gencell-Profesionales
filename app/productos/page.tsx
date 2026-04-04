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
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Equipos y Suplementos</h1>
          <p className="text-lg text-slate-500 leading-relaxed">Descubre nuestro catálogo unificado de insumos técnicos validados por expertos para consulta diaria.</p>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
             <p className="text-gray-500 text-lg">Aún no hay productos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((prod) => (
              <Link key={prod.id} href={`/productos/${prod.slug}`} className="group h-full block">
                <article className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition duration-300 border border-slate-100 h-full flex flex-col overflow-hidden relative">
                  {prod.imageUrl ? (
                    <div className="h-60 bg-slate-100 overflow-hidden relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={prod.imageUrl} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-60 bg-slate-50 flex items-center justify-center text-slate-300 border-b border-slate-100">
                       <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col relative bg-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                       <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-indigo-100/50">
                          {prod.category?.name}
                       </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition tracking-tight">
                      {prod.name}
                    </h2>
                    {prod.description && (
                      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {prod.description}
                      </p>
                    )}
                    {prod.specialties.length > 0 && (
                      <div className="mt-auto pt-5 border-t border-slate-100 flex flex-wrap gap-1.5">
                         {prod.specialties.map(s => (
                            <span key={s.specialtyId} className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200/60 px-2 py-1 rounded shadow-sm">
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
