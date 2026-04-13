"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import { useState, useEffect } from 'react';

const FontSizeInput = ({ editor }: { editor: any }) => {
  const currentSize = editor.getAttributes('textStyle').fontSize || '';
  const [size, setSize] = useState(currentSize);

  useEffect(() => {
    setSize(editor.getAttributes('textStyle').fontSize || '');
  }, [editor.getAttributes('textStyle').fontSize]);

  const applySize = (val: string) => {
    let newSize = val.trim();
    if (newSize === '') {
      editor.chain().focus().unsetFontSize().run();
      return;
    }
    // Infiere "px" si solo se escribe el número, como pasa en Word.
    if (!isNaN(Number(newSize))) {
      newSize = `${newSize}px`;
    }
    editor.chain().focus().setFontSize(newSize).run();
  };

  return (
    <div className="flex items-center gap-1 relative z-50">
      <input
        type="text"
        list="font-sizes"
        value={size.replace('px', '')}
        onChange={(e) => setSize(e.target.value)}
        onBlur={() => applySize(size)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            applySize(size);
          }
        }}
        placeholder="Tamaño"
        title="Tamaño de Fuente (ej. 16px o 16)"
        className="w-16 sm:w-20 px-2 py-1.5 text-xs sm:text-sm font-semibold border border-transparent bg-transparent hover:bg-slate-200 hover:border-slate-300 text-slate-700 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-300 focus:bg-white transition-colors placeholder-slate-400"
      />
      <datalist id="font-sizes">
        <option value="12" />
        <option value="14" />
        <option value="16" />
        <option value="18" />
        <option value="20" />
        <option value="24" />
        <option value="30" />
        <option value="36" />
      </datalist>
    </div>
  );
};

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-1 w-full relative z-10">
      {/* Headings */}
      <div className="flex items-center">
        <select 
          onChange={(e) => {
            const val = e.target.value;
            if (val === 'p') editor.chain().focus().setParagraph().run();
            else editor.chain().focus().toggleHeading({ level: parseInt(val) as 1|2|3 }).run();
          }}
          value={
            editor.isActive('heading', { level: 1 }) ? '1' :
            editor.isActive('heading', { level: 2 }) ? '2' :
            editor.isActive('heading', { level: 3 }) ? '3' : 'p'
          }
          className="bg-transparent border border-transparent hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-md px-2 py-1.5 outline-none focus:ring-1 focus:ring-slate-300 w-28 appearance-none cursor-pointer transition-colors"
        >
          <option value="p">Párrafo</option>
          <option value="1">Título 1</option>
          <option value="2">Título 2</option>
          <option value="3">Título 3</option>
        </select>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1"></div>

      {/* Font Size Input Combinado */}
      <FontSizeInput editor={editor} />

      <div className="w-px h-5 bg-slate-200 mx-1"></div>

      {/* Format */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-1.5 rounded-md transition ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Negrita"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z"/><path strokeLinecap="round" strokeLinejoin="round" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-1.5 rounded-md transition ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Cursiva"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.3"><path strokeLinecap="round" strokeLinejoin="round" d="M19 4h-9M14 20H5M15 4L9 20"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-1.5 rounded-md transition ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Subrayado"
        >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 3v7a6 6 0 006 6 6 6 0 006-6V3M4 21h16"/></svg>
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1"></div>

      {/* Alignment */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`p-1.5 rounded-md transition ${editor.isActive({ textAlign: 'left' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Alinear Izquierda"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h10M4 18h16"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`p-1.5 rounded-md transition ${editor.isActive({ textAlign: 'center' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Centrar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M7 12h10M4 18h16"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`p-1.5 rounded-md transition ${editor.isActive({ textAlign: 'right' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Alinear Derecha"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M10 12h10M4 18h16"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          className={`p-1.5 rounded-md transition ${editor.isActive({ textAlign: 'justify' }) ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Justificar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>

      <div className="w-px h-5 bg-slate-200 mx-1"></div>

      {/* Lists */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-1.5 rounded-md transition ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Viñetas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/></svg>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-1.5 rounded-md transition ${editor.isActive('orderedList') ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-200'}`}
          title="Lista Numerada"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M10 6h10M10 12h10M10 18h10M4 6h1v4M4 18h2v-4H4z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default function TiptapEditor({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [htmlValue, setHtmlValue] = useState(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      TextStyle,  // Importado correctamente como named import
      FontSize    // Exportado nativamente desde el paquete
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      if (!isHtmlMode) {
        onChange(editor.getHTML());
      }
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base max-w-none focus:outline-none p-6 text-slate-800'
      }
    }
  });

  // Mantiene sincronizado el editor con un cambio 'value' externo
  useEffect(() => {
    if (editor && !editor.isDestroyed && value !== editor.getHTML() && !isHtmlMode) {
      editor.commands.setContent(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, isHtmlMode]);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setHtmlValue(newValue);
    onChange(newValue);
  };

  const toggleMode = (mode: 'visual' | 'html') => {
    if (mode === 'html' && !isHtmlMode) {
      const currentVisualContent = editor?.getHTML() || '';
      setHtmlValue(currentVisualContent);
      onChange(currentVisualContent);
      setIsHtmlMode(true);
    } else if (mode === 'visual' && isHtmlMode) {
      editor?.commands.setContent(htmlValue);
      onChange(htmlValue);
      setIsHtmlMode(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white flex flex-col font-sans transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 max-h-[60vh] flex-shrink-0">
      
      {/* Header del Editor */}
      <div className="flex flex-col sm:flex-row bg-slate-50 border-b border-slate-200 justify-between items-start sm:items-center p-1.5 gap-2 shrink-0 relative z-10">
        <div className="flex-1 overflow-x-auto w-full">
          {!isHtmlMode ? (
            <MenuBar editor={editor} />
          ) : (
            <div className="p-2 sm:px-3 text-sm text-slate-500 font-medium whitespace-nowrap flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
              Editando Código Fuente (Raw HTML)
            </div>
          )}
        </div>
        
        {/* Interruptor de Modos */}
        <div className="flex bg-slate-200 p-1 rounded-lg border border-slate-200 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 relative z-20">
          <button 
            type="button" 
            onClick={() => toggleMode('visual')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${!isHtmlMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            Visual
          </button>
          <button 
            type="button" 
            onClick={() => toggleMode('html')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${isHtmlMode ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            HTML
          </button>
        </div>
      </div>

      <div className="w-full relative min-h-[24rem] overflow-y-auto overflow-x-hidden flex-1 custom-scrollbar bg-white z-0">
        {isHtmlMode ? (
          <textarea 
            value={htmlValue}
            onChange={handleHtmlChange}
            placeholder="<p>Escribe tu código HTML aquí...</p>"
            className="absolute inset-0 w-full h-full p-6 font-mono text-sm text-slate-300 bg-slate-900 focus:outline-none resize-none leading-relaxed shadow-inner"
            spellCheck="false"
          />
        ) : (
          <div className="cursor-text w-full h-full pb-8">
            <EditorContent editor={editor} className="h-full" />
          </div>
        )}
      </div>
    </div>
  );
}
