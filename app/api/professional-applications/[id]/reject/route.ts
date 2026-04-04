import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const schema = z.object({
  reason: z.string().optional()
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const result = schema.safeParse(body);
    const reason = result.success ? result.data.reason : null;
    
    const app = await prisma.professionalApplication.findUnique({ where: { id } });
    if (!app) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    if (app.status === 'APPROVED') return NextResponse.json({ error: 'No puedes rechazar a alguien ya aprobado' }, { status: 400 });
    if (app.status === 'REJECTED') return NextResponse.json({ error: 'La solicitud ya fue rechazada anteriormente' }, { status: 400 });

    const updatedApp = await prisma.professionalApplication.update({
        where: { id },
        data: { 
            status: 'REJECTED', 
            rejectionReason: reason || null,
            reviewedAt: new Date()
        }
    });

    return NextResponse.json(updatedApp);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
