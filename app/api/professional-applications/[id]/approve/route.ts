import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import crypto from 'crypto';

const schema = z.object({
  specialtyId: z.string().min(1, "Debes asignar una especialidad del sistema al usuario")
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: "Faltan datos de aprobación" }, { status: 400 });
    
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    const { specialtyId } = result.data;

    const app = await prisma.professionalApplication.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (app.status === 'APPROVED') return NextResponse.json({ error: 'La solicitud ya fue aprobada anteriormente' }, { status: 400 });
    if (app.status === 'REJECTED') return NextResponse.json({ error: 'No puedes aprobar una solicitud que ya fue rechazada directamente' }, { status: 400 });

    const normalizedEmail = app.email.trim().toLowerCase();
    const normalizedLicense = app.professionalLicense.trim();

    const existingUserEmail = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingUserEmail) return NextResponse.json({ error: 'Ya existe un usuario con este correo electrónico' }, { status: 400 });

    const existingUserLicense = await prisma.user.findUnique({ where: { professionalLicense: normalizedLicense } });
    if (existingUserLicense) return NextResponse.json({ error: 'Ya existe un usuario con esta cédula profesional' }, { status: 400 });

    // secure generation for onboarding token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48); // 48h to set password

    const [updatedApp, newUser] = await prisma.$transaction([
       prisma.professionalApplication.update({
          where: { id },
          data: { 
             status: 'APPROVED', 
             rejectionReason: null,
             reviewedAt: new Date()
             // reviewedById can be set later when auth flow provides req.user.id
          }
       }),
       prisma.user.create({
          data: {
             name: app.name,
             email: normalizedEmail,
             professionalLicense: normalizedLicense,
             role: 'DOCTOR',
             status: 'ACTIVE',
             specialtyId: specialtyId,
             mustSetPassword: true,
             passwordSetupToken: token,
             passwordSetupExpiresAt: expiresAt
          }
       })
    ]);

    return NextResponse.json({ 
       updatedApp, 
       activationUrl: `/activar?token=${token}` // Retornamos para depuración/interfaz temporal
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
