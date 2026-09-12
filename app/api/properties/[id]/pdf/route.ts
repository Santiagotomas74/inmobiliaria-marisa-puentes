export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import sharp from "sharp";

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
  description?: string;
  operation: string;
  type: string;
  address?: string;
  city?: string;
  province?: string;
  price?: number;
  price_ars?: number;
  price_usd?: number;
  bedrooms?: number;
  bathrooms?: number;
  rooms?: number;
  surface_total?: number;
  surface_covered?: number;
  garage?: number;
  condition?: string;
  media?: Media[];
};

type ImageData = {
  buffer: Buffer;
  type: "jpg" | "png";
};

const PAGE_WIDTH = (270 * 72) / 25.4;
const PAGE_HEIGHT = (195 * 72) / 25.4;

const MARGIN = 18;

const COLORS = {
  navy: rgb(0.075, 0.19, 0.34),
  navyDark: rgb(0.055, 0.14, 0.25),
  blueLight: rgb(0.91, 0.95, 0.98),
  blueLighter: rgb(0.96, 0.975, 0.99),
  text: rgb(0.08, 0.1, 0.13),
  textSoft: rgb(0.32, 0.38, 0.45),
  border: rgb(0.84, 0.87, 0.91),
  white: rgb(1, 1, 1),
};

const CONTACT = {
  name: "MARISA PUENTES PROPIEDADES",
  phone: "11 3700-1152",
  email: "marisapuentespropiedades@yahoo.com",
};

async function downloadImage(url: string): Promise<ImageData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    try {
      // sharp.rotate() auto-orienta la imagen según los metadatos EXIF
      // y ajusta físicamente la matriz de píxeles antes de incrustar en pdf-lib
      const processedBuffer = await sharp(buffer)
        .rotate()
        .jpeg({ quality: 90 })
        .toBuffer();

      return {
        buffer: processedBuffer,
        type: "jpg",
      };
    } catch {
      // Fallback si sharp falla
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("png")) {
        return { buffer, type: "png" };
      }
      return { buffer, type: "jpg" };
    }
  } catch {
    return null;
  }
}

function formatPropertyPrice(property: Property): string {
  const operation = (property.operation || "").toLowerCase();

  if (
    operation.includes("alquiler") ||
    operation.includes("rent") ||
    operation.includes("temporario")
  ) {
    if (property.price_ars) {
      return `$ ${Number(property.price_ars).toLocaleString("es-AR")}`;
    }

    if (property.price) {
      return `$ ${Number(property.price).toLocaleString("es-AR")}`;
    }
  }

  if (operation.includes("venta") || operation.includes("sale")) {
    if (property.price_usd) {
      return `USD ${Number(property.price_usd).toLocaleString("es-AR")}`;
    }

    if (property.price) {
      return `USD ${Number(property.price).toLocaleString("es-AR")}`;
    }
  }

  if (property.price_usd) {
    return `USD ${Number(property.price_usd).toLocaleString("es-AR")}`;
  }

  if (property.price_ars) {
    return `$ ${Number(property.price_ars).toLocaleString("es-AR")}`;
  }

  if (property.price) {
    return `$ ${Number(property.price).toLocaleString("es-AR")}`;
  }

  return "Consultar";
}

function drawText(
  page: any,
  text: string,
  x: number,
  y: number,
  font: any,
  size: number,
  color = COLORS.text,
) {
  page.drawText(text, {
    x,
    y,
    font,
    size,
    color,
  });
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return "";

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength - 3)}...`;
}

function drawImageFit(
  page: any,
  image: any,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const imageWidth = image.width;
  const imageHeight = image.height;

  const imageRatio = imageWidth / imageHeight;
  const boxRatio = width / height;

  let drawWidth = width;
  let drawHeight = height;

  if (imageRatio > boxRatio) {
    drawHeight = width / imageRatio;
  } else {
    drawWidth = height * imageRatio;
  }

  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  page.drawImage(image, {
    x: drawX,
    y: drawY,
    width: drawWidth,
    height: drawHeight,
  });
}

function drawFeatureCard(
  page: any,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  font: any,
  boldFont: any,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: COLORS.blueLighter,
    borderColor: COLORS.border,
    borderWidth: 0.8,
  });

  drawText(
    page,
    label.toUpperCase(),
    x + 10,
    y + height - 16,
    font,
    6,
    COLORS.textSoft,
  );

  drawText(page, value, x + 10, y + 12, boldFont, 11, COLORS.navy);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await query(
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

    if (!result.rows.length) {
      return NextResponse.json(
        {
          error: "Propiedad no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    const property = result.rows[0];

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    /*
     * ============================================================
     * MEDIA
     * ============================================================
     */

    const media = (property.media || [])
      .filter((item: Media) => {
        const type = (item.type || "").toLowerCase();

        return (
          type.includes("image") ||
          type.includes("jpg") ||
          type.includes("jpeg") ||
          type.includes("png")
        );
      })
      .sort((a: Media, b: Media) => {
        return a.position - b.position;
      });

    const orderedMedia = [
      ...media.filter((item: Media) => item.is_main),
      ...media.filter((item: Media) => !item.is_main),
    ].slice(0, 4);

    const images: any[] = [];

    for (const item of orderedMedia) {
      const imageData = await downloadImage(item.url);

      if (!imageData) {
        continue;
      }

      try {
        let embeddedImage;

        if (imageData.type === "png") {
          embeddedImage = await pdf.embedPng(imageData.buffer);
        } else {
          embeddedImage = await pdf.embedJpg(imageData.buffer);
        }

        images.push(embeddedImage);
      } catch {
        // Ignorar imagen si falla la inserción
      }
    }

    /*
     * ============================================================
     * LOGO
     * ============================================================
     */

    let logoImage: any = null;

    try {
      const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);

        logoImage = await pdf.embedJpg(logoBuffer);
      }
    } catch {
      logoImage = null;
    }

    /*
     * ============================================================
     * HEADER
     * ============================================================
     */

    const HEADER_HEIGHT = 46;

    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: COLORS.navy,
    });

    if (logoImage) {
      drawImageFit(
        page,
        logoImage,
        MARGIN,
        PAGE_HEIGHT - HEADER_HEIGHT + 7,
        34,
        32,
      );
    }

    const brandX = logoImage ? MARGIN + 43 : MARGIN;

    drawText(
      page,
      "MARISA PUENTES",
      brandX,
      PAGE_HEIGHT - 22,
      boldFont,
      11,
      COLORS.white,
    );

    drawText(
      page,
      "PROPIEDADES",
      brandX,
      PAGE_HEIGHT - 34,
      regularFont,
      6.5,
      COLORS.white,
    );

    const operationText = (property.operation || "PROPIEDAD").toUpperCase();

    const operationWidth = boldFont.widthOfTextAtSize(operationText, 7);

    const operationBoxWidth = operationWidth + 22;

    page.drawRectangle({
      x: PAGE_WIDTH - MARGIN - operationBoxWidth,
      y: PAGE_HEIGHT - 35,
      width: operationBoxWidth,
      height: 20,
      color: COLORS.white,
    });

    drawText(
      page,
      operationText,
      PAGE_WIDTH - MARGIN - operationBoxWidth + 11,
      PAGE_HEIGHT - 28,
      boldFont,
      7,
      COLORS.navy,
    );

    /*
     * ============================================================
     * LAYOUT PRINCIPAL
     * ============================================================
     */

    const contentTop = PAGE_HEIGHT - HEADER_HEIGHT - 10;

    const galleryTop = contentTop;

    const LEFT_WIDTH = 425;
    const GAP = 20;

    const RIGHT_X = MARGIN + LEFT_WIDTH + GAP;

    const RIGHT_WIDTH = PAGE_WIDTH - RIGHT_X - MARGIN;

    /*
     * ============================================================
     * GALERÍA
     * ============================================================
     */

    const mainImageHeight = 290;

    const thumbnailGap = 7;

    const thumbnailWidth = (LEFT_WIDTH - thumbnailGap * 2) / 3;

    const thumbnailHeight = 82;

    const mainImageY = galleryTop - mainImageHeight;

    page.drawRectangle({
      x: MARGIN,
      y: mainImageY,
      width: LEFT_WIDTH,
      height: mainImageHeight,
      color: COLORS.blueLighter,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    if (images[0]) {
      drawImageFit(
        page,
        images[0],
        MARGIN,
        mainImageY,
        LEFT_WIDTH,
        mainImageHeight,
      );
    } else {
      drawText(
        page,
        "SIN IMAGEN",
        MARGIN + LEFT_WIDTH / 2 - 32,
        mainImageY + mainImageHeight / 2,
        boldFont,
        8,
        COLORS.textSoft,
      );
    }

    const thumbnailsY = mainImageY - 8 - thumbnailHeight;

    for (let i = 0; i < 3; i++) {
      const image = images[i + 1];

      const x = MARGIN + i * (thumbnailWidth + thumbnailGap);

      page.drawRectangle({
        x,
        y: thumbnailsY,
        width: thumbnailWidth,
        height: thumbnailHeight,
        color: COLORS.blueLighter,
        borderColor: COLORS.border,
        borderWidth: 0.8,
      });

      if (image) {
        drawImageFit(
          page,
          image,
          x,
          thumbnailsY,
          thumbnailWidth,
          thumbnailHeight,
        );
      } else {
        drawText(
          page,
          "SIN IMAGEN",
          x + thumbnailWidth / 2 - 27,
          thumbnailsY + thumbnailHeight / 2 - 3,
          boldFont,
          6,
          COLORS.textSoft,
        );
      }
    }

    /*
     * ============================================================
     * INFORMACIÓN DERECHA
     * ============================================================
     */

    const titleY = galleryTop - 2;

    const title = truncateText(property.title || "Propiedad", 48);

    drawText(page, title, RIGHT_X, titleY, boldFont, 17, COLORS.navyDark);

    const addressParts = [
      property.address,
      property.city,
      property.province,
    ].filter(Boolean);

    const address = addressParts.join(", ");

    if (address) {
      drawText(
        page,
        truncateText(address, 65),
        RIGHT_X,
        titleY - 22,
        regularFont,
        7.5,
        COLORS.textSoft,
      );
    }

    /*
     * ============================================================
     * PRECIO
     * ============================================================
     */

    const priceBoxHeight = 65;

    const priceBoxY = galleryTop - 105;

    page.drawRectangle({
      x: RIGHT_X,
      y: priceBoxY,
      width: RIGHT_WIDTH,
      height: priceBoxHeight,
      color: COLORS.navy,
    });

    drawText(
      page,
      "VALOR",
      RIGHT_X + 14,
      priceBoxY + priceBoxHeight - 19,
      regularFont,
      6.5,
      COLORS.white,
    );

    drawText(
      page,
      formatPropertyPrice(property),
      RIGHT_X + 14,
      priceBoxY + 19,
      boldFont,
      19,
      COLORS.white,
    );

    /*
     * ============================================================
     * CARACTERÍSTICAS
     * ============================================================
     */

    const cardsGap = 8;

    const cardsWidth = (RIGHT_WIDTH - cardsGap) / 2;

    const cardHeight = 53;

    const cardsTop = priceBoxY - 12;

    const row1Y = cardsTop - cardHeight;

    drawFeatureCard(
      page,
      RIGHT_X,
      row1Y,
      cardsWidth,
      cardHeight,
      "Ambientes",
      property.rooms != null ? String(property.rooms) : "-",
      regularFont,
      boldFont,
    );

    drawFeatureCard(
      page,
      RIGHT_X + cardsWidth + cardsGap,
      row1Y,
      cardsWidth,
      cardHeight,
      "Dormitorios",
      property.bedrooms != null ? String(property.bedrooms) : "-",
      regularFont,
      boldFont,
    );

    const row2Y = row1Y - 7 - cardHeight;

    drawFeatureCard(
      page,
      RIGHT_X,
      row2Y,
      cardsWidth,
      cardHeight,
      "Baños",
      property.bathrooms != null ? String(property.bathrooms) : "-",
      regularFont,
      boldFont,
    );

    drawFeatureCard(
      page,
      RIGHT_X + cardsWidth + cardsGap,
      row2Y,
      cardsWidth,
      cardHeight,
      "Sup. total",
      property.surface_total != null ? `${property.surface_total} m²` : "-",
      regularFont,
      boldFont,
    );

    const row3Y = row2Y - 7 - cardHeight;

    drawFeatureCard(
      page,
      RIGHT_X,
      row3Y,
      cardsWidth,
      cardHeight,
      "Sup. cubierta",
      property.surface_covered != null ? `${property.surface_covered} m²` : "-",
      regularFont,
      boldFont,
    );

    drawFeatureCard(
      page,
      RIGHT_X + cardsWidth + cardsGap,
      row3Y,
      cardsWidth,
      cardHeight,
      "Estado",
      property.condition ? truncateText(property.condition, 15) : "-",
      regularFont,
      boldFont,
    );

    /*
     * ============================================================
     * CONTACTO + QR
     * ============================================================
     */

    const contactHeight = 78;
    const contactY = MARGIN;

    page.drawRectangle({
      x: RIGHT_X,
      y: contactY,
      width: RIGHT_WIDTH,
      height: contactHeight,
      color: COLORS.blueLight,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    const qrAreaWidth = 76;

    drawText(
      page,
      "CONTACTO",
      RIGHT_X + 12,
      contactY + contactHeight - 17,
      boldFont,
      6.5,
      COLORS.navy,
    );

    drawText(
      page,
      truncateText(CONTACT.name, 34),
      RIGHT_X + 12,
      contactY + 43,
      boldFont,
      7.5,
      COLORS.text,
    );

    drawText(
      page,
      CONTACT.phone,
      RIGHT_X + 12,
      contactY + 30,
      regularFont,
      7,
      COLORS.textSoft,
    );

    drawText(
      page,
      truncateText(CONTACT.email, 38),
      RIGHT_X + 12,
      contactY + 18,
      regularFont,
      6.3,
      COLORS.textSoft,
    );

    /*
     * ============================================================
     * QR
     * ============================================================
     */

    const propertyUrl = `${req.nextUrl.origin}/propiedades/${property.id}`;

    const qrBuffer = await QRCode.toBuffer(propertyUrl, {
      type: "png",
      width: 300,
      margin: 1,
    });

    const qrImage = await pdf.embedPng(qrBuffer);

    const qrSize = 48;

    const qrX =
      RIGHT_X + RIGHT_WIDTH - qrAreaWidth + (qrAreaWidth - qrSize) / 2;

    const qrY = contactY + 20;

    page.drawRectangle({
      x: RIGHT_X + RIGHT_WIDTH - qrAreaWidth,
      y: contactY + 7,
      width: qrAreaWidth - 7,
      height: contactHeight - 14,
      color: COLORS.white,
    });

    page.drawImage(qrImage, {
      x: qrX,
      y: qrY,
      width: qrSize,
      height: qrSize,
    });

    drawText(
      page,
      "VER PUBLICACIÓN",
      RIGHT_X + RIGHT_WIDTH - qrAreaWidth + 9,
      contactY + 9,
      boldFont,
      5.2,
      COLORS.navy,
    );

    /*
     * ============================================================
     * CÓDIGO DE PROPIEDAD
     * ============================================================
     */

    drawText(
      page,
      `Código: ${property.id}`,
      MARGIN,
      8,
      regularFont,
      5.5,
      COLORS.textSoft,
    );

    /*
     * ============================================================
     * GENERAR PDF
     * ============================================================
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
    console.error("Error generando PDF de propiedad:", error);

    return NextResponse.json(
      {
        error: "No se pudo generar el PDF de la propiedad",
      },
      {
        status: 500,
      },
    );
  }
}
