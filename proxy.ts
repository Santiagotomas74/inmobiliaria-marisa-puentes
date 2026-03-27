import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: any) {
  const token = req.cookies.get("tokenTtech")?.value;
  const { pathname } = req.nextUrl;

  // ✅ SI está en login (/administracion)
  if (pathname === "/administracion") {
    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

        // 👉 Si ya está logueado, lo mandamos al dashboard
        if (decoded.role === "admin") {
          return NextResponse.redirect(
            new URL("/administracion/dashboard", req.url)
          );
        }
      } catch {}
    }

    return NextResponse.next(); // deja entrar al login
  }

  // 🔒 PROTEGER TODO LO DEMÁS
  if (!token) {
    return NextResponse.redirect(
      new URL("/administracion", req.url)
    );
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // 🔥 Validar que sea admin
    if (decoded.role !== "admin") {
      return NextResponse.redirect(
        new URL("/administracion", req.url)
      );
    }

    return NextResponse.next();

  } catch {
    return NextResponse.redirect(
      new URL("/administracion", req.url)
    );
  }
}

export const config = {
  matcher: ["/administracion/:path*"],
};