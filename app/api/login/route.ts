import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASS;
    const JWT_SECRET = process.env.JWT_SECRET;
    const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

    // Verificar que las variables existan
    if (!ADMIN_EMAIL || !ADMIN_PASS || !JWT_SECRET || !JWT_REFRESH_SECRET) {
      console.error("Faltan variables de entorno");

      return NextResponse.json(
        { error: "Error de configuración del servidor" },
        { status: 500 },
      );
    }

    // Validar email
    if (email !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    // Comparar contraseña ingresada contra hash bcrypt
    const isValid = await bcrypt.compare(password, ADMIN_PASS);

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 },
      );
    }

    const user = {
      id: 1,
      email: ADMIN_EMAIL,
      role: "admin",
    };

    // Access Token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1h" },
    );

    // Refresh Token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_REFRESH_SECRET,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    response.cookies.set("emailTech", user.email, {
      httpOnly: false,
      path: "/",
    });

    response.cookies.set("tokenTtech", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60,
    });

    response.cookies.set("refreshTokenTech", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("Login exitoso (ADMIN):", email);

    return response;
  } catch (error) {
    console.error("Error en login:", error);

    return NextResponse.json({ error: "Error en login" }, { status: 500 });
  }
}
