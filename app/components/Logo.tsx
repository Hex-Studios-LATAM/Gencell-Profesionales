"use client";

import { useState } from "react";
import Image from "next/image";

interface LogoProps {
  theme?: "light" | "dark";
  className?: string;
  variant?: "portal" | "admin" | "default";
}

export default function Logo({ theme = "light", className = "", variant = "default" }: LogoProps) {
  const [error, setError] = useState(false);
  const src = theme === "dark" ? "/assets/logos/logo-light.svg" : "/assets/logos/logo-black.svg";
  
  if (error) {
    return (
      <div className={`flex flex-col justify-center ${className} ${theme === "dark" ? "text-white" : "text-slate-900"}`}>
        <span className="text-xl font-extrabold tracking-tight leading-none">GENCELL</span>
        {variant === "portal" && <span className="text-[10px] font-semibold text-blue-600 tracking-[0.1em] uppercase leading-none mt-1">Portal Médico</span>}
        {variant === "admin" && <span className="text-[10px] font-medium font-mono text-indigo-500 tracking-widest mt-1 uppercase">Admin</span>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col justify-center ${className}`}>
      <div className="relative w-full h-full flex-1 min-h-0">
        <Image
          src={src}
          alt="Gencell Logo"
          fill
          className="object-contain object-left"
          onError={() => setError(true)}
          sizes="(max-width: 768px) 150px, 200px"
          priority
        />
      </div>
      {variant === "portal" && <span className="text-[10px] font-bold text-blue-600 tracking-[0.15em] uppercase leading-none mt-1.5 ml-0.5">Portal Médico</span>}
      {variant === "admin" && <span className="text-[10px] font-medium font-mono text-indigo-500 tracking-widest mt-1.5 ml-0.5 uppercase">Admin</span>}
    </div>
  );
}
