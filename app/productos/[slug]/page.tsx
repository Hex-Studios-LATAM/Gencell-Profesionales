import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
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
    <main className="min-h-screen bg-white">
      {/* Header Breve */}
      <div className="bg-gray-50 border-b border-gray-200 py-6">
         <div className="max-w-5xl mx-auto px-6">
            <Link href="/productos" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition flex items-center gap-1">
               ← Volver al catálogo
            </Link>
         </div>
      </div>

      <article className="max-w-5xl mx-auto px-6 py-12 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Lado Imagen */}
        <div className="w-full bg-gray-100 rounded-2xl overflow-hidden shadow-sm border border-gray-200 aspect-square flex items-center justify-center">
           {product.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
             <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
           ) : (
             <svg className="w-32 h-32 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
           )}
        </div>
        
        {/* Lado Texto */}
        <div className="flex flex-col h-full py-4">
           <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wider">
                 {product.category?.name}
              </span>
           </div>

           <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6 leading-tight tracking-tight">
             {product.name}
           </h1>

           <div className="prose prose-lg prose-blue max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap mb-10">
              {product.description}
           </div>

           {product.specialties.length > 0 && (
             <div className="mt-auto border-t border-gray-100 pt-6">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4">Especialidades Relacionadas</h3>
                <div className="flex flex-wrap gap-2">
                   {product.specialties.map(s => (
                      <span key={s.specialtyId} className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-medium">
                         {s.specialty.name}
                      </span>
                   ))}
                </div>
             </div>
           )}
        </div>
      </article>
    </main>
  );
}
