export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { query } from "@/db";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";

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

/*
 * ============================================================
 * TAMAÑO
 * ============================================================
 *
 * 270 x 195 mm
 * Apaisado
 */

const PAGE_WIDTH = (270 * 72) / 25.4;
const PAGE_HEIGHT = (195 * 72) / 25.4;

const MARGIN = 18;

/*
 * ============================================================
 * COLORES
 * ============================================================
 */

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

/*
 * ============================================================
 * CONTACTO
 * ============================================================
 */

const CONTACT = {
  name: "MARISA PUENTES PROPIEDADES",
  phone: "11 3700-1152",
  email: "marisapuentespropiedades@yahoo.com",
};

/*
 * ============================================================
 * IMÁGENES
 * ============================================================
 *
 * NO usamos Sharp.
 *
 * Tampoco usamos a_auto.
 */

function getCloudinaryUrl(url: string): string {
  try {
    const parsed = new URL(url);

    if (!parsed.hostname.includes("cloudinary.com")) {
      return url;
    }

    const pathname = parsed.pathname;

    const uploadMarker = "/upload/";

    const uploadIndex = pathname.indexOf(uploadMarker);

    if (uploadIndex === -1) {
      return url;
    }

    const beforeUpload = pathname.substring(
      0,
      uploadIndex + uploadMarker.length,
    );

    const afterUpload = pathname.substring(uploadIndex + uploadMarker.length);

    /*
     * IMPORTANTE:
     *
     * NO usamos a_auto.
     *
     * Así evitamos que Cloudinary cambie
     * automáticamente la orientación.
     */

    const transformation = "c_limit,w_1600,h_1200,f_jpg,q_auto";

    return `${parsed.origin}${beforeUpload}${transformation}/${afterUpload}${parsed.search}`;
  } catch (error) {
    console.error("Error construyendo URL de Cloudinary:", url, error);

    return url;
  }
}

async function downloadImage(url: string): Promise<ImageData | null> {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 10000);

  try {
    const finalUrl = getCloudinaryUrl(url);

    console.log("========================================");
    console.log("IMAGEN PDF");
    console.log("Original:", url);
    console.log("Procesada:", finalUrl);
    console.log("========================================");

    const response = await fetch(finalUrl, {
      signal: controller.signal,
      headers: {
        Accept: "image/jpeg,image/png",
      },
    });

    if (!response.ok) {
      console.error(
        "No se pudo descargar imagen. Status:",
        response.status,
        url,
      );

      return null;
    }

    const contentType = (
      response.headers.get("content-type") || ""
    ).toLowerCase();

    const arrayBuffer = await response.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    if (!buffer.length) {
      console.error("La imagen llegó vacía:", url);

      return null;
    }

    /*
     * JPEG
     */

    if (
      contentType.includes("image/jpeg") ||
      contentType.includes("image/jpg")
    ) {
      return {
        buffer,
        type: "jpg",
      };
    }

    /*
     * PNG
     */

    if (contentType.includes("image/png")) {
      return {
        buffer,
        type: "png",
      };
    }

    /*
     * Detección por bytes
     */

    // JPEG
    if (
      buffer.length >= 3 &&
      buffer[0] === 0xff &&
      buffer[1] === 0xd8 &&
      buffer[2] === 0xff
    ) {
      return {
        buffer,
        type: "jpg",
      };
    }

    // PNG
    if (
      buffer.length >= 8 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    ) {
      return {
        buffer,
        type: "png",
      };
    }

    console.error("Formato de imagen no compatible:", contentType, url);

    return null;
  } catch (error) {
    console.error("Error descargando imagen:", url, error);

    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/*
 * ============================================================
 * PRECIO
 * ============================================================
 */

function formatPropertyPrice(property: Property): string {
  const operation = (property.operation || "").toLowerCase().trim();

  /*
   * ALQUILER
   */

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

  /*
   * VENTA
   */

  if (operation.includes("venta") || operation.includes("sale")) {
    if (property.price_usd) {
      return `USD ${Number(property.price_usd).toLocaleString("es-AR")}`;
    }

    if (property.price) {
      return `USD ${Number(property.price).toLocaleString("es-AR")}`;
    }
  }

  /*
   * FALLBACK
   */

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

/*
 * ============================================================
 * TEXTO
 * ============================================================
 */

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

/*
 * ============================================================
 * IMAGEN PROPORCIONAL
 * ============================================================
 *
 * No rota imágenes.
 */

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

/*
 * ============================================================
 * FEATURE CARD
 * ============================================================
 */

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
    borderWidth: 0.9,
  });

  /*
   * LABEL
   */

  drawText(
    page,
    label.toUpperCase(),
    x + 11,
    y + height - 17,
    font,
    7.5,
    COLORS.textSoft,
  );

  /*
   * VALOR
   *
   * Mucho más visible para impresión/vidriera.
   */

  drawText(page, value, x + 11, y + 13, boldFont, 15.5, COLORS.navy);
}
/*
 * ============================================================
 * GET
 * ============================================================
 */

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    /*
     * ========================================================
     * BUSCAR PROPIEDAD
     * ========================================================
     */

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

    const property: Property = result.rows[0];

    /*
     * ========================================================
     * CREAR PDF
     * ========================================================
     */

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    /*
     * ========================================================
     * MEDIA
     * ========================================================
     */

    const media = (property.media || [])
      .filter((item: Media) => {
        const type = (item.type || "").toLowerCase();

        return (
          type.includes("image") ||
          type.includes("jpg") ||
          type.includes("jpeg") ||
          type.includes("png") ||
          type.includes("webp")
        );
      })
      .sort((a: Media, b: Media) => {
        return a.position - b.position;
      });

    /*
     * Principal primero.
     * Máximo 4 imágenes.
     */

    const orderedMedia = [
      ...media.filter((item: Media) => item.is_main),
      ...media.filter((item: Media) => !item.is_main),
    ].slice(0, 4);

    /*
     * ========================================================
     * DESCARGAR IMÁGENES
     * ========================================================
     */

    const downloadedImages = await Promise.all(
      orderedMedia.map(async (item: Media) => {
        const imageData = await downloadImage(item.url);

        if (!imageData) {
          return null;
        }

        try {
          if (imageData.type === "png") {
            return await pdf.embedPng(imageData.buffer);
          }

          return await pdf.embedJpg(imageData.buffer);
        } catch (error) {
          console.error("Error insertando imagen en PDF:", item.url, error);

          return null;
        }
      }),
    );

    const images = downloadedImages.filter(Boolean);

    /*
     * ========================================================
     * LOGO
     * ========================================================
     */

    let logoImage: any = null;

    try {
      const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);

        logoImage = await pdf.embedJpg(logoBuffer);
      }
    } catch (error) {
      console.error("No se pudo cargar el logo:", error);

      logoImage = null;
    }

    /*
     * ========================================================
     * HEADER
     * ========================================================
     */

    const HEADER_HEIGHT = 43;

    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: COLORS.navy,
    });

    /*
     * ========================================================
     * LOGO
     * ========================================================
     */

    if (logoImage) {
      drawImageFit(
        page,
        logoImage,
        MARGIN,
        PAGE_HEIGHT - HEADER_HEIGHT + 6,
        34,
        31,
      );
    }

    const brandX = logoImage ? MARGIN + 43 : MARGIN;

    drawText(
      page,
      "MARISA PUENTES",
      brandX,
      PAGE_HEIGHT - 20,
      boldFont,
      11.5,
      COLORS.white,
    );

    drawText(
      page,
      "PROPIEDADES",
      brandX,
      PAGE_HEIGHT - 32,
      regularFont,
      6.5,
      COLORS.white,
    );

    /*
     * ========================================================
     * OPERACIÓN
     * ========================================================
     */

    const operationText = (property.operation || "PROPIEDAD").toUpperCase();

    const operationFontSize = 8;

    const operationWidth = boldFont.widthOfTextAtSize(
      operationText,
      operationFontSize,
    );

    const operationBoxWidth = operationWidth + 24;

    page.drawRectangle({
      x: PAGE_WIDTH - MARGIN - operationBoxWidth,
      y: PAGE_HEIGHT - 33,
      width: operationBoxWidth,
      height: 21,
      color: COLORS.white,
    });

    drawText(
      page,
      operationText,
      PAGE_WIDTH - MARGIN - operationBoxWidth + 12,
      PAGE_HEIGHT - 26,
      boldFont,
      operationFontSize,
      COLORS.navy,
    );

    /*
     * ========================================================
     * LAYOUT PRINCIPAL
     * ========================================================
     *
     * Se le da más espacio a la información.
     */

    const contentTop = PAGE_HEIGHT - HEADER_HEIGHT - 8;

    const galleryTop = contentTop;

    /*
     * ANTES:
     *
     * LEFT_WIDTH = 425
     * GAP = 20
     *
     * AHORA:
     *
     * Galería ligeramente más angosta.
     * Información derecha más grande.
     */

    const LEFT_WIDTH = 395;

    const GAP = 15;

    const RIGHT_X = MARGIN + LEFT_WIDTH + GAP;

    const RIGHT_WIDTH = PAGE_WIDTH - RIGHT_X - MARGIN;

    /*
     * ========================================================
     * GALERÍA
     * ========================================================
     */

    /*
     * Imagen principal:
     *
     * Un poco más baja para poder
     * aumentar visualmente las miniaturas.
     */

    const mainImageHeight = 255;

    const thumbnailGap = 7;

    const thumbnailWidth = (LEFT_WIDTH - thumbnailGap * 2) / 3;

    const thumbnailHeight = 78;

    const mainImageY = galleryTop - mainImageHeight;

    /*
     * ========================================================
     * IMAGEN PRINCIPAL
     * ========================================================
     */

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

    /*
     * ========================================================
     * MINIATURAS
     * ========================================================
     */

    const thumbnailsY = mainImageY - 7 - thumbnailHeight;

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
     * ========================================================
     * INFORMACIÓN DERECHA
     * ========================================================
     */

    /*
     * ========================================================
     * TÍTULO
     * ========================================================
     */

    /*
     * ========================================================
     * TÍTULO
     * ========================================================
     *
     * Lo bajamos bastante respecto del header azul.
     *
     * Esto es especialmente importante porque el tamaño
     * del título ahora es mayor.
     */

    const titleY = PAGE_HEIGHT - HEADER_HEIGHT - 30;

    const title = truncateText(property.title || "Propiedad", 48);

    drawText(page, title, RIGHT_X, titleY, boldFont, 24, COLORS.navyDark);

    /*
     * ========================================================
     * DIRECCIÓN
     * ========================================================
     */

    const addressParts = [
      property.address,
      property.city,
      property.province,
    ].filter(Boolean);

    const address = addressParts.join(", ");

    if (address) {
      drawText(
        page,
        truncateText(address, 68),
        RIGHT_X,
        titleY - 27,
        regularFont,
        10,
        COLORS.textSoft,
      );
    }
    /*
     * ========================================================
     * PRECIO
     * ========================================================
     */

    const priceBoxHeight = 70;

    /*
     * Más separación respecto del título
     * y de la dirección.
     */

    const priceBoxY = titleY - 105;

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
      8,
      COLORS.white,
    );

    const formattedPrice = formatPropertyPrice(property);

    drawText(
      page,
      formattedPrice,
      RIGHT_X + 14,
      priceBoxY + 18,
      boldFont,
      25,
      COLORS.white,
    );

    /*
     * ========================================================
     * CARACTERÍSTICAS
     * ========================================================
     */

    const cardsGap = 7;

    const cardsWidth = (RIGHT_WIDTH - cardsGap) / 2;

    const cardHeight = 55;

    const cardsTop = priceBoxY - 10;

    const row1Y = cardsTop - cardHeight;

    /*
     * AMBIENTES
     */

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

    /*
     * DORMITORIOS
     */

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

    /*
     * FILA 2
     */

    const row2Y = row1Y - 7 - cardHeight;

    /*
     * BAÑOS
     */

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

    /*
     * SUPERFICIE TOTAL
     */

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

    /*
     * FILA 3
     */

    const row3Y = row2Y - 7 - cardHeight;

    /*
     * SUPERFICIE CUBIERTA
     */

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

    /*
     * ESTADO
     */

    drawFeatureCard(
      page,
      RIGHT_X + cardsWidth + cardsGap,
      row3Y,
      cardsWidth,
      cardHeight,
      "Estado",
      property.condition ? truncateText(property.condition, 16) : "-",
      regularFont,
      boldFont,
    );

    /*
     * ========================================================
     * CONTACTO
     * ========================================================
     *
     * IMPORTANTE:
     *
     * Antes estaba pegado al fondo de la página,
     * generando un espacio enorme entre las tarjetas
     * y el contacto.
     *
     * Ahora queda inmediatamente debajo.
     */

    const contactHeight = 76;

    const contactY = row3Y - 8 - contactHeight;

    page.drawRectangle({
      x: RIGHT_X,
      y: contactY,
      width: RIGHT_WIDTH,
      height: contactHeight,
      color: COLORS.blueLight,
      borderColor: COLORS.border,
      borderWidth: 0.8,
    });

    /*
     * ========================================================
     * CONTACTO - TEXTO
     * ========================================================
     */

    const qrAreaWidth = 82;

    drawText(
      page,
      "CONTACTO",
      RIGHT_X + 12,
      contactY + contactHeight - 17,
      boldFont,
      7.5,
      COLORS.navy,
    );

    drawText(
      page,
      truncateText(CONTACT.name, 36),
      RIGHT_X + 12,
      contactY + 44,
      boldFont,
      9,
      COLORS.text,
    );

    drawText(
      page,
      CONTACT.phone,
      RIGHT_X + 12,
      contactY + 28,
      regularFont,
      8,
      COLORS.textSoft,
    );

    drawText(
      page,
      truncateText(CONTACT.email, 38),
      RIGHT_X + 12,
      contactY + 14,
      regularFont,
      6.8,
      COLORS.textSoft,
    );
    /*
     * ========================================================
     * QR
     * ========================================================
     */

    const propertyUrl = `${req.nextUrl.origin}/propiedades/${property.id}`;

    const qrBuffer = await QRCode.toBuffer(propertyUrl, {
      type: "png",
      width: 300,
      margin: 1,
    });

    const qrImage = await pdf.embedPng(qrBuffer);

    const qrSize = 60;

    const qrContainerX = RIGHT_X + RIGHT_WIDTH - qrAreaWidth;

    const qrX = qrContainerX + (qrAreaWidth - qrSize) / 2;

    const qrY = contactY + 12;

    /*
     * Fondo QR
     */

    page.drawRectangle({
      x: qrContainerX,
      y: contactY + 6,
      width: qrAreaWidth - 4,
      height: contactHeight - 12,
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
      qrContainerX + 6,
      contactY + 7,
      boldFont,
      5,
      COLORS.navy,
    );

    /*
     * ========================================================
     * CÓDIGO
     * ========================================================
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
     * ========================================================
     * GENERAR PDF
     * ========================================================
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
