import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const operation = searchParams.get("operation");
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const rooms = searchParams.get("rooms");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const currency = searchParams.get("currency") || "usd";

    let where = `WHERE p.is_active = true`;
    const values: any[] = [];
    let i = 1;

    // 🏷 operación
    if (operation) {
      where += ` AND p.operation = $${i++}`;
      values.push(operation);
    }

    // 📍 ciudad
    if (city) {
      where += ` AND LOWER(p.city) LIKE LOWER($${i++})`;
      values.push(`%${city}%`);
    }

    // 🏠 tipo
    if (type) {
      where += ` AND p.type = $${i++}`;
      values.push(type);
    }

    // 🛏 ambientes
    if (rooms) {
      where += ` AND p.bedrooms >= $${i++}`;
      values.push(Number(rooms));
    }

    // 💰 precio dinámico
    const priceField =
      currency === "ars" ? "p.price_ars" : "p.price";

    if (minPrice) {
      where += ` AND ${priceField} >= $${i++}`;
      values.push(Number(minPrice));
    }

    if (maxPrice) {
      where += ` AND ${priceField} <= $${i++}`;
      values.push(Number(maxPrice));
    }

    const { rows } = await query(
      `
      SELECT 
        p.*,
        
        -- 🖼 imagen principal
        (
          SELECT url 
          FROM property_media 
          WHERE property_id = p.id AND is_main = true
          LIMIT 1
        ) AS main_image,

        -- 📸 todas las imágenes
        (
          SELECT json_agg(
            json_build_object(
              'id', pm.id,
              'url', pm.url,
              'type', pm.type,
              'is_main', pm.is_main,
              'order_index', pm.order_index
            )
          )
          FROM property_media pm
          WHERE pm.property_id = p.id
        ) AS media

      FROM properties p
      ${where}
      ORDER BY p.is_featured DESC, p.created_at DESC;
      `,
      values
    );

    return NextResponse.json(rows);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener propiedades" },
      { status: 500 }
    );
  }
}
export async function POST(req: Request) {
  try {
    const data = await req.json();

    // ✅ Validaciones básicas
    if (!data.title || !data.operation || !data.type || !data.price) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // 💰 Normalizar números
    const price = Number(data.price);
    const price_ars = data.price_ars ? Number(data.price_ars) : null;

    if (isNaN(price)) {
      return NextResponse.json(
        { error: "Precio inválido" },
        { status: 400 }
      );
    }

    // 🧠 Defaults inteligentes
    const propertyData = {
      title: data.title,
      description: data.description || "",
      price,
      price_ars,
      currency: "USD",
      currency_ars: "ARS",
      operation: data.operation,
      type: data.type,
      address: data.address || "",
      city: data.city || "",
      province: data.province || "",
      rooms: data.rooms || null,
      bedrooms: data.bedrooms || null,
      bathrooms: data.bathrooms || null,
      surface_total: data.surface_total || null,
      surface_covered: data.surface_covered || null,
      surface_uncovered: data.surface_uncovered || null,
      condition: data.condition || null,
      construction_year: data.construction_year || null,
      garage: data.garage || false,
      is_featured: data.is_featured || false,
      is_active: true,
    };

    // 🗄 INSERT COMPLETO
    const { rows } = await query(
      `
      INSERT INTO properties (
        title,
        description,
        price,
        price_ars,
        currency,
        currency_ars,
        operation,
        type,
        address,
        city,
        province,
        rooms,
        bedrooms,
        bathrooms,
        surface_total,
        surface_covered,
        surface_uncovered,
        condition,
        construction_year,
        garage,
        is_featured,
        is_active
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22
      )
      RETURNING id
      `,
      [
        propertyData.title,
        propertyData.description,
        propertyData.price,
        propertyData.price_ars,
        propertyData.currency,
        propertyData.currency_ars,
        propertyData.operation,
        propertyData.type,
        propertyData.address,
        propertyData.city,
        propertyData.province,
        propertyData.rooms,
        propertyData.bedrooms,
        propertyData.bathrooms,
        propertyData.surface_total,
        propertyData.surface_covered,
        propertyData.surface_uncovered,
        propertyData.condition,
        propertyData.construction_year,
        propertyData.garage,
        propertyData.is_featured,
        propertyData.is_active,
      ]
    );

    return NextResponse.json({
      success: true,
      id: rows[0].id,
    });

  } catch (error) {
    console.error("Error creando propiedad:", error);

    return NextResponse.json(
      { error: "Error al crear propiedad" },
      { status: 500 }
    );
  }
}