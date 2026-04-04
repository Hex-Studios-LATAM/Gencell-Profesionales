import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import sanitizeHtml from "sanitize-html";

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: { category: true }
  });

  if (!article || article.status !== "PUBLISHED") {
    notFound();
  }

  // Sanitización hiper-segura y flexible: aseguramos proteger el markup técnico que arma TinyMCE.
  // Preservamos las clases Tailwind (que TinyMCE inyectó en los botones CTA) y estilos en línea
  // básicos como color, alineación, etc., evitando tags peligrosos (scripts, objects).
  const cleanHtml = sanitizeHtml(article.content, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'figure', 'figcaption' ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'style', 'id'],
      'img': ['src', 'alt', 'title', 'width', 'height'],
      'a': ['href', 'target', 'rel', 'class'],
    },
    allowedIframeHostnames: ['www.youtube.com', 'player.vimeo.com']
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <article className="max-w-3xl mx-auto px-6 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {article.imageUrl && (
           <div className="w-full h-64 sm:h-96 bg-gray-200">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
           </div>
        )}
        
        <div className="p-8 sm:p-12">
           <div className="flex flex-wrap items-center gap-4 mb-6">
              <Link href="/articulos" className="text-blue-600 hover:text-blue-800 text-sm font-medium transition">
                ← Volver a artículos
              </Link>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-semibold tracking-wider text-blue-600 uppercase">
                 {article.category?.name}
              </span>
              <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
              <span className="text-sm text-gray-500">
                 {new Date(article.createdAt).toLocaleDateString()}
              </span>
           </div>

           <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6 leading-tight">
             {article.title}
           </h1>

           {article.excerpt && (
             <div className="text-lg text-gray-600 italic mb-8 border-l-4 border-gray-200 pl-4 py-1">
               {article.excerpt}
             </div>
           )}

           <div 
              className="prose prose-blue max-w-none text-gray-800 leading-relaxed render-article"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
           />
        </div>
      </article>
    </main>
  );
}
