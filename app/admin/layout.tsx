import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    // Si es un doctor tratando de entrar al admin, lo mandamos a su área
    if (session.user.role === "DOCTOR") {
      redirect("/profesional");
    }
    // Fallback if role is something else in the future
    redirect("/login");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex min-h-screen flex-col">
       {/* Aquí una cabecera global para Admin o se puede dejar que las páginas la dibujen */}
       <header className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
          <div className="font-bold text-lg">Gencell Admin</div>
          <div className="flex gap-4 items-center">
             <span className="text-sm text-gray-300">Hola, {session.user.name}</span>
             <form action={async () => {
                 "use server";
                 const { signOut } = await import("@/auth");
                 await signOut({ redirectTo: "/login" });
               }}>
               <button type="submit" className="text-sm bg-gray-800 px-3 py-1 rounded hover:bg-red-700 transition">
                  Cerrar Sesión
               </button>
             </form>
          </div>
       </header>
       <div className="flex-1 bg-gray-50">
          {children}
       </div>
    </div>
  );
}
