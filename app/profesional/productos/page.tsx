import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import ProductCatalogClient from "./ProductCatalogClient";

export default async function CatalogoComercialPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  // Fetch published products with relations
  const products = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      category: true,
      specialties: { include: { specialty: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch categories that have at least one published product
  const categories = await prisma.productCategory.findMany({
    where: {
      products: { some: { status: "PUBLISHED" } },
    },
    orderBy: { name: "asc" },
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

        {/* Empty state — no products at all */}
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

        {/* Product catalog with category filter */}
        {products.length > 0 && (
          <ProductCatalogClient
            products={products}
            categories={categories}
            userName={session.user?.name || ""}
            userEmail={session.user?.email || ""}
          />
        )}
      </div>
    </main>
  );
}
