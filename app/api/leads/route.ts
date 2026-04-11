import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status   = searchParams.get('status');
    const originId = searchParams.get('originId');
    const rango     = searchParams.get('rango');
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');

    const where: any = {};
    if (status)   where.status = status;
    if (originId) where.originId = originId;

    // Date range filter — manual dates take priority over quick range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate + 'T00:00:00.000Z');
      if (endDate)   where.createdAt.lte = new Date(endDate + 'T23:59:59.999Z');
    } else if (rango) {
      const now = new Date();
      let from: Date | null = null;

      if (rango === 'hoy') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (rango === 'esta_semana') {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1; // lunes = inicio
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      } else if (rango === 'este_mes') {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (from) {
        where.createdAt = { gte: from };
      }
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        origin: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(leads);
  } catch (error: any) {
    console.error("Error obteniendo leads:", error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
