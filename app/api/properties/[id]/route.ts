import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";
import crypto from "crypto";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // ✅ FIX

   const { rows } = await query(
  `
  SELECT 
    p.*,
    (
      SELECT json_agg(
        json_build_object(
          'id', pm.id,
          'url', pm.url,
          'type', pm.type,
          'is_main', pm.is_main,
          'position', pm.position
        )
        ORDER BY pm.position ASC
      )
      FROM property_media pm
      WHERE pm.property_id = p.id
    ) AS media
  FROM properties p
  WHERE p.id = $1
  `,
  [id]
);

    return NextResponse.json(rows[0]);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Error al obtener propiedad" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await req.json();

    await query(
  `
  UPDATE properties SET
    title = $1,
    description = $2,
    price = $3,
    price_ars = $4,
    operation = $5,
    type = $6,
    address = $7,
    city = $8,
    province = $9,
    bedrooms = $10,
    bathrooms = $11,
    surface_total = $12,
    surface_covered = $13,
    surface_uncovered = $14,
    garage = $15,
    condition = $16,
    rooms = $17,
    construction_year = $18,
    is_featured = $19
  WHERE id = $20
  `,
  [
    data.title,
    data.description,
    data.price,
    data.price_ars,
    data.operation,
    data.type,
    data.address,
    data.city,
    data.province,
    data.bedrooms,
    data.bathrooms,
    data.surface_total,
    data.surface_covered,
    data.surface_uncovered,
    data.garage,
    data.condition,
    data.rooms,
    data.construction_year,
    data.is_featured,
    id,
  ]
 
);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Error al actualizar" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 1️⃣ TRAER MEDIA DE ESA PROPIEDAD
    const { rows: media } = await query(
      `SELECT public_id FROM property_media WHERE property_id = $1`,
      [id]
    );

    // 2️⃣ ELIMINAR EN CLOUDINARY
    for (const item of media) {
      if (!item.public_id) continue;

      const timestamp = Math.floor(Date.now() / 1000);

      const signature = crypto
        .createHash("sha1")
        .update(
          `public_id=${item.public_id}&timestamp=${timestamp}${process.env.CLOUDINARY_API_SECRET}`
        )
        .digest("hex");

      await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/destroy`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: item.public_id,
            api_key: process.env.CLOUDINARY_API_KEY,
            timestamp,
            signature,
          }),
        }
      );
    }

    // 3️⃣ BORRAR MEDIA DE DB
    await query(
      `DELETE FROM property_media WHERE property_id = $1`,
      [id]
    );

    // 4️⃣ BORRAR PROPIEDAD
    await query(
      `DELETE FROM properties WHERE id = $1`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: "Propiedad eliminada correctamente",
    });

  } catch (error) {
    console.error("Error eliminando propiedad:", error);

    return NextResponse.json(
      { error: "Error al eliminar propiedad" },
      { status: 500 }
    );
  }
}