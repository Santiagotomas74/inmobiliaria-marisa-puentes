import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  await query(`DELETE FROM property_media WHERE id = $1`, [id]);

  return NextResponse.json({ success: true });
}