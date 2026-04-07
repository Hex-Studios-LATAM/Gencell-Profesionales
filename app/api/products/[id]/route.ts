import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio').optional(),
  slug: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es obligatoria').optional(),
  description: z.string().min(1, 'La descripción es obligatoria').optional(),
  imageUrl: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
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
    let product = await prisma.product.findUnique({
      where: { id },
      include: { category: true, specialties: { include: { specialty: true } } }
    });

    if (!product) {
      product = await prisma.product.findUnique({
        where: { slug: id },
        include: { category: true, specialties: { include: { specialty: true } } }
      });
    }

    if (!product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    
    return NextResponse.json(product);
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

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

    const body = await req.json();
    const result = productSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.errors[0].message }, { status: 400 });
    }

    const data = result.data;
    const updateData: any = { ...data };
    // Prevent updating specialties directly via root update object
    delete updateData.specialtyIds;

    if (data.slug) {
       updateData.slug = generateSlug(data.slug);
    } else if (data.name) {
       updateData.slug = generateSlug(data.name);
    }

    if (updateData.slug) {
      const existing = await prisma.product.findUnique({ where: { slug: updateData.slug } });
      if (existing && existing.id !== id) {
         return NextResponse.json({ error: 'Ya existe otro producto con este slug (URL)' }, { status: 400 });
      }
    }

    // Hande specialties update if provided
    if (data.specialtyIds) {
       updateData.specialties = {
         deleteMany: {}, // Clear existing
         create: data.specialtyIds.map(sid => ({ specialtyId: sid }))
       };
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { category: true, specialties: { include: { specialty: true } } }
    });

    if (data.imageUrl !== undefined && data.imageUrl !== existingProduct.imageUrl && existingProduct.imageUrl?.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingProduct.imageUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Failed to delete old image:', e);
      }
    }

    return NextResponse.json(product);
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

    const existingProduct = await prisma.product.findUnique({ where: { id } });
    if (!existingProduct) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
    
    await prisma.product.delete({ where: { id } });

    if (existingProduct.imageUrl?.startsWith('/uploads/')) {
      try {
        const filePath = path.join(process.cwd(), 'public', existingProduct.imageUrl);
        await fs.unlink(filePath);
      } catch (e) {
        console.error('Failed to delete product image on delete:', e);
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Error al eliminar el producto' }, { status: 500 });
  }
}
