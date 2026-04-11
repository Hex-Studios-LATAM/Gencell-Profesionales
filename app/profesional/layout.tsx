import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { SignOutButton } from "../admin/SignOutButton";
import ProfesionalNav from "./components/ProfesionalNav";
import Logo from "@/app/components/Logo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portal Médico",
};

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "DOCTOR") {
    if (session.user.role === "ADMIN") redirect("/admin");
    redirect("/");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/?error=inactive");
  }

  const initials = session.user.name
    ?.split(" ")
    .slice(0, 2)
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() ?? "D";

  // Fetch profile image from DB (session doesn't include it)
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileImage: true },
  });
  const profileImage = dbUser?.profileImage || null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden text-slate-900 font-sans">

      {/* ── SIDEBAR DESKTOP ───────────────────────────────────── */}
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col flex-shrink-0 z-20 hidden lg:flex">

        {/* Logo / brand */}
        <div className="h-24 flex flex-col justify-center px-6 border-b border-slate-100 flex-shrink-0 gap-1">
          <Logo theme="light" variant="portal" size="md" />
        </div>

        {/* Navegación con estado activo — client component */}
        <ProfesionalNav />

        {/* Footer del sidebar — perfil del doctor */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 select-none overflow-hidden">
              {profileImage ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-slate-900 truncate leading-tight">
                Dr. {session.user.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate leading-tight">
                {session.user.email}
              </p>
            </div>
          </div>
          <SignOutButton />
        </div>
      </aside>

      {/* ── ÁREA PRINCIPAL ────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto w-full pb-16 lg:pb-0">
        {children}
      </main>

      {/* ── SIDEBAR MOBILE — bottom nav ───────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex lg:hidden z-50 h-16 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
        {[
          { href: "/profesional", exact: true, label: "Inicio", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
          { href: "/profesional/noticias", exact: false, label: "Noticias", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" /></svg> },
          { href: "/profesional/publicaciones", exact: false, label: "Publicaciones", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
          { href: "/profesional/productos", exact: false, label: "Catálogo", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" /></svg> },
        ].map((item) => (
          <a key={item.href} href={item.href}
             className="flex-1 flex flex-col items-center justify-center gap-0.5 text-slate-400 transition-colors"
          >
            {item.icon}
            <span className="text-[10px] font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  );
}
