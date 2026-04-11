"use client";

import { useState } from "react";
import Image from "next/image";

interface LogoProps {
  /** "light" = fondo claro → usa logo oscuro. "dark" = fondo oscuro → usa logo blanco. */
  theme?: "light" | "dark";
  className?: string;
  /** Controla el badge de subtítulo debajo del logo. */
  variant?: "portal" | "admin" | "default";
  /** Tamaño del logo. Determina el height renderizado; el width se calcula por el aspect ratio 1634:493 ≈ 3.32:1 */
  size?: "sm" | "md" | "lg";
}

const SIZES = {
  sm: { width: 140, height: 42 },   // sidebar compacto
  md: { width: 176, height: 53 },   // sidebar estándar
  lg: { width: 220, height: 66 },   // login / hero
};

export default function Logo({
  theme = "light",
  className = "",
  variant = "default",
  size = "md",
}: LogoProps) {
  const [error, setError] = useState(false);

  const src =
    theme === "dark"
      ? "/assets/logos/logo-light.svg"
      : "/assets/logos/logo-black.svg";

  const { width, height } = SIZES[size];

  const subtitleColor =
    theme === "dark" ? "text-sky-300" : "text-blue-600";

  const fallbackColor =
    theme === "dark" ? "text-white" : "text-slate-900";

  if (error) {
    return (
      <div className={`flex flex-col gap-1 ${className}`}>
        <span
          className={`text-xl font-extrabold tracking-tight leading-none ${fallbackColor}`}
        >
          GENCELL
        </span>
        {variant === "portal" && (
          <span
            className={`text-[10px] font-bold tracking-[0.18em] uppercase leading-none ${subtitleColor}`}
          >
            Portal Médico
          </span>
        )}
        {variant === "admin" && (
          <span
            className={`text-[10px] font-medium font-mono tracking-widest uppercase leading-none ${subtitleColor}`}
          >
            Admin
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      <Image
        src={src}
        alt="Gencell"
        width={width}
        height={height}
        className="object-contain object-left"
        onError={() => setError(true)}
        priority
        style={{ maxWidth: "100%", height: "auto" }}
      />
      {variant === "portal" && (
        <span
          className={`text-[10px] font-bold tracking-[0.18em] uppercase leading-none ${subtitleColor}`}
        >
          Portal Médico
        </span>
      )}
      {variant === "admin" && (
        <span
          className={`text-[10px] font-medium font-mono tracking-widest uppercase leading-none text-indigo-500`}
        >
          Admin Console
        </span>
      )}
    </div>
  );
}
