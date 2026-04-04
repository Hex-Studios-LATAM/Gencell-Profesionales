import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ProfesionalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "DOCTOR") {
    // Si un admin intenta entrar al portal de doctor (opcionalmente puedes dejarlo, pero para aislar áreas:)
    if (session.user.role === "ADMIN") {
      redirect("/admin");
    }
    redirect("/login");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex min-h-screen bg-[#f8fafc]">
       {/* Barra Lateral Simple Profesional */}
       <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shadow-sm z-10">
          <div className="p-6 border-b">
             <h2 className="text-xl font-bold text-blue-900 tracking-tight">Gencell <span className="text-blue-500 font-medium">Médicos</span></h2>
          </div>
          <nav className="flex-1 p-4 space-y-2">
             <a href="/profesional" className="block p-3 rounded-lg bg-blue-50 text-blue-700 font-medium transition">
               Inicio
             </a>
             <a href="#" className="block p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition font-medium">
               Artículos (Próximamente)
             </a>
             <a href="#" className="block p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition font-medium">
               Productos recomendados
             </a>
          </nav>
          <div className="p-4 border-t bg-gray-50">
             <div className="text-sm font-medium text-gray-900 mb-1 truncate" title={session.user.name || ''}>{session.user.name}</div>
             <div className="text-xs text-gray-500 mb-3 truncate" title={session.user.email || ''}>{session.user.email}</div>
             <form action={async () => {
                 "use server";
                 const { signOut } = await import("@/auth");
                 await signOut({ redirectTo: "/login" });
               }}>
               <button type="submit" className="w-full text-center text-sm font-medium text-red-600 hover:text-red-700 border border-red-200 bg-white hover:bg-red-50 p-2 rounded transition">
                 Cerrar sesión
               </button>
             </form>
          </div>
       </aside>

       <main className="flex-1 flex flex-col items-stretch h-screen overflow-y-auto w-full relative">
          {children}
       </main>
    </div>
  );
}
