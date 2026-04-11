import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "doctor@demo.com";
  const password = "Password123!";
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("El doctor demo ya existe con el email:", email);
    return;
  }

  // 1. Crear o buscar una especialidad de prueba
  let specialty = await prisma.specialty.findUnique({
    where: { slug: "medicina-general" }
  });

  if (!specialty) {
    specialty = await prisma.specialty.create({
      data: {
        name: "Medicina General",
        slug: "medicina-general",
        description: "Médico general para propósitos de demo"
      }
    });
  }

  // 2. Simular una solicitud de aprobación (Application) para que haya trazabilidad y teléfono
  await prisma.professionalApplication.create({
    data: {
      name: "Dr. Carlos Méndez (Demo)",
      email: email,
      phone: "555-019-2838",
      professionalLicense: "CED-DEMO-998877",
      specialtyText: "Médico Cirujano y Partero",
      status: "APPROVED"
    }
  });

  // 3. Crear el doctor propiamente
  const passwordHash = await bcrypt.hash(password, 10);

  const doctor = await prisma.user.create({
    data: {
      name: "Dr. Carlos Méndez",
      email,
      passwordHash,
      professionalLicense: "CED-DEMO-998877",
      role: "DOCTOR",
      status: "ACTIVE",
      specialtyId: specialty.id,
      mustSetPassword: false
    }
  });

  console.log("✅ Doctor de demostración creado con éxito!");
  console.log("-----------------------------------------");
  console.log("Doctor:   ", doctor.name);
  console.log("Email:    ", doctor.email);
  console.log("Password: ", password);
  console.log("Teléfono:  555-019-2838");
  console.log("Cédula:   ", doctor.professionalLicense);
  console.log("-----------------------------------------");
  console.log("Ya puedes visitar /admin/doctores en el panel, o iniciar sesión con estas credenciales para ver el portal privado del profesional.");
}

main()
  .catch((e) => {
    console.error("Error creando el doctor:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
