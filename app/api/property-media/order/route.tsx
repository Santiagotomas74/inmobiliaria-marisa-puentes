import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json(); // array de media
    console.log("Received order update:", body);

    for (let i = 0; i < body.length; i++) {
      const item = body[i];

      await query(
        `UPDATE property_media 
         SET position = $1 
         WHERE id = $2`,
        [i, item.id]
      );
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error al actualizar orden" },
      { status: 500 }
    );
  }
}