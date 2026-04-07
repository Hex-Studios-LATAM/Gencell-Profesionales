import prisma from "@/lib/prisma";
import Link from "next/link";
import { auth } from "@/auth";

export default async function PublicacionesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const currentParams = await searchParams;
  const currentFiltro = currentParams.filtro || "todas";

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { specialtyId: true },
  });

  const contentTypes =
    currentFiltro === "todas"
      ? ["ARTICLE", "WHITE_PAPER"]
      : currentFiltro === "white-papers"
      ? ["WHITE_PAPER"]
      : ["ARTICLE"];

  const articles = await prisma.article.findMany({
    where: {
      status: "PUBLISHED",
      contentType: { in: contentTypes as any },
      OR: [
        { audienceType: "ALL_DOCTORS" },
        {
          audienceType: "BY_SPECIALTY",
          specialties: { some: { specialtyId: user?.specialtyId as string } },
        },
      ],
    },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  const tabs = [
    { label: "Todas", href: "/profesional/publicaciones", key: "todas" },
    { label: "White Papers", href: "/profesional/publicaciones?filtro=white-papers", key: "white-papers" },
    { label: "Publicaciones Clínicas", href: "/profesional/publicaciones?filtro=clinicas", key: "clinicas" },
  ];

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 uppercase mb-2">
                Conocimiento exclusivo · Red médica Gencell
              </p>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Publicaciones Gencell
              </h1>
              <p className="text-slate-500 text-sm mt-1">
                White papers, guías clínicas y publicaciones técnicas para especialistas.
              </p>
            </div>
            <div className="hidden sm:flex items-center px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg gap-1.5 flex-shrink-0">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Acceso privado</span>
            </div>
          </div>

          {/* Tabs con indicador de línea inferior (no pills) */}
          <div className="flex gap-0 border-b border-slate-200">
            {tabs.map((tab) => (
              <Link
                key={tab.key}
                href={tab.href}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-all duration-150 -mb-px ${
                  currentFiltro === tab.key
                    ? "border-blue-700 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </header>

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">Sin publicaciones en este filtro</h3>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed mb-5">
              Las publicaciones clínicas y white papers estarán disponibles en los próximos días.
            </p>
            <Link href="/profesional/publicaciones" className="text-sm font-semibold text-blue-600 hover:underline">
              Ver todas las publicaciones →
            </Link>
          </div>
        )}

        {/* Grid 2 columnas */}
        {articles.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {articles.map((article) => {
                const isWP = article.contentType === "WHITE_PAPER";
                return (
                  <Link key={article.id} href={`/profesional/publicaciones/${article.slug}`} className="group block">
                    <article className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                      {/* Imagen o placeholder con badge encima */}
                      <div className="relative h-44 flex-shrink-0">
                        {article.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={article.imageUrl}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                          </>
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isWP
                                ? "bg-gradient-to-br from-indigo-50 to-blue-100"
                                : "bg-gradient-to-br from-blue-50 to-slate-100"
                            }`}
                          >
                            <span className={`text-5xl font-black tracking-tighter select-none ${isWP ? "text-indigo-200" : "text-blue-200"}`}>
                              {isWP ? "WP" : "PC"}
                            </span>
                          </div>
                        )}
                        {/* Badge sobre imagen, top-left */}
                        <span
                          className={`absolute top-3 left-3 inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                            isWP
                              ? "bg-indigo-600 text-white"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {isWP ? "White Paper" : "Clínica"}
                        </span>
                      </div>

                      {/* Contenido */}
                      <div className="p-6 flex-1 flex flex-col">
                        <div className="flex items-center gap-2 mb-2">
                          {article.category && (
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                              {article.category.name}
                            </span>
                          )}
                          <span className="text-[10px] text-slate-300">·</span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(article.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2 group-hover:text-blue-700 transition-colors duration-150 line-clamp-2">
                          {article.title}
                        </h2>
                        {article.excerpt && (
                          <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 flex-1">
                            {article.excerpt}
                          </p>
                        )}
                        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform duration-150 inline-flex items-center gap-1">
                            Leer publicación
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>

            {/* CTA banner al fondo */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 mb-0.5">¿Requieres información técnica adicional o muestras?</p>
                <p className="text-xs text-slate-500">Solicita asesoría especializada de nuestro equipo médico.</p>
              </div>
              <Link
                href="/profesional#form-atencion"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-150 whitespace-nowrap"
              >
                Solicitar asesoría →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
