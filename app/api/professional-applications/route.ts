import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  email: z.string().email('Debe ser un correo válido'),
  phone: z.string().min(1, 'El teléfono es obligatorio'),
  specialtyText: z.string().min(1, 'La especialidad es obligatoria'),
  professionalLicense: z.string().min(1, 'La cédula es obligatoria')
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const whereClause = status && status !== 'ALL' ? { status: status as any } : {};

    const data = await prisma.professionalApplication.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    const emails = data.filter(d => d.status === 'APPROVED').map(d => d.email);
    let usersMap: Record<string, string | null> = {};
    if (emails.length > 0) {
      const users = await prisma.user.findMany({
        where: { email: { in: emails } },
        select: { email: true, passwordSetupToken: true }
      });
      usersMap = users.reduce((acc, u) => ({ ...acc, [u.email]: u.passwordSetupToken }), {});
    }

    const enhancedData = data.map(app => ({
       ...app,
       activationToken: app.status === 'APPROVED' ? usersMap[app.email] || null : null
    }));

    return NextResponse.json(enhancedData);
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = schema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    
    // Normalize data
    const data = result.data;
    const normalizedEmail = data.email.toLowerCase().trim();
    const normalizedLicense = data.professionalLicense.trim();
    const normalizedPhone = data.phone.trim();

    const existingEmail = await prisma.professionalApplication.findUnique({ where: { email: normalizedEmail } });
    if (existingEmail && existingEmail.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Ya existe una solicitud pendiente o aprobada con ese correo.' }, { status: 400 });
    }
    
    const existingLicense = await prisma.professionalApplication.findUnique({ where: { professionalLicense: normalizedLicense } });
    if (existingLicense && existingLicense.status !== 'REJECTED') {
      return NextResponse.json({ error: 'Ya existe una solicitud pendiente o aprobada con esa cédula.' }, { status: 400 });
    }

    const application = await prisma.professionalApplication.upsert({
      where: { email: normalizedEmail },
      update: {
        name: data.name,
        phone: normalizedPhone,
        specialtyText: data.specialtyText,
        professionalLicense: normalizedLicense,
        status: 'PENDING',
        rejectionReason: null,
        reviewedAt: null
      },
      create: {
        name: data.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        specialtyText: data.specialtyText,
        professionalLicense: normalizedLicense
      }
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
