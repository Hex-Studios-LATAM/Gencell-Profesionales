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
    const status    = searchParams.get('status');
    const originId  = searchParams.get('originId');
    const rango     = searchParams.get('rango');
    const startDate = searchParams.get('startDate');
    const endDate   = searchParams.get('endDate');
    const page      = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit     = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));

    // ── Build where clause ──────────────────────────────────────────
    const where: any = {};

    if (status && status !== 'all') where.status = status;
    if (originId) where.originId = originId;

    // Date range — manual dates take priority over quick range
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        const sd = new Date(startDate + 'T00:00:00.000Z');
        if (!isNaN(sd.getTime())) where.createdAt.gte = sd;
      }
      if (endDate) {
        const ed = new Date(endDate + 'T23:59:59.999Z');
        if (!isNaN(ed.getTime())) where.createdAt.lte = ed;
      }
    } else if (rango) {
      const now = new Date();
      let from: Date | null = null;

      if (rango === 'hoy') {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (rango === 'esta_semana') {
        const day = now.getDay();
        const diff = day === 0 ? 6 : day - 1;
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      } else if (rango === 'este_mes') {
        from = new Date(now.getFullYear(), now.getMonth(), 1);
      }

      if (from) {
        where.createdAt = { gte: from };
      }
    }

    // ── Paginated query ─────────────────────────────────────────────
    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          origin: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.lead.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      leads,
      total,
      totalPages,
      currentPage: page,
    });
  } catch (error: any) {
    console.error("Error obteniendo leads:", error);
    return NextResponse.json({ error: error?.message || 'Error interno' }, { status: 500 });
  }
}
