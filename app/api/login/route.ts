import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log("credenciales " , email, password )
    // 🔐 Credenciales desde .env
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASS; // hash bcrypt

    // 1️⃣ Validar email
    if (email !== ADMIN_EMAIL) {
      console.log(email, ADMIN_EMAIL)
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 2️⃣ Validar password (comparando con hash)
    const isValid = await bcrypt.compare(password, ADMIN_PASS!);
    console.log(isValid, password, ADMIN_PASS)
    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // 👤 Usuario fake (porque no viene de DB)
    const user = {
      id: 1,
      email: ADMIN_EMAIL,
      role: "admin",
    };

    // 3️⃣ Access Token
    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    // 4️⃣ Refresh Token
    const refreshToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_REFRESH_SECRET!,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      role: user.role,
    });

    // 📧 Email visible en frontend
    response.cookies.set("emailTech", user.email!, {
      httpOnly: false,
      path: "/",
    });

    // 🔐 Access Token
    response.cookies.set("tokenTtech", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 2,
    });

    // 🔄 Refresh Token
    response.cookies.set("refreshTokenTech", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    console.log("Login exitoso (ADMIN):", email);

    return response;

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error en login" },
      { status: 500 }
    );
  }
}