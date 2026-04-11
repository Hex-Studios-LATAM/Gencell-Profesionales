import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    if (!token) return NextResponse.json({ error: 'Token faltante' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { passwordSetupToken: token } });
    
    if (!user) {
      return NextResponse.json({ error: 'Token inválido o cuenta ya activada' }, { status: 404 });
    }
    
    if (user.passwordSetupExpiresAt && user.passwordSetupExpiresAt < new Date()) {
      return NextResponse.json({ error: 'El token ha expirado. Contacta a soporte.' }, { status: 400 });
    }

    if (!user.mustSetPassword) {
      return NextResponse.json({ error: 'La cuenta no requiere activación' }, { status: 400 });
    }

    // Retorna info segura si es válido
    return NextResponse.json({ valid: true, email: user.email, name: user.name });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno de validación' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });

    const { token, password } = result.data;

    const user = await prisma.user.findUnique({ where: { passwordSetupToken: token } });
    if (!user) return NextResponse.json({ error: 'Token inválido' }, { status: 404 });

    if (user.passwordSetupExpiresAt && user.passwordSetupExpiresAt < new Date()) {
      return NextResponse.json({ error: 'El token ha expirado' }, { status: 400 });
    }

    if (!user.mustSetPassword) {
      return NextResponse.json({ error: 'La cuenta no requiere activación' }, { status: 400 });
    }

    // Hashear la contraseña (rounds: 10 suele ser buen estándar y rápido)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Actualizar usuario
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordSetupToken: null,
        passwordSetupExpiresAt: null,
        mustSetPassword: false,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json({ success: true, message: 'Cuenta activada correctamente' });
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
