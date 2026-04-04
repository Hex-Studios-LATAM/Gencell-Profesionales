import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Endpoint deshabilitado en producción' }, { status: 403 });
    }

    // Solo permitir bootstrap si no existe ningún admin en absoluto
    const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
    if (adminCount > 0) {
      return NextResponse.json({ error: 'Ya existe un administrador en el sistema. Operación denegada.' }, { status: 403 });
    }

    // Configuración base del primer admin
    const email = "admin@gencell.com";
    const plainPassword = "admin123";
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(plainPassword, salt);

    const admin = await prisma.user.create({
      data: {
        name: "Administrador Global",
        email,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        mustSetPassword: false
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Administrador creado correctamente.',
      email,
      temporaryPasswordBase: plainPassword
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
