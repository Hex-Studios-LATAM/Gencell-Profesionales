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
    <main className="min-h-screen bg-slate-50 py-12 lg:py-20">
      <article className="max-w-4xl mx-auto bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden relative">
        {article.imageUrl && (
           <div className="w-full h-80 lg:h-[450px] bg-slate-200 relative">
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent z-10 hidden sm:block"></div>
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
           </div>
        )}
        
        <div className={`p-8 sm:p-14 lg:p-20 relative z-20 ${article.imageUrl ? 'bg-white rounded-t-[2rem] -mt-16 sm:-mt-24' : ''}`}>
           <div className="flex flex-wrap items-center gap-4 mb-8">
              <Link href="/articulos" className="text-slate-500 hover:text-indigo-600 text-sm font-semibold transition flex items-center gap-2 bg-slate-100 hover:bg-indigo-50 px-3 py-1.5 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Regresar
              </Link>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
              <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md uppercase tracking-widest border border-indigo-100/50">
                 {article.category?.name}
              </span>
              <div className="w-1.5 h-1.5 bg-slate-300 rounded-full"></div>
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">
                 {new Date(article.createdAt).toLocaleDateString()}
              </span>
           </div>

           <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 mb-8 leading-[1.1] tracking-tight">
             {article.title}
           </h1>

           {article.excerpt && (
             <div className="text-xl sm:text-2xl text-slate-500 font-medium italic mb-12 leading-relaxed border-l-4 border-indigo-200 pl-6 py-2">
               {article.excerpt}
             </div>
           )}

           <div 
              className="prose prose-lg sm:prose-xl prose-slate prose-indigo max-w-none text-slate-700 leading-relaxed render-article"
              dangerouslySetInnerHTML={{ __html: cleanHtml }}
           />
        </div>
      </article>
    </main>
  );
}
