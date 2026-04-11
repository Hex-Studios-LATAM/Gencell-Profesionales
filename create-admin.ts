import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@gencellbiotechnology.com";
  const password = "8ZyjYk7jtH78";
  
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("El usuario admin ya existe con el email:", email);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.create({
    data: {
      name: "Administrador Global",
      email,
      passwordHash,
      role: "ADMIN",
      status: "ACTIVE",
    }
  });

  console.log("✅ Usuario administrador creado con éxito!");
  console.log("-----------------------------------------");
  console.log("Email:    ", admin.email);
  console.log("Password: ", password);
  console.log("-----------------------------------------");
}

main()
  .catch((e) => {
    console.error("Error creando el administrador:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
