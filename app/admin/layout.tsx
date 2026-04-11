import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administración",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  if (session.user.status !== "ACTIVE") {
    redirect("/login?error=inactive");
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
       <AdminSidebar user={session.user} />

       <main className="flex-1 flex flex-col items-stretch overflow-y-auto relative bg-slate-50 shadow-inner">
          {children}
       </main>
    </div>
  );
}
