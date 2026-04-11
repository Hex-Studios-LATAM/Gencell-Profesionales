import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { requestedName } = await req.json();
    if (!requestedName || requestedName.trim() === '') {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Check if there is already a pending request for NAME_EDIT
    const existingPeding = await prisma.profileChangeRequest.findFirst({
      where: {
        userId: user.id,
        status: 'PENDING',
        fieldType: 'NAME_EDIT'
      }
    });

    if (existingPeding) {
      return NextResponse.json({ error: 'Ya tienes una solicitud de cambio de nombre pendiente.' }, { status: 400 });
    }

    const request = await prisma.profileChangeRequest.create({
      data: {
        userId: user.id,
        fieldType: 'NAME_EDIT',
        currentValue: user.name,
        requestedValue: requestedName.trim(),
        status: 'PENDING',
      }
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error: any) {
    console.error('Error creating profile change request:', error);
    return NextResponse.json({ error: 'Error al crear solicitud' }, { status: 500 });
  }
}
