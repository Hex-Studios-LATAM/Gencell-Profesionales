import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  slug: z.string().optional(),
  categoryIds: z.array(z.string()).min(1, 'Debes seleccionar al menos una categoría'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
  specialtyIds: z.array(z.string()).optional() // IDs of specialties to map
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
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const categoryId = searchParams.get('categoryId');
    
    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categories = { some: { id: categoryId } };

    const products = await prisma.product.findMany({
      where,
      include: { 
        categories: true,
        specialties: { include: { specialty: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener productos' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const body = await req.json();
    const result = productSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;
    const finalSlug = data.slug && data.slug.trim() !== '' ? generateSlug(data.slug) : generateSlug(data.name);

    const existing = await prisma.product.findUnique({ where: { slug: finalSlug } });
    if (existing) {
      return NextResponse.json({ error: 'Ya existe un producto con este slug (URL)' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: finalSlug,
        description: data.description || '',
        imageUrl: data.imageUrl || null,
        status: data.status,
        categories: {
           connect: data.categoryIds.map((id: string) => ({ id }))
        },
        specialties: data.specialtyIds ? {
           create: data.specialtyIds.map(id => ({ specialtyId: id }))
        } : undefined
      },
      include: { categories: true, specialties: { include: { specialty: true } } }
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
