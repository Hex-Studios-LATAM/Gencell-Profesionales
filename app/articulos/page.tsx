import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ArticulosPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-6">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Artículos Médicos</h1>
          <p className="text-lg text-gray-600">Conocimiento, guías y publicaciones de nuestros profesionales.</p>
        </header>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
             <p className="text-gray-500 text-lg">Aún no hay artículos publicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/articulos/${article.slug}`} className="group h-full">
                <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition border border-gray-100 h-full flex flex-col overflow-hidden">
                  {article.imageUrl ? (
                    <div className="h-48 bg-gray-200 overflow-hidden">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-48 bg-blue-50 flex items-center justify-center text-blue-200">
                       <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="text-xs font-semibold tracking-wider text-blue-600 uppercase mb-2">
                       {article.category?.name}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-auto text-xs text-gray-400">
                       {new Date(article.createdAt).toLocaleDateString()}
                    </div>
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
