import prisma from "@/lib/prisma";
import Link from "next/link";

export default async function ArticulosPage() {
  const articles = await prisma.article.findMany({
    where: { status: "PUBLISHED" },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-16 text-center max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Publicaciones Clínicas</h1>
          <p className="text-lg text-slate-500 leading-relaxed">Conocimiento, guías y casos de estudio redactados por nuestra red de profesionales de la salud.</p>
        </header>

        {articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
             <p className="text-slate-500 text-lg">Aún no hay artículos publicados en el ecosistema.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <Link key={article.id} href={`/articulos/${article.slug}`} className="group h-full block">
                <article className="bg-white rounded-3xl shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition duration-300 border border-slate-100 h-full flex flex-col overflow-hidden relative">
                  {article.imageUrl ? (
                    <div className="h-52 bg-slate-100 overflow-hidden relative">
                       {/* eslint-disable-next-line @next/next/no-img-element */}
                       <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                       <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/10 transition-colors duration-300"></div>
                    </div>
                  ) : (
                    <div className="h-52 bg-indigo-50 flex items-center justify-center text-indigo-300 border-b border-slate-100 relative overflow-hidden group-hover:bg-indigo-100 transition">
                       <svg className="w-16 h-16 transform group-hover:scale-110 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 7H20" /></svg>
                    </div>
                  )}
                  <div className="p-8 flex-1 flex flex-col relative bg-white">
                    <div className="flex flex-wrap gap-2 mb-4">
                       <span className="inline-flex items-center px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-md uppercase tracking-wider border border-indigo-100/50">
                          {article.category?.name}
                       </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition tracking-tight leading-tight">
                      {article.title}
                    </h2>
                    {article.excerpt && (
                      <p className="text-slate-500 text-sm mb-6 line-clamp-3 leading-relaxed">
                        {article.excerpt}
                      </p>
                    )}
                    <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                       <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                          {new Date(article.createdAt).toLocaleDateString()}
                       </span>
                       <span className="text-indigo-600 font-bold text-sm tracking-wide group-hover:translate-x-1 transition-transform">Leer más</span>
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
