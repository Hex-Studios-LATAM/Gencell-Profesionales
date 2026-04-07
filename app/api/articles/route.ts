import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const articleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es obligatoria'),
  content: z.string().min(1, 'El contenido es obligatorio'),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  contentType: z.enum(['ARTICLE', 'NEWS', 'WHITE_PAPER']).default('ARTICLE'),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'PUBLISHED']).default('DRAFT'),
  audienceType: z.enum(['ALL_DOCTORS', 'BY_SPECIALTY']).default('ALL_DOCTORS'),
  specialtyIds: z.array(z.string()).optional()
});

function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = categoryId;
    const contentType = searchParams.get('contentType');
    if (contentType) where.contentType = contentType;

    if (session?.user?.role !== 'ADMIN') {
       return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const articles = await prisma.article.findMany({
      where,
      include: { category: true, author: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener artículos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const result = articleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;

    const finalSlug = data.slug && data.slug.trim() !== '' ? generateSlug(data.slug) : generateSlug(data.title);

    // Validar slug unico
    const existing = await prisma.article.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un artículo con este slug (URL)' }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title: data.title,
        slug: finalSlug,
        categoryId: data.categoryId,
        content: data.content,
        excerpt: data.excerpt || null,
        imageUrl: data.imageUrl || null,
        contentType: data.contentType,
        status: data.status,
        audienceType: data.audienceType,
        authorId: session.user.id,
        specialties: data.audienceType === 'BY_SPECIALTY' && data.specialtyIds ? {
          create: data.specialtyIds.map(id => ({ specialtyId: id }))
        } : undefined
      },
      include: { category: true, specialties: { include: { specialty: true } } }
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
