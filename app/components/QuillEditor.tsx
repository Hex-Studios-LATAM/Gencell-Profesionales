"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import "./quill-custom.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

export default function QuillEditor({ value, onChange }: { value: string, onChange: (value: string) => void }) {
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      [{ 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'align'
  ];

  return (
    <div className="bg-white rounded overflow-hidden">
      <ReactQuill 
        theme="snow" 
        value={value} 
        onChange={onChange} 
        modules={modules} 
        formats={formats}
        className="h-72 mb-10 text-slate-800" 
      />
    </div>
  );
}
