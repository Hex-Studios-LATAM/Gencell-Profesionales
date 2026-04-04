import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const articleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').optional(),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es obligatoria').optional(),
  content: z.string().min(1, 'El contenido es obligatorio').optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional()
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Intentar buscar por id, si falla intentar por slug
    let article = await prisma.article.findUnique({
      where: { id },
      include: { category: true }
    });

    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug: id },
        include: { category: true }
      });
    }

    if (!article) return NextResponse.json({ error: 'Artículo no encontrado' }, { status: 404 });
    
    return NextResponse.json(article);
  } catch (error) {
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = articleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;
    const updateData: any = { ...data };

    if (data.slug) {
       updateData.slug = generateSlug(data.slug);
    } else if (data.title) {
       updateData.slug = generateSlug(data.title);
    }

    if (updateData.slug) {
      const existing = await prisma.article.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== id) {
         return NextResponse.json({ error: 'Ya existe otro artículo con este slug (URL)' }, { status: 400 });
      }
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: { category: true }
    });

    return NextResponse.json(article);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { id } = await params;
    
    await prisma.article.delete({ where: { id } });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar el artículo' }, { status: 500 });
  }
}
