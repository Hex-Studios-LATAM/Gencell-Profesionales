import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const doctores = await prisma.user.findMany({
      where: { role: "DOCTOR" },
      include: {
        specialty: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // To add the "phone" or other fields from the original application, we can query them
    const applications = await prisma.professionalApplication.findMany({
      where: {
        email: { in: doctores.map((d) => d.email) },
        status: "APPROVED"
      }
    });

    const doctoresConTelefono = doctores.map(doc => {
      const app = applications.find(a => a.email === doc.email || a.professionalLicense === doc.professionalLicense);
      return {
        ...doc,
        phone: app?.phone || "N/D"
      };
    });

    return NextResponse.json(doctoresConTelefono);
  } catch (error) {
    console.error("Error obteniendo doctores:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
