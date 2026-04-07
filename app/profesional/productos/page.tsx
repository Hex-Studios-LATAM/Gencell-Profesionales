import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import ProductLeadButton from "../components/ProductLeadButton";

export default async function CatalogoComercialPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      specialties: { include: { specialty: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <p className="text-[10px] font-bold tracking-[0.14em] text-blue-700 uppercase">
                  Acceso privado · Red médica Gencell
                </p>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded text-[10px] font-bold text-blue-600">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                  Exclusivo
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Catálogo Comercial
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Portafolio exclusivo de insumos, nutracéuticos y equipos médicos para especialistas.
              </p>
            </div>
          </div>
        </header>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Catálogo en preparación</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
              El catálogo comercial se encuentra en preparación. Contáctanos para información anticipada de productos.
            </p>
            <a
              href="/profesional#form-atencion"
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150"
            >
              Solicitar información anticipada →
            </a>
          </div>
        )}

        {/* Grid de productos — vitrina consultiva */}
        {products.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
              {products.map((prod) => (
                <article
                  key={prod.id}
                  className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Imagen */}
                  {prod.imageUrl ? (
                    <div className="h-48 bg-slate-100 overflow-hidden relative flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.imageUrl}
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-slate-50 to-blue-50 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                      </svg>
                    </div>
                  )}

                  {/* Contenido */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Categoría */}
                    {prod.category && (
                      <span className="inline-block mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {prod.category.name}
                      </span>
                    )}

                    <h2 className="text-base font-bold text-slate-900 leading-snug tracking-tight mb-2">
                      {prod.name}
                    </h2>

                    {prod.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-3">
                        {prod.description}
                      </p>
                    )}

                    {/* Tags de especialidad */}
                    {prod.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {prod.specialties.slice(0, 3).map((s) => (
                          <span
                            key={s.specialtyId}
                            className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded font-medium"
                          >
                            {s.specialty.name}
                          </span>
                        ))}
                        {prod.specialties.length > 3 && (
                          <span className="text-[10px] text-slate-400 px-1 self-center">
                            +{prod.specialties.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* CTA por producto — client component */}
                    <ProductLeadButton
                      productId={prod.id}
                      productSlug={prod.slug}
                      productName={prod.name}
                      prefillName={session.user?.name || ""}
                      prefillEmail={session.user?.email || ""}
                    />
                  </div>
                </article>
              ))}
            </div>

            {/* CTA banner al fondo */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 mb-0.5">¿Buscas algo específico que no está en el catálogo?</p>
                <p className="text-xs text-slate-500">Tu asesor Gencell puede gestionar pedidos especializados para tu práctica.</p>
              </div>
              <a
                href="/profesional#form-atencion"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
              >
                Pedido especial →
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
