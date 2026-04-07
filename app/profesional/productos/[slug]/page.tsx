import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import LeadCTA from "../../components/LeadCTA";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const session = await auth();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      specialties: { include: { specialty: true } }
    }
  });

  if (!product || product.status !== "PUBLISHED") {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 py-6 sticky top-0 z-40 shadow-sm shadow-slate-100/50">
        <div className="max-w-6xl mx-auto px-6">
          <Link href="/profesional/productos" className="text-slate-500 hover:text-sky-600 text-sm font-semibold transition flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Volver al catálogo
          </Link>
        </div>
      </div>

      <article className="max-w-6xl mx-auto px-6 py-12 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        <div className="lg:col-span-6 w-full bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 aspect-square flex items-center justify-center p-4">
          {product.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
          )}
        </div>

        <div className="lg:col-span-6 flex flex-col h-full py-4 lg:py-8 lg:sticky lg:top-32 gap-8">
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center px-3.5 py-1.5 bg-indigo-50 text-indigo-700 text-[11px] font-bold rounded-lg uppercase tracking-widest border border-indigo-100/50 shadow-sm">
                {product.category?.name}
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              {product.name}
            </h1>

            <div className="prose prose-lg prose-slate prose-indigo max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap">
              {product.description}
            </div>

            {product.specialties.length > 0 && (
              <div className="mt-8 border-t border-slate-200 pt-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Especialidades Relacionadas</h3>
                <div className="flex flex-wrap gap-2">
                  {product.specialties.map(s => (
                    <span key={s.specialtyId} className="bg-white border border-slate-200 shadow-sm text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold">
                      {s.specialty.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* CTA Atención / Pedido */}
          <div className="border-t border-slate-100 pt-8">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">¿Te interesa este producto?</p>
            <LeadCTA
              sourceType="PRODUCT_CTA"
              sourceId={product.id}
              sourceLabel={product.name}
              defaultIntent="ORDER_REQUEST"
              prefillName={session?.user?.name || ""}
              prefillEmail={session?.user?.email || ""}
            />
          </div>
        </div>
      </article>
    </main>
  );
}
