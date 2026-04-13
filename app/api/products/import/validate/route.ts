import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }

    const { rows } = await req.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: 'Formato inválido. Se esperaba un array de filas.' }, { status: 400 });
    }

    // Extraer todos los slugs únicos de categorías y especialidades para hacer 1 sola consulta
    const categorySlugs = new Set<string>();
    const specialtySlugs = new Set<string>();

    rows.forEach(row => {
      if (row.categorias) {
        row.categorias.split('|').forEach((s: string) => categorySlugs.add(s.trim()));
      }
      if (row.especialidades) {
        row.especialidades.split('|').forEach((s: string) => specialtySlugs.add(s.trim()));
      }
    });

    // Consultar DB
    const [existingCategories, existingSpecialties] = await Promise.all([
      prisma.productCategory.findMany({
        where: { slug: { in: Array.from(categorySlugs) } },
        select: { id: true, slug: true, name: true }
      }),
      prisma.specialty.findMany({
        where: { slug: { in: Array.from(specialtySlugs) } },
        select: { id: true, slug: true, name: true }
      })
    ]);

    const catMap = new Map(existingCategories.map(c => [c.slug, c]));
    const specMap = new Map(existingSpecialties.map(s => [s.slug, s]));

    // Validar filas
    const validatedRows = rows.map((row, index) => {
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];

      // Validacion Nombre
      if (!row.nombre || !row.nombre.trim()) {
        rowErrors.push('El nombre del producto es obligatorio.');
      }

      // Validacion Imagen
      if (!row.imagen || !row.imagen.startsWith('http')) {
        rowWarnings.push('No tiene imagen o URL es inválida.');
      }
      
      const mappedCategories: any[] = [];
      const missingCategories: string[] = [];

      if (row.categorias) {
         row.categorias.split('|').forEach((slug: string) => {
           const s = slug.trim();
           if (!s) return;
           const found = catMap.get(s);
           if (found) mappedCategories.push(found);
           else missingCategories.push(s);
         });
      } else {
         rowWarnings.push('No hay categorías asociadas.');
      }

      if (missingCategories.length > 0) {
         rowWarnings.push(`Categorías no encontradas: ${missingCategories.join(', ')}`);
      }

      const mappedSpecialties: any[] = [];
      const missingSpecialties: string[] = [];

      if (row.especialidades) {
         row.especialidades.split('|').forEach((slug: string) => {
           const s = slug.trim();
           if (!s) return;
           const found = specMap.get(s);
           if (found) mappedSpecialties.push(found);
           else missingSpecialties.push(s);
         });
      }

      if (missingSpecialties.length > 0) {
         rowWarnings.push(`Especialidades no encontradas: ${missingSpecialties.join(', ')}`);
      }

      return {
         originalIndex: index,
         data: {
           nombre: row.nombre || '',
           descripcion: row.descripcion || '',
           imagenUrl: row.imagen || '',
           mappedCategories,
           missingCategories,
           mappedSpecialties,
           missingSpecialties
         },
         status: rowErrors.length > 0 ? 'ERROR' : (rowWarnings.length > 0 ? 'WARNING' : 'OK'),
         errors: rowErrors,
         warnings: rowWarnings
      };
    });

    return NextResponse.json({ validatedRows });
  } catch (error: any) {
    console.error('Validate error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
