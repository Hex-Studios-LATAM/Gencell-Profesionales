import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { status, professionalLicense } = await req.json();

    const updateData: any = {};
    if (status && ["ACTIVE", "INACTIVE", "PENDING_ACTIVATION"].includes(status)) {
      updateData.status = status;
    }
    if (professionalLicense !== undefined) {
      updateData.professionalLicense = professionalLicense;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar doctor:", error);
    return NextResponse.json({ error: "Error internto al actualizar" }, { status: 500 });
  }
}
