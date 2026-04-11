import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const isAuth = !!req.auth;
  const isPublicRoute = req.nextUrl.pathname === "/" || 
                        req.nextUrl.pathname === "/registro-profesional" || 
                        req.nextUrl.pathname === "/activar" || 
                        req.nextUrl.pathname.startsWith('/api/');

  if (!isAuth && !isPublicRoute) {
     return NextResponse.redirect(new URL("/", req.nextUrl));
  }

  if (isAuth && (req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/login")) {
     const role = req.auth?.user?.role;
     return NextResponse.redirect(new URL(role === "ADMIN" ? "/admin" : "/profesional", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
