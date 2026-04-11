import { NextResponse } from "next/server";
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { status, professionalLicense, name, email, phone, specialtyId, newPassword } = body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone || null;
    if (professionalLicense !== undefined) updateData.professionalLicense = professionalLicense || null;
    if (specialtyId !== undefined) updateData.specialtyId = specialtyId || null;

    if (status && ["ACTIVE", "INACTIVE", "PENDING_ACTIVATION"].includes(status)) {
      updateData.status = status;
    }

    // Password change (optional)
    if (newPassword && typeof newPassword === "string" && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
      }
      const salt = await bcrypt.genSalt(10);
      updateData.passwordHash = await bcrypt.hash(newPassword, salt);
      updateData.mustSetPassword = false;
      updateData.passwordSetupToken = null;
      updateData.passwordSetupExpiresAt = null;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No se enviaron datos para actualizar" }, { status: 400 });
    }

    // Uniqueness checks
    if (email) {
      const dup = await prisma.user.findFirst({ where: { email, id: { not: id } } });
      if (dup) return NextResponse.json({ error: "Ese correo ya está en uso por otro usuario" }, { status: 400 });
    }
    if (professionalLicense) {
      const dup = await prisma.user.findFirst({ where: { professionalLicense, id: { not: id } } });
      if (dup) return NextResponse.json({ error: "Esa cédula ya está registrada por otro usuario" }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error al actualizar doctor:", error);
    return NextResponse.json({ error: "Error interno al actualizar" }, { status: 500 });
  }
}
