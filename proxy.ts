import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req: any) {
  const token = req.cookies.get("tokenTtech")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/administacion", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/administracion", req.url));
  }
}

export const config = {
  matcher: ["/administracion/admin/:path*"],
};