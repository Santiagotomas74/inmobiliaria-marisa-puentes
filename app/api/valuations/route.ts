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
        notes,
        created_at
      FROM property_valuations
      ORDER BY created_at DESC
    `);

    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener solicitudes" },
      { status: 500 },
    );
  }
}

// 📤 POST → crear solicitud
export async function POST(req: Request) {
  try {
    const data = await req.json();

    const { name, email, phone, operation, property_type, zone, notes } = data;

    console.log("Datos recibidos:", data);

    // 📞 regex teléfono
    const phoneRegex = /^\+?[0-9\s()-]{8,20}$/;

    // ✅ VALIDACIONES
    if (
      !name ||
      !email ||
      !phone ||
      !operation ||
      !property_type ||
      !zone ||
      !notes
    ) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 },
      );
    }

    // 📧 validar email
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // 📞 validar teléfono
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "Teléfono inválido" }, { status: 400 });
    }

    // 💾 INSERT
    const { rows } = await query(
      `
      INSERT INTO property_valuations 
      (
        name,
        email,
        phone,
        operation,
        property_type,
        zone,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [name, email, phone, operation, property_type, zone, notes],
    );

    return NextResponse.json({
      success: true,
      id: rows[0].id,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al guardar la solicitud" },
      { status: 500 },
    );
  }
}
