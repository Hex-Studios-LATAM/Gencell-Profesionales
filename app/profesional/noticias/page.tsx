import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function NoticiasPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { specialtyId: true },
  });

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      contentType: "NEWS",
      OR: [
        { audienceType: "ALL_DOCTORS" },
        {
          audienceType: "BY_SPECIALTY",
          specialties: { some: { specialtyId: user?.specialtyId as string } },
        },
      ],
    },
    include: { categories: true },
    orderBy: { createdAt: "desc" },
  });

  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header editorial — left-aligned */}
        <header className="mb-8 pb-6 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-amber-600 uppercase mb-2">
                Industria Médica · Curada para la red
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Noticias
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                Selección editorial de farma, biotecnología y tecnología médica para especialistas.
              </p>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide uppercase whitespace-nowrap hidden sm:block pt-1">
              {new Date().toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
        </header>

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Próximamente</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
              El equipo de Gencell publicará las primeras noticias para la red de especialistas.
            </p>
            <Link href="/profesional" className="text-sm font-semibold text-blue-600 hover:underline">
              ← Volver al inicio
            </Link>
          </div>
        )}

        {articles.length > 0 && (
          <div className="space-y-8">

            {/* Noticia destacada — horizontal, full-width */}
            {featured && (
              <Link href={`/profesional/publicaciones/${featured.slug}`} className="group block">
                <article className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 flex flex-col md:flex-row">
                  {featured.imageUrl ? (
                    <div className="md:w-80 h-52 md:h-auto bg-slate-100 flex-shrink-0 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={featured.imageUrl}
                        alt={featured.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="md:w-80 h-40 md:h-auto bg-gradient-to-br from-amber-50 to-slate-100 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-12 h-12 text-amber-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider border border-amber-200/60">
                        Destacada
                      </span>
                      {featured.categories && featured.categories.length > 0 && (
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {featured.categories.map((c: any) => c.name).join(", ")}
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400">
                        {new Date(featured.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug tracking-tight mb-2 group-hover:text-blue-700 transition-colors duration-150">
                      {featured.title}
                    </h2>
                    {featured.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-4">
                        {featured.excerpt}
                      </p>
                    )}
                    <span className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-150">
                      Leer noticia completa
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                    </span>
                  </div>
                </article>
              </Link>
            )}

            {/* Lista editorial — resto de noticias */}
            {rest.length > 0 && (
              <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
                {rest.map((article) => (
                  <Link key={article.id} href={`/profesional/publicaciones/${article.slug}`} className="group block">
                    <div className="flex items-start gap-4 p-5 hover:bg-slate-50 transition-colors duration-150">
                      {/* Thumbnail */}
                      {article.imageUrl ? (
                        <div className="w-18 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-slate-100">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={article.imageUrl}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            style={{ width: 72, height: 64 }}
                          />
                        </div>
                      ) : (
                        <div className="flex-shrink-0 w-[72px] h-16 rounded-lg bg-amber-50 flex items-center justify-center">
                          <svg className="w-6 h-6 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                          </svg>
                        </div>
                      )}

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {article.categories && article.categories.length > 0 && (
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              {article.categories.map((c: any) => c.name).join(", ")}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(article.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short" })}
                          </span>
                        </div>
                        <h2 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2 group-hover:text-blue-700 transition-colors duration-150">
                          {article.title}
                        </h2>
                      </div>

                      {/* Arrow */}
                      <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-150 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* CTA contextual al fondo */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 mb-0.5">¿Algún tema de interés para tu práctica?</p>
                <p className="text-xs text-slate-500">Contacta a tu asesor Gencell para información especializada.</p>
              </div>
              <Link
                href="/profesional#form-atencion"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
              >
                Consultar con un especialista →
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
