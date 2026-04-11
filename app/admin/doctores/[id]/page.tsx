import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";
import Link from "next/link";
import { auth } from "@/auth";

export default async function EditDoctorPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return notFound();

  const { id } = await params;
  
  const doctor = await prisma.user.findUnique({
    where: { id, role: "DOCTOR" }
  });

  if (!doctor) return notFound();

  const specialties = await prisma.specialty.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <Link href="/admin/doctores" className="text-sm font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition mb-4">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a Directorio
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Editar Médico</h1>
        <p className="text-slate-500 mt-1">
          Actualiza la información de {doctor.name || "este doctor"}.
        </p>
      </div>

      <EditForm doctor={doctor} specialties={specialties} />
    </main>
  );
}
