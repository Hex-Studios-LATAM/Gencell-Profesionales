import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import LeadCTA from "./components/LeadCTA";

export default async function ProfesionalDashboardPage() {
  const session = await auth();

  const user = await prisma.user.findUnique({
    where: { id: session?.user?.id ?? "" },
    select: {
      specialtyId: true,
      specialty: { select: { name: true } },
    },
  });

  const latestNews = await prisma.article.findFirst({
    where: {
      status: "PUBLISHED",
      contentType: "NEWS",
      OR: [
        { audienceType: "ALL_DOCTORS" },
        {
          audienceType: "BY_SPECIALTY",
          specialties: { some: { specialtyId: user?.specialtyId ?? "" } },
        },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  const doctorName = session?.user?.name ?? "";
  const firstName = doctorName.split(" ")[0] ?? doctorName;
  const specialtyName = user?.specialty?.name;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-8">

        {/* ── SALUDO ───────────────────────────────────── */}
        <header className="mb-7">
          <p className="text-[11px] font-bold text-slate-400 tracking-[0.12em] uppercase mb-1">
            {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Bienvenido, <span className="text-blue-700">Dr. {firstName}</span>
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {specialtyName ? `${specialtyName} ·` : ""} Portal privado Gencell
          </p>
        </header>

        {/* ── ZONA PRINCIPAL — hero + CTA en viewport ──── */}
        <div className="flex flex-col lg:flex-row gap-5 mb-6">

          {/* Hero editorial — última noticia (60%) */}
          <div className="flex-1 min-w-0">
            {latestNews ? (
              <Link href={`/profesional/publicaciones/${latestNews.slug}`} className="group block h-full">
                <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200 h-full flex flex-col">
                  {latestNews.imageUrl ? (
                    <div className="h-48 bg-slate-100 overflow-hidden flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={latestNews.imageUrl}
                        alt={latestNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-slate-100 to-blue-50 flex-shrink-0 flex items-center justify-center">
                      <svg className="w-10 h-10 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="inline-flex items-center px-2 py-0.5 bg-amber-50 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider border border-amber-200/60">
                        Última noticia
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(latestNews.createdAt).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 leading-snug tracking-tight mb-2 group-hover:text-blue-700 transition-colors duration-150 line-clamp-3">
                      {latestNews.title}
                    </h2>
                    {latestNews.excerpt && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 mb-4 flex-1">
                        {latestNews.excerpt}
                      </p>
                    )}
                    <span className="text-sm font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform duration-150 inline-flex items-center gap-1 mt-auto">
                      Leer noticia completa
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg>
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              /* Sin noticias — bloque vacío editorial */
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-8 h-full flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-400 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                </div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Noticias de industria</p>
                <p className="text-xs text-slate-400 mb-4 max-w-xs">El equipo de Gencell publicará las primeras noticias para la red médica próximamente.</p>
                <Link href="/profesional/noticias" className="text-xs font-semibold text-blue-600 hover:underline">
                  Ir a noticias →
                </Link>
              </div>
            )}
          </div>

          {/* Bloque de conversión — siempre en viewport (40%) */}
          <div className="w-full lg:w-72 xl:w-80 flex-shrink-0">
            <div
              className="rounded-2xl p-6 h-full flex flex-col text-white"
              style={{ background: "linear-gradient(160deg, #1e3a5f 0%, #0d1f38 100%)" }}
            >
              <p className="text-[10px] font-bold tracking-[0.14em] text-white/50 uppercase mb-4">
                Acceso preferencial · Red médica
              </p>
              <h2 className="text-base font-bold leading-snug mb-4 text-white">
                Su asesor especializado está a un mensaje.
              </h2>
              <ul className="space-y-2.5 mb-6 flex-1">
                {[
                  "Cotizaciones exclusivas para la red",
                  "Pedidos con seguimiento personal",
                  "Asesoría técnica especializada",
                  "Respuesta garantizada en < 24h",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-[13px] text-white/70">
                    <svg className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
              <LeadCTA
                sourceType="HOME_CTA"
                sourceLabel="Dashboard Principal"
                prefillName={session?.user?.name || ""}
                prefillEmail={session?.user?.email || ""}
                compact
              />
            </div>
          </div>
        </div>

        {/* ── MÓDULOS DE ACCESO RÁPIDO ──────────────────── */}
        <section className="mb-6">
          <p className="text-[11px] font-bold text-slate-400 tracking-[0.12em] uppercase mb-3">
            Acceso rápido
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Link href="/profesional/noticias" className="group block">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 h-full hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-150">Noticias</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">Novedades de farma y avances clínicos seleccionados para la red.</p>
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors inline-flex items-center gap-1">Ver noticias <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg></span>
              </div>
            </Link>

            <Link href="/profesional/publicaciones" className="group block">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 h-full hover:shadow-md hover:shadow-slate-200/60 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-150">Publicaciones Gencell</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">White papers, guías clínicas y publicaciones técnicas exclusivas.</p>
                </div>
                <span className="text-xs font-semibold text-slate-400 group-hover:text-blue-600 transition-colors inline-flex items-center gap-1">Ver publicaciones <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg></span>
              </div>
            </Link>

            <Link href="/profesional/productos" className="group block">
              <div className="bg-white border border-blue-50 rounded-2xl p-5 flex flex-col gap-3 h-full hover:shadow-md hover:shadow-blue-200/40 hover:border-blue-100 hover:-translate-y-0.5 transition-all duration-200">
                <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center flex-shrink-0">
                  <svg className="w-4.5 h-4.5" width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg>
                </div>
                <div className="flex-1">
                  <h2 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors duration-150">Catálogo Comercial</h2>
                  <p className="text-xs text-slate-500 leading-relaxed">Insumos, nutracéuticos y equipos médicos exclusivos de Gencell.</p>
                </div>
                <span className="text-xs font-semibold text-blue-600 group-hover:text-blue-800 transition-colors inline-flex items-center gap-1">Explorar catálogo <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6.75-6.75M19.5 12l-6.75 6.75" /></svg></span>
              </div>
            </Link>
          </div>
        </section>

        {/* ── FORMULARIO EXPANDIDO (bonus para quienes scrollean) */}
        <section id="form-atencion">
          <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="flex-1 p-7 lg:p-10 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
                <p className="text-[10px] font-bold tracking-[0.14em] text-blue-600 uppercase mb-3">
                  Servicio preferencial · Red médica Gencell
                </p>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
                  Atención personalizada para especialistas
                </h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-5">
                  Su equipo dedicado de Gencell está disponible para cotizaciones exclusivas,
                  pedidos prioritarios y asesoría técnica especializada.
                </p>
                <ul className="space-y-2">
                  {[
                    "Cotizaciones exclusivas para la red médica",
                    "Pedidos con seguimiento personalizado",
                    "Asesoría de especialistas certificados",
                    "Respuesta garantizada en menos de 24 horas",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-slate-600">
                      <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full lg:w-[380px] flex-shrink-0 p-7 lg:p-10">
                <LeadCTA
                  sourceType="HOME_CTA"
                  sourceLabel="Dashboard — Formulario Expandido"
                  prefillName={session?.user?.name || ""}
                  prefillEmail={session?.user?.email || ""}
                  defaultOpen
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
