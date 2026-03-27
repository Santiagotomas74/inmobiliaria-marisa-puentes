import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";

export async function PUT(req: NextRequest) {
  try {
    const { property_id, media_id } = await req.json();


    await query(
      `UPDATE property_media SET is_main = false WHERE property_id = $1`,
      [property_id]
    );

    await query(
      `UPDATE property_media SET is_main = true WHERE id = $1`,
      [media_id]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}