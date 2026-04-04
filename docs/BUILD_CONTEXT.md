# Gencell Profesionales — Contexto de construcción

## Objetivo
Construir una app web para profesionales de la salud con dos áreas:
1. Sitio público
2. Área administrativa y profesional

## Stack fijo
- Next.js App Router
- TypeScript
- Tailwind CSS
- PostgreSQL en Docker
- Prisma 6
- No Prisma 7
- No prisma.config.ts
- Despliegue futuro en VPS

## Estado actual
- Proyecto Next.js ya creado
- Proyecto corre en localhost:3000
- PostgreSQL ya corre en Docker
- Prisma 6 ya funciona
- Prisma Studio ya abre

## Principios
- Navegación extremadamente simple
- Admin primero funcional, luego refinamiento visual
- No saturación visual
- No rehacer estructura sin justificación
- No introducir dependencias innecesarias
- Optimizar prompts para Antigravity

## Fase 1
- Especialidades
- Categorías de artículos
- Categorías de productos
- Artículos
- Productos
- Admin funcional
- Sitio público básico

## Restricciones de fase 1
- Imágenes solo por URL (imageUrl)
- Sin uploads binarios
- Sin rich text editor
- Contenido simple tipo textarea/markdown básico
- Sin pagos
- Sin pacientes ni expedientes
- Sin multilenguaje
- Sin auth en la primera construcción base

## Roles futuros
- ADMIN
- DOCTOR

## Estados
- DRAFT
- PUBLISHED

## Rutas objetivo
### Públicas
- /
- /articulos
- /articulos/[slug]
- /productos
- /productos/[slug]

### Admin
- /admin
- /admin/especialidades
- /admin/categorias/articulos
- /admin/categorias/productos
- /admin/articulos
- /admin/productos

### Profesional (fase posterior)
- /profesional
- /profesional/articulos
- /profesional/productos

## Regla para Antigravity
- Cambia solo lo necesario
- No rehagas el proyecto
- No metas librerías extra si no son indispensables
- Devuelve resumen corto y archivos modificados