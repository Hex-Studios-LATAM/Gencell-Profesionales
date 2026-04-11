"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function updateDoctorAction(prevState: any, formData: FormData) {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { error: "No autorizado" };
    }

    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const professionalLicense = formData.get("professionalLicense") as string;
    const status = formData.get("status") as "ACTIVE" | "INACTIVE" | "PENDING_ACTIVATION";
    const specialtyId = formData.get("specialtyId") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!id || !name || !email) {
      return { error: "Los campos Nombre y Correo son obligatorios" };
    }

    // Verificar si el correo o cédula ya están en uso por otro usuario
    const existingEmail = await prisma.user.findFirst({
      where: { email, id: { not: id } }
    });
    if (existingEmail) return { error: "Ese correo ya está en uso por otro usuario" };

    if (professionalLicense) {
      const existingLicense = await prisma.user.findFirst({
        where: { professionalLicense, id: { not: id } }
      });
      if (existingLicense) return { error: "Esa cédula ya está registrada" };
    }

    const dataToUpdate: any = {
      name,
      email,
      phone: phone || null,
      professionalLicense: professionalLicense || null,
      status,
      specialtyId: specialtyId || null,
    };

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.length < 6) {
        return { error: "La contraseña debe tener al menos 6 caracteres" };
      }
      const salt = await bcrypt.genSalt(10);
      dataToUpdate.passwordHash = await bcrypt.hash(newPassword, salt);
      // Al resetear la contraseña desde admin, quitamos el flag de required setup
      dataToUpdate.mustSetPassword = false;
      dataToUpdate.passwordSetupToken = null;
      dataToUpdate.passwordSetupExpiresAt = null;
    }

    await prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

  } catch (error: any) {
    console.error("Error actualizando doctor:", error);
    return { error: error.message || "Error interno al actualizar" };
  }

  revalidatePath("/admin/doctores");
  redirect("/admin/doctores");
}
