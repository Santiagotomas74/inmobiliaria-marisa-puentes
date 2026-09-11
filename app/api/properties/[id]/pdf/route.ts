import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type Media = {
  id: number;
  url: string;
  type: string;
  is_main: boolean;
  position: number;
};

type Property = {
  id: number;
  title: string;
  description: string | null;
  price: number | null;
  price_ars: number | null;
  operation: string | null;
  type: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  rooms: number | null;
  surface_total: number | null;
  surface_covered: number | null;
  surface_uncovered: number | null;
  garage: boolean | null;
  condition: string | null;
  construction_year: number | null;
  is_featured: boolean;
  media: Media[] | null;
};

type ImageData = {
  bytes: Uint8Array;
  type: "jpg" | "png";
};

const PAGE_WIDTH = (195 * 72) / 25.4;
const PAGE_HEIGHT = (270 * 72) / 25.4;

const MARGIN = 24;

async function downloadImage(url: string): Promise<ImageData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("No se pudo descargar imagen:", url);
      return null;
    }

    const contentType = response.headers.get("content-type") || "";

    const bytes = new Uint8Array(await response.arrayBuffer());

    if (contentType.includes("png")) {
      return {
        bytes,
        type: "png",
      };
    }

    if (contentType.includes("jpeg") || contentType.includes("jpg")) {
      return {
        bytes,
        type: "jpg",
      };
    }

    console.warn("Formato de imagen no soportado:", contentType, url);

    return null;
  } catch (error) {
    console.error("Error descargando imagen:", error);
    return null;
  }
}

function formatPrice(price: number | null, currency?: string | null) {
  if (price === null || price === undefined) {
    return "Consultar";
  }

  const formatted = new Intl.NumberFormat("es-AR").format(price);

  if (currency === "USD") {
    return `USD ${formatted}`;
  }

  return `$ ${formatted}`;
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color = rgb(0.12, 0.12, 0.12),
) {
  page.drawText(text, {
    x,
    y,
    size,
    font,
    color,
  });
}

function drawInfo(
  page: any,
  label: string,
  value: string,
  x: number,
  y: number,
  regularFont: any,
  boldFont: any,
) {
  drawText(page, label, x, y, boldFont, 8);

  drawText(page, value, x, y - 11, regularFont, 9);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

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
      LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return NextResponse.json(
        { error: "Propiedad no encontrada" },
        { status: 404 },
      );
    }

    const property = rows[0] as Property;

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    /*
     * =========================================================
     * IMÁGENES
     * =========================================================
     */

    const media = (property.media || [])
      .filter((item) => {
        const type = String(item.type || "").toLowerCase();

        return (
          type.includes("image") ||
          type.includes("jpg") ||
          type.includes("jpeg") ||
          type.includes("png")
        );
      })
      .sort((a, b) => (a.position || 0) - (b.position || 0));

    const images: {
      image: any;
      width: number;
      height: number;
    }[] = [];

    for (const item of media) {
      const downloaded = await downloadImage(item.url);

      if (!downloaded) {
        continue;
      }

      try {
        const embedded =
          downloaded.type === "png"
            ? await pdf.embedPng(downloaded.bytes)
            : await pdf.embedJpg(downloaded.bytes);

        images.push({
          image: embedded,
          width: embedded.width,
          height: embedded.height,
        });
      } catch (error) {
        console.error("Error insertando imagen en PDF:", item.url, error);
      }
    }

    /*
     * =========================================================
     * PÁGINA 1
     * =========================================================
     */

    let page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    let y = PAGE_HEIGHT - MARGIN;

    /*
     * ENCABEZADO
     */

    drawText(
      page,
      "MARISA PUENTES PROPIEDADES",
      MARGIN,
      y,
      boldFont,
      13,
      rgb(0.08, 0.08, 0.08),
    );

    y -= 18;

    drawText(
      page,
      `${property.operation || ""} · ${property.type || ""}`,
      MARGIN,
      y,
      regularFont,
      9,
      rgb(0.35, 0.35, 0.35),
    );

    y -= 22;

    /*
     * TÍTULO
     */

    drawText(page, property.title || "Propiedad", MARGIN, y, boldFont, 16);

    y -= 16;

    if (property.address) {
      drawText(
        page,
        `${property.address}${property.city ? `, ${property.city}` : ""}`,
        MARGIN,
        y,
        regularFont,
        9,
        rgb(0.35, 0.35, 0.35),
      );
    }

    y -= 20;

    /*
     * PRECIO
     */

    const price = formatPrice(property.price, (property as any).currency);

    drawText(page, price, MARGIN, y, boldFont, 17);

    y -= 24;

    /*
     * IMAGEN PRINCIPAL
     */

    if (images.length > 0) {
      const main = images[0];

      const maxWidth = PAGE_WIDTH - MARGIN * 2;
      const maxHeight = 185;

      const scale = Math.min(maxWidth / main.width, maxHeight / main.height);

      const width = main.width * scale;
      const height = main.height * scale;

      const x = MARGIN + (maxWidth - width) / 2;

      page.drawImage(main.image, {
        x,
        y: y - height,
        width,
        height,
      });

      y -= height + 18;
    }

    /*
     * =========================================================
     * INFORMACIÓN
     * =========================================================
     */

    const columnWidth = (PAGE_WIDTH - MARGIN * 2) / 3;

    let infoY = y;

    if (property.rooms !== null) {
      drawInfo(
        page,
        "Ambientes",
        String(property.rooms),
        MARGIN,
        infoY,
        regularFont,
        boldFont,
      );
    }

    if (property.bedrooms !== null) {
      drawInfo(
        page,
        "Dormitorios",
        String(property.bedrooms),
        MARGIN + columnWidth,
        infoY,
        regularFont,
        boldFont,
      );
    }

    if (property.bathrooms !== null) {
      drawInfo(
        page,
        "Baños",
        String(property.bathrooms),
        MARGIN + columnWidth * 2,
        infoY,
        regularFont,
        boldFont,
      );
    }

    infoY -= 38;

    if (property.surface_total !== null) {
      drawInfo(
        page,
        "Superficie total",
        `${property.surface_total} m²`,
        MARGIN,
        infoY,
        regularFont,
        boldFont,
      );
    }

    if (property.surface_covered !== null) {
      drawInfo(
        page,
        "Superficie cubierta",
        `${property.surface_covered} m²`,
        MARGIN + columnWidth,
        infoY,
        regularFont,
        boldFont,
      );
    }

    if (property.garage !== null) {
      drawInfo(
        page,
        "Garage",
        property.garage ? "Sí" : "No",
        MARGIN + columnWidth * 2,
        infoY,
        regularFont,
        boldFont,
      );
    }

    /*
     * =========================================================
     * DESCRIPCIÓN
     * =========================================================
     */

    infoY -= 38;

    if (property.description) {
      drawText(page, "DESCRIPCIÓN", MARGIN, infoY, boldFont, 9);

      infoY -= 14;

      const description = property.description;

      const maxChars = 85;

      const lines: string[] = [];

      for (let i = 0; i < description.length; i += maxChars) {
        lines.push(description.substring(i, i + maxChars));
      }

      for (const line of lines.slice(0, 7)) {
        drawText(page, line, MARGIN, infoY, regularFont, 8);

        infoY -= 11;
      }
    }

    /*
     * =========================================================
     * FOOTER
     * =========================================================
     */

    page.drawLine({
      start: {
        x: MARGIN,
        y: 28,
      },
      end: {
        x: PAGE_WIDTH - MARGIN,
        y: 28,
      },
      thickness: 0.5,
      color: rgb(0.8, 0.8, 0.8),
    });

    drawText(page, "MARISA PUENTES PROPIEDADES", MARGIN, 17, boldFont, 7);

    /*
     * =========================================================
     * PÁGINAS ADICIONALES DE FOTOS
     * =========================================================
     */

    const remainingImages = images.slice(1);

    const imageWidth = (PAGE_WIDTH - MARGIN * 2 - 12) / 2;

    const imageHeight = 130;

    for (let i = 0; i < remainingImages.length; i += 4) {
      page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

      drawText(
        page,
        property.title || "Propiedad",
        MARGIN,
        PAGE_HEIGHT - MARGIN,
        boldFont,
        13,
      );

      drawText(
        page,
        "Galería de imágenes",
        MARGIN,
        PAGE_HEIGHT - MARGIN - 17,
        regularFont,
        8,
        rgb(0.4, 0.4, 0.4),
      );

      const batch = remainingImages.slice(i, i + 4);

      batch.forEach((item, index) => {
        const column = index % 2;
        const row = Math.floor(index / 2);

        const x = MARGIN + column * (imageWidth + 12);

        const boxY = PAGE_HEIGHT - 65 - row * (imageHeight + 25);

        const scale = Math.min(
          imageWidth / item.width,
          imageHeight / item.height,
        );

        const width = item.width * scale;

        const height = item.height * scale;

        const imageX = x + (imageWidth - width) / 2;

        const imageY = boxY - height;

        page.drawImage(item.image, {
          x: imageX,
          y: imageY,
          width,
          height,
        });
      });

      page.drawLine({
        start: {
          x: MARGIN,
          y: 28,
        },
        end: {
          x: PAGE_WIDTH - MARGIN,
          y: 28,
        },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8),
      });

      drawText(page, "MARISA PUENTES PROPIEDADES", MARGIN, 17, boldFont, 7);
    }

    /*
     * =========================================================
     * GENERAR PDF
     * =========================================================
     */

    const pdfBytes = await pdf.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="ficha-propiedad-${property.id}.pdf"`,
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error generando ficha PDF:", error);

    return NextResponse.json(
      {
        error: "Error al generar la ficha PDF",
      },
      {
        status: 500,
      },
    );
  }
}
