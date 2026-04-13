import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';
import { promises as fs } from 'fs';
import path from 'path';

function generateSlug(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function downloadImage(url: string, slug: string): Promise<string | null> {
  try {
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    
    const buffer = Buffer.from(await res.arrayBuffer());
    
    const contentType = res.headers.get("content-type");
    let ext = ".jpg";
    if (contentType?.includes("png")) ext = ".png";
    else if (contentType?.includes("webp")) ext = ".webp";
    else if (contentType?.includes("gif")) ext = ".gif";
    
    const fileName = `${slug}-${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);
    return `/uploads/products/${fileName}`;
  } catch (e) {
    console.error("Error downloading image:", e);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { rows } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Formato inválido.' }, { status: 400 });
    }

    const results = {
      success: 0,
      errors: 0,
      skipped: 0,
      imagesDownloaded: 0,
      details: [] as any[]
    };

    for (const item of rows) {
      if (item.skip) {
         results.skipped++;
         continue;
      }

      try {
        let finalSlug = generateSlug(item.nombre);
        
        let counter = 1;
        let uniqueSlug = finalSlug;
        while (await prisma.product.findUnique({ where: { slug: uniqueSlug } })) {
           uniqueSlug = `${finalSlug}-${counter}`;
           counter++;
        }
        
        let localImageUrl = null;
        if (item.imagenUrl && item.imagenUrl.startsWith('http')) {
           localImageUrl = await downloadImage(item.imagenUrl, uniqueSlug);
           if (localImageUrl) results.imagesDownloaded++;
        }

        // Crear categorias faltantes y recolectar IDs
        const connectCategories = item.mappedCategories?.map((c: any) => ({ id: c.id })) || [];
        if (item.missingCategories && item.missingCategories.length > 0) {
           for (const mSlug of item.missingCategories) {
              const name = mSlug.replace(/-/g, ' ').replace(/\b\w/g, (l:string) => l.toUpperCase());
              const cat = await prisma.productCategory.upsert({
                 where: { slug: mSlug },
                 update: {},
                 create: { name, slug: mSlug }
              });
              connectCategories.push({ id: cat.id });
           }
        }

        const connectSpecialties = item.mappedSpecialties?.map((s: any) => ({ specialtyId: s.id })) || [];
        if (item.missingSpecialties && item.missingSpecialties.length > 0) {
           for (const mSlug of item.missingSpecialties) {
              const name = mSlug.replace(/-/g, ' ').replace(/\b\w/g, (l:string) => l.toUpperCase());
              const spec = await prisma.specialty.upsert({
                 where: { slug: mSlug },
                 update: {},
                 create: { name, slug: mSlug }
              });
              connectSpecialties.push({ specialtyId: spec.id });
           }
        }

        await prisma.product.create({
           data: {
              name: item.nombre,
              slug: uniqueSlug,
              description: item.descripcion || '',
              imageUrl: localImageUrl,
              status: 'PUBLISHED',
              categories: { connect: connectCategories },
              specialties: connectSpecialties.length > 0 ? { create: connectSpecialties } : undefined
           }
        });

        results.success++;
        results.details.push({ nombre: item.nombre, status: 'SUCCESS' });

      } catch (rowError: any) {
        console.error("Error importing row:", rowError);
        results.errors++;
        results.details.push({ nombre: item.nombre, status: 'ERROR', error: rowError.message });
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
