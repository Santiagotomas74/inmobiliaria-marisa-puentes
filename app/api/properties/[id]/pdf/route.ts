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
  title: string | null;
  price: number | null;
  price_ars: number | null;
  currency: string | null;
  currency_ars: string | null;
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
  garage: boolean | null;
  condition: string | null;
  media: Media[] | null;
};

type ImageData = {
  bytes: Uint8Array;
  type: "jpg" | "png";
};

/*
|--------------------------------------------------------------------------
| TAMAÑO
|--------------------------------------------------------------------------
|
| 270 x 195 mm
| Apaisado
|
*/

const PAGE_WIDTH = (270 * 72) / 25.4;
const PAGE_HEIGHT = (195 * 72) / 25.4;

const MARGIN = 18;

/*
|--------------------------------------------------------------------------
| COLORES
|--------------------------------------------------------------------------
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
|--------------------------------------------------------------------------
| CONTACTO
|--------------------------------------------------------------------------
*/

const CONTACT = {
  name: "MARISA PUENTES PROPIEDADES",
  phone: "11 3700-1152",
  email: "marisapuentespropiedades@yahoo.com",
};

/*
|--------------------------------------------------------------------------
| DESCARGAR IMAGEN
|--------------------------------------------------------------------------
*/

async function downloadImage(url: string): Promise<ImageData | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error("No se pudo descargar:", url);
      return null;
    }

    const contentType = (
      response.headers.get("content-type") || ""
    ).toLowerCase();

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

    console.warn("Formato no soportado:", contentType, url);

    return null;
  } catch (error) {
    console.error("Error descargando imagen:", error);

    return null;
  }
}

/*
|--------------------------------------------------------------------------
| PRECIO
|--------------------------------------------------------------------------
*/

function formatPropertyPrice(property: Property) {
  const operation = (property.operation || "").toLowerCase().trim();

  const isRental =
    operation.includes("alquiler") ||
    operation.includes("alquilar") ||
    operation.includes("rent");

  /*
   * ALQUILER
   * Siempre mostramos el precio en pesos argentinos.
   */
  if (isRental) {
    if (property.price_ars === null || property.price_ars === undefined) {
      return "Consultar";
    }

    const formatted = new Intl.NumberFormat("es-AR").format(property.price_ars);

    return `$ ${formatted}`;
  }

  /*
   * VENTA
   * Siempre mostramos el precio en dólares.
   */
  if (property.price === null || property.price === undefined) {
    return "Consultar";
  }

  const formatted = new Intl.NumberFormat("es-AR").format(property.price);

  return `U$S ${formatted}`;
}

/*
|--------------------------------------------------------------------------
| TEXTO
|--------------------------------------------------------------------------
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
    size,
    font,
    color,
  });
}

/*
|--------------------------------------------------------------------------
| TEXTO TRUNCADO
|--------------------------------------------------------------------------
*/

function truncateText(text: string, maxChars: number) {
  if (text.length <= maxChars) {
    return text;
  }

  return text.substring(0, maxChars - 3) + "...";
}

/*
|--------------------------------------------------------------------------
| IMAGEN CONTAIN
|--------------------------------------------------------------------------
*/

function drawImageFit(
  page: any,
  image: any,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  // Fondo
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: COLORS.blueLighter,
  });

  const imageRatio = image.width / image.height;

  const boxRatio = width / height;

  let drawWidth: number;
  let drawHeight: number;

  if (imageRatio > boxRatio) {
    drawWidth = width;
    drawHeight = image.height * (width / image.width);
  } else {
    drawHeight = height;
    drawWidth = image.width * (height / image.height);
  }

  const offsetX = (width - drawWidth) / 2;

  const offsetY = (height - drawHeight) / 2;

  page.drawImage(image, {
    x: x + offsetX,
    y: y + offsetY,
    width: drawWidth,
    height: drawHeight,
  });
}

/*
|--------------------------------------------------------------------------
| TARJETA DE CARACTERÍSTICA
|--------------------------------------------------------------------------
*/

function drawFeatureCard(
  page: any,
  label: string,
  value: string,
  x: number,
  y: number,
  width: number,
  height: number,
  regularFont: any,
  boldFont: any,
) {
  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: COLORS.white,
    borderColor: COLORS.border,
    borderWidth: 0.8,
  });

  drawText(
    page,
    label.toUpperCase(),
    x + 10,
    y + height - 17,
    boldFont,
    6.5,
    COLORS.textSoft,
  );

  drawText(page, value, x + 10, y + 10, boldFont, 11, COLORS.text);
}

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
*/

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    /*
    |--------------------------------------------------------------------------
    | PROPIEDAD
    |--------------------------------------------------------------------------
    */

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
        {
          error: "Propiedad no encontrada",
        },
        {
          status: 404,
        },
      );
    }

    const property = rows[0] as Property;

    /*
    |--------------------------------------------------------------------------
    | PDF
    |--------------------------------------------------------------------------
    */

    const pdf = await PDFDocument.create();

    const regularFont = await pdf.embedFont(StandardFonts.Helvetica);

    const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

    const page = pdf.addPage([PAGE_WIDTH, PAGE_HEIGHT]);

    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
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

    /*
    |--------------------------------------------------------------------------
    | 3 IMÁGENES
    |--------------------------------------------------------------------------
    */

    const orderedMedia = [
      ...media.filter((item) => item.is_main),
      ...media.filter((item) => !item.is_main),
    ].slice(0, 3);

    const images: any[] = [];

    for (const item of orderedMedia) {
      const downloaded = await downloadImage(item.url);

      if (!downloaded) {
        continue;
      }

      try {
        const embedded =
          downloaded.type === "png"
            ? await pdf.embedPng(downloaded.bytes)
            : await pdf.embedJpg(downloaded.bytes);

        images.push(embedded);
      } catch (error) {
        console.error("Error insertando imagen:", item.url, error);
      }
    }

    /*
    |--------------------------------------------------------------------------
    | LOGO
    |--------------------------------------------------------------------------
    */

    let logoImage: any = null;

    try {
      const logoPath = path.join(process.cwd(), "public", "logo.jpeg");

      if (fs.existsSync(logoPath)) {
        logoImage = await pdf.embedJpg(fs.readFileSync(logoPath));
      }
    } catch (error) {
      console.warn("No se pudo cargar logo.jpeg");
    }

    /*
    |--------------------------------------------------------------------------
    | HEADER
    |--------------------------------------------------------------------------
    */

    const HEADER_HEIGHT = 46;

    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - HEADER_HEIGHT,
      width: PAGE_WIDTH,
      height: HEADER_HEIGHT,
      color: COLORS.navy,
    });

    /*
    |--------------------------------------------------------------------------
    | LOGO / MARCA
    |--------------------------------------------------------------------------
    */

    if (logoImage) {
      const logoHeight = 28;
      const logoWidth = (logoImage.width / logoImage.height) * logoHeight;

      page.drawImage(logoImage, {
        x: MARGIN,
        y: PAGE_HEIGHT - HEADER_HEIGHT + 9,
        width: logoWidth,
        height: logoHeight,
      });
    } else {
      drawText(
        page,
        "MARISA PUENTES",
        MARGIN,
        PAGE_HEIGHT - 21,
        boldFont,
        14,
        COLORS.white,
      );

      drawText(
        page,
        "PROPIEDADES",
        MARGIN,
        PAGE_HEIGHT - 34,
        regularFont,
        7,
        rgb(0.82, 0.88, 0.94),
      );
    }

    /*
    |--------------------------------------------------------------------------
    | OPERACIÓN
    |--------------------------------------------------------------------------
    */
    const operationRaw = (property.operation || "VENTA").toLowerCase().trim();

    const operation = operationRaw.includes("alquiler") ? "ALQUILER" : "VENTA";
    const operationWidth = boldFont.widthOfTextAtSize(operation, 10);

    page.drawRectangle({
      x: PAGE_WIDTH - MARGIN - operationWidth - 22,
      y: PAGE_HEIGHT - HEADER_HEIGHT + 12,
      width: operationWidth + 22,
      height: 22,
      color: COLORS.white,
    });

    drawText(
      page,
      operation,
      PAGE_WIDTH - MARGIN - operationWidth - 11,
      PAGE_HEIGHT - HEADER_HEIGHT + 19,
      boldFont,
      10,
      COLORS.navy,
    );

    /*
    |--------------------------------------------------------------------------
    | ZONA PRINCIPAL
    |--------------------------------------------------------------------------
    */

    const contentTop = PAGE_HEIGHT - HEADER_HEIGHT - 12;

    /*
    |--------------------------------------------------------------------------
    | COLUMNAS
    |--------------------------------------------------------------------------
    */

    const LEFT_WIDTH = 425;
    const GAP = 20;

    const RIGHT_X = MARGIN + LEFT_WIDTH + GAP;

    const RIGHT_WIDTH = PAGE_WIDTH - RIGHT_X - MARGIN;

    /*
    |--------------------------------------------------------------------------
    | FOTOS
    |--------------------------------------------------------------------------
    */

    const galleryTop = contentTop;

    const mainImageHeight = 290;

    const thumbnailsY = MARGIN + 42;

    const thumbnailHeight = 82;

    /*
    |--------------------------------------------------------------------------
    | FOTO PRINCIPAL
    |--------------------------------------------------------------------------
    */

    if (images[0]) {
      drawImageFit(
        page,
        images[0],
        MARGIN,
        thumbnailsY + thumbnailHeight + 8,
        LEFT_WIDTH,
        mainImageHeight,
      );
    } else {
      page.drawRectangle({
        x: MARGIN,
        y: thumbnailsY + thumbnailHeight + 8,
        width: LEFT_WIDTH,
        height: mainImageHeight,
        color: COLORS.blueLighter,
      });

      drawText(
        page,
        "SIN IMAGEN",
        MARGIN + LEFT_WIDTH / 2 - 30,
        thumbnailsY + thumbnailHeight + 8 + mainImageHeight / 2,
        boldFont,
        9,
        COLORS.textSoft,
      );
    }

    /*
    |--------------------------------------------------------------------------
    | MINIATURAS
    |--------------------------------------------------------------------------
    */

    const thumbnailGap = 7;

    const thumbnailWidth = (LEFT_WIDTH - thumbnailGap * 2) / 3;

    for (let i = 0; i < 2; i++) {
      const image = images[i + 1];

      const x = MARGIN + i * (thumbnailWidth + thumbnailGap);

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
        page.drawRectangle({
          x,
          y: thumbnailsY,
          width: thumbnailWidth,
          height: thumbnailHeight,
          color: COLORS.blueLighter,
        });
      }
    }

    /*
    |--------------------------------------------------------------------------
    | QR - CUARTO BLOQUE
    |--------------------------------------------------------------------------
    */

    const qrX = MARGIN + 2 * (thumbnailWidth + thumbnailGap);

    page.drawRectangle({
      x: qrX,
      y: thumbnailsY,
      width: thumbnailWidth,
      height: thumbnailHeight,
      color: COLORS.navy,
    });

    const propertyUrl = `${req.nextUrl.origin}/propiedades/${property.id}`;

    const qrBuffer = await QRCode.toBuffer(propertyUrl, {
      type: "png",
      width: 300,
      margin: 1,
    });

    const qrImage = await pdf.embedPng(qrBuffer);

    const qrSize = 57;

    page.drawImage(qrImage, {
      x: qrX + (thumbnailWidth - qrSize) / 2,
      y: thumbnailsY + 17,
      width: qrSize,
      height: qrSize,
    });

    drawText(
      page,
      "VER PUBLICACIÓN",
      qrX + thumbnailWidth / 2 - 34,
      thumbnailsY + 7,
      boldFont,
      5.5,
      COLORS.white,
    );

    /*
    |--------------------------------------------------------------------------
    | TÍTULO
    |--------------------------------------------------------------------------
    */

    const title = truncateText(property.title || "Propiedad", 34);

    drawText(page, title, RIGHT_X, galleryTop - 2, boldFont, 17, COLORS.text);

    /*
    |--------------------------------------------------------------------------
    | UBICACIÓN
    |--------------------------------------------------------------------------
    */

    const addressParts = [
      property.address,
      property.city,
      property.province,
    ].filter(Boolean);

    const address = truncateText(addressParts.join(", "), 48);

    drawText(
      page,
      address,
      RIGHT_X,
      galleryTop - 22,
      regularFont,
      7.5,
      COLORS.textSoft,
    );

    /*
    |--------------------------------------------------------------------------
    | PRECIO
    |--------------------------------------------------------------------------
    */

    const priceBoxY = galleryTop - 105;

    page.drawRectangle({
      x: RIGHT_X,
      y: priceBoxY,
      width: RIGHT_WIDTH,
      height: 65,
      color: COLORS.blueLight,
    });

    drawText(
      page,
      "PRECIO",
      RIGHT_X + 13,
      priceBoxY + 47,
      boldFont,
      7,
      COLORS.navy,
    );

    const price = formatPropertyPrice(property);

    drawText(
      page,
      price,
      RIGHT_X + 13,
      priceBoxY + 22,
      boldFont,
      23,
      COLORS.navy,
    );

    /*
    |--------------------------------------------------------------------------
    | CARACTERÍSTICAS
    |--------------------------------------------------------------------------
    */

    const cardsTop = priceBoxY - 12;

    const cardGap = 7;

    const cardWidth = (RIGHT_WIDTH - cardGap) / 2;

    const cardHeight = 53;

    let cardY = cardsTop - cardHeight;

    /*
    | SUPERFICIE
    */

    const rawSurface = property.surface_covered ?? property.surface_total;
    const surface =
      rawSurface !== null && rawSurface !== undefined
        ? Number(rawSurface)
        : null;

    drawFeatureCard(
      page,
      "Superficie",
      surface !== null ? `${surface} m²` : "-",
      RIGHT_X,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    | AMBIENTES
    */

    drawFeatureCard(
      page,
      "Ambientes",
      property.rooms !== null && property.rooms !== undefined
        ? String(property.rooms)
        : "-",
      RIGHT_X + cardWidth + cardGap,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    | DORMITORIOS
    */

    cardY -= cardHeight + cardGap;

    drawFeatureCard(
      page,
      "Dormitorios",
      property.bedrooms !== null && property.bedrooms !== undefined
        ? String(property.bedrooms)
        : "-",
      RIGHT_X,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    | BAÑOS
    */

    drawFeatureCard(
      page,
      "Baños",
      property.bathrooms !== null && property.bathrooms !== undefined
        ? String(property.bathrooms)
        : "-",
      RIGHT_X + cardWidth + cardGap,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    | COCHERA
    */

    cardY -= cardHeight + cardGap;

    drawFeatureCard(
      page,
      "Cochera",
      property.garage ? "Sí" : "No",
      RIGHT_X,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    | ESTADO
    */

    const rawCondition = property.condition ? property.condition.trim() : "";
    const formattedCondition = rawCondition
      ? rawCondition.charAt(0).toUpperCase() +
        rawCondition.slice(1).toLowerCase()
      : "-";

    drawFeatureCard(
      page,
      "Estado",
      formattedCondition,
      RIGHT_X + cardWidth + cardGap,
      cardY,
      cardWidth,
      cardHeight,
      regularFont,
      boldFont,
    );

    /*
    |--------------------------------------------------------------------------
    | CONTACTO
    |--------------------------------------------------------------------------
    */

    const contactHeight = 72;

    const contactY = MARGIN;

    page.drawRectangle({
      x: RIGHT_X,
      y: contactY,
      width: RIGHT_WIDTH,
      height: contactHeight,
      color: COLORS.navy,
    });

    drawText(
      page,
      "CONTACTO",
      RIGHT_X + 13,
      contactY + 54,
      boldFont,
      6.5,
      rgb(0.75, 0.84, 0.92),
    );

    drawText(
      page,
      CONTACT.name,
      RIGHT_X + 13,
      contactY + 37,
      boldFont,
      9,
      COLORS.white,
    );

    drawText(
      page,
      CONTACT.phone,
      RIGHT_X + 13,
      contactY + 21,
      regularFont,
      8,
      COLORS.white,
    );

    drawText(
      page,
      CONTACT.email,
      RIGHT_X + 13,
      contactY + 8,
      regularFont,
      6.2,
      rgb(0.82, 0.88, 0.94),
    );

    /*
    |--------------------------------------------------------------------------
    | CÓDIGO
    |--------------------------------------------------------------------------
    */

    const code = `Código de propiedad: ${property.id}`;

    const codeWidth = regularFont.widthOfTextAtSize(code, 5.5);

    drawText(
      page,
      code,
      RIGHT_X + RIGHT_WIDTH - codeWidth - 10,
      contactY + 8,
      regularFont,
      5.5,
      rgb(0.7, 0.8, 0.9),
    );

    /*
    |--------------------------------------------------------------------------
    | GENERAR
    |--------------------------------------------------------------------------
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
