import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

const articleSchema = z.object({
  title: z.string().min(1, 'El título es obligatorio').optional(),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es obligatoria').optional(),
  content: z.string().min(1, 'El contenido es obligatorio').optional(),
  excerpt: z.string().optional(),
  imageUrl: z.string().optional(),
  contentType: z.enum(['ARTICLE', 'NEWS', 'WHITE_PAPER']).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'PENDING_REVIEW']).optional(),
  audienceType: z.enum(['ALL_DOCTORS', 'BY_SPECIALTY']).optional(),
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Intentar buscar por id, si falla intentar por slug
    let article = await prisma.article.findUnique({
      where: { id },
      include: { category: true, specialties: { include: { specialty: true } } }
    });

    if (!article) {
      article = await prisma.article.findUnique({
        where: { slug: id },
        include: { category: true, specialties: { include: { specialty: true } } }
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
    
    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const body = await req.json();
    const result = articleSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;
    const updateData: any = { ...data };
    delete updateData.specialtyIds;

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

    if (data.audienceType) {
       updateData.audienceType = data.audienceType;
       
       if (data.audienceType === 'ALL_DOCTORS') {
         // Si cambia a TODOS, limpiar dependencias de especialidad si existieran
         updateData.specialties = { deleteMany: {} };
       }
    }

    // Hande specialties update if provided and it's BY_SPECIALTY
    const audienceTypeFinal = data.audienceType || existingArticle.audienceType;
    if (audienceTypeFinal === 'BY_SPECIALTY' && data.specialtyIds) {
       updateData.specialties = {
         deleteMany: {}, // Clear existing
         create: data.specialtyIds.map(sid => ({ specialtyId: sid }))
       };
    }

    const article = await prisma.article.update({
      where: { id },
      data: updateData,
      include: { category: true, specialties: { include: { specialty: true } } }
    });

    if (data.imageUrl !== undefined && data.imageUrl !== existingArticle.imageUrl && existingArticle.imageUrl?.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingArticle.imageUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Failed to delete old image:', e);
      }
    }

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
    
    const existingArticle = await prisma.article.findUnique({ where: { id } });
    if (!existingArticle) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    
    await prisma.article.delete({ where: { id } });

    if (existingArticle.imageUrl?.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingArticle.imageUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Failed to delete article image on delete:', e);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar el artículo' }, { status: 500 });
  }
}
