import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const { action, reason } = body; // action is 'APPROVE' or 'REJECT'

    const { id } = await params;

    const request = await prisma.profileChangeRequest.findUnique({ where: { id } });
    if (!request) {
      return NextResponse.json({ error: 'Solicitud no encontrada' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      return NextResponse.json({ error: 'La solicitud ya fue procesada' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: request.userId },
          data: { name: request.requestedValue }
        }),
        prisma.profileChangeRequest.update({
          where: { id },
          data: {
            status: 'APPROVED',
            reviewedAt: new Date(),
            reviewedById: session.user.id,
          }
        })
      ]);
    } else if (action === 'REJECT') {
      await prisma.profileChangeRequest.update({
        where: { id },
        data: {
          status: 'REJECTED',
          rejectionReason: reason || null,
          reviewedAt: new Date(),
          reviewedById: session.user.id,
        }
      });
    } else {
      return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Error desconocido';
    console.error('Error procesando solicitud de perfil:', message);
    return NextResponse.json(
      { error: `Error interno del servidor: ${message}` },
      { status: 500 }
    );
  }
}
