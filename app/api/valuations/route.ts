import { NextResponse } from "next/server";
import { query } from "@/db";


// 📥 GET → obtener todas las solicitudes
export async function GET() {
  try {
    const { rows } = await query(`
      SELECT 
        id,
        name,
        email,
        phone,
        operation,
        property_type,
        zone,
        status,
        created_at
      FROM property_valuations
      ORDER BY created_at DESC
    `);

    return NextResponse.json(rows);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener solicitudes" },
      { status: 500 }
    );
  }
}


// 📤 POST → crear solicitud
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const {
      name,
      email,
      phone,
      operation,
      property_type,
      zone,
    } = data;

    // ✅ VALIDACIONES
    if (!name || !email || !phone || !operation || !property_type || !zone) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 }
      );
    }

    // 💾 INSERT
    const { rows } = await query(
      `
      INSERT INTO property_valuations 
      (name, email, phone, operation, property_type, zone)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
      `,
      [name, email, phone, operation, property_type, zone]
    );

    return NextResponse.json({
      success: true,
      id: rows[0].id,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al guardar la solicitud" },
      { status: 500 }
    );
  }
}