// /api/property-media/route.ts

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const result = await query(
    `INSERT INTO property_media 
     (property_id, url, public_id, type, is_main)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      body.property_id,
      body.url,
      body.public_id,
      body.type,
      body.is_main,
    ]
  );

  return NextResponse.json(result.rows[0]); // 🔥 CLAVE
}