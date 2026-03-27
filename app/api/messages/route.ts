import { NextResponse } from "next/server";
import { query } from "@/db";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔒 Validaciones básicas
    if (!data.name || !data.email || !data.message) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    const { rows } = await query(
      `
      INSERT INTO messages (
        name,
        email,
        phone,
        message
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        data.name,
        data.email,
        data.phone || null,
        data.message,
      ]
    );

    return NextResponse.json({
      id: rows[0].id,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al guardar mensaje" },
      { status: 500 }
    );
  }
}

// 📩 GET (para admin)
export async function GET() {
  try {
    const { rows } = await query(`
      SELECT *
      FROM messages
      ORDER BY created_at DESC
    `);

    return NextResponse.json(rows);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener mensajes" },
      { status: 500 }
    );
  }
}