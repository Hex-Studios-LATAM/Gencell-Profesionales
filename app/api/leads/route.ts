import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const leadSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().optional(),
  message: z.string().optional(),
  sourceType: z.enum(['HOME_CTA', 'PRODUCT_CTA', 'NEWS_CTA', 'WHITE_PAPER_CTA', 'ARTICLE_CTA', 'ELEMENTOR_FORM', 'EXTERNAL_FORM']),
  sourceId: z.string().optional(),
  sourceLabel: z.string().optional(),
  intent: z.enum(['PERSONALIZED_ATTENTION', 'ORDER_REQUEST', 'GENERAL_INQUIRY']).default('PERSONALIZED_ATTENTION'),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const status      = searchParams.get('status');
    const sourceType  = searchParams.get('sourceType');
    const channel     = searchParams.get('channel');
    const websiteName = searchParams.get('websiteName');
    const formName    = searchParams.get('formName');
    const from        = searchParams.get('from');
    const to          = searchParams.get('to');

    const where: any = {};
    if (status)      where.status = status;
    if (sourceType)  where.sourceType = sourceType;
    if (channel)     where.channel = channel;
    if (websiteName) where.websiteName = { contains: websiteName, mode: 'insensitive' };
    if (formName)    where.formName    = { contains: formName, mode: 'insensitive' };
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to)   where.createdAt.lte = new Date(to);
    }

    const leads = await prisma.lead.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}


export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const result = leadSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;

    const lead = await prisma.lead.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        sourceType: data.sourceType,
        sourceId: data.sourceId,
        sourceLabel: data.sourceLabel,
        intent: data.intent,
        userId: session.user.id,
      }
    });

    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
