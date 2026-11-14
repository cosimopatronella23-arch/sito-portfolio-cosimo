/**
 * Preparazione dei file prima del caricamento su Supabase, tutta nel
 * browser: nessun servizio esterno e nessuna libreria.
 *
 * - Foto JPG, PNG e WebP più grandi di 2560 px sul lato lungo vengono
 *   ridotte a 2560 px (resta nitida anche su schermi ad alta densità a
 *   tutta larghezza). Se la versione ridotta non pesa meno, si carica
 *   l'originale. GIF (possono essere animate), AVIF e SVG non si toccano.
 * - I video non vengono modificati: sopra i 5 MB compare solo un avviso.
 */
export const MAX_IMAGE_SIDE = 2560;
const VIDEO_WARNING_BYTES = 5 * 1024 * 1024;
const RESIZABLE = ["image/jpeg", "image/png", "image/webp"];

export async function downscaleImage(file: File): Promise<File> {
  if (!RESIZABLE.includes(file.type)) return file;
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const longSide = Math.max(bitmap.width, bitmap.height);
    if (longSide <= MAX_IMAGE_SIDE) {
      bitmap.close();
      return file;
    }
    const scale = MAX_IMAGE_SIDE / longSide;
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, 0.88),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name, {
      type: file.type,
      lastModified: Date.now(),
    });
  } catch {
    // Se il browser non riesce a leggere l'immagine, si carica com'è.
    return file;
  }
}

/** Avviso per i video pesanti (il caricamento prosegue comunque). */
export function videoWarning(file: File): string | null {
  if (!file.type.startsWith("video/") || file.size <= VIDEO_WARNING_BYTES) {
    return null;
  }
  const mb = (file.size / 1024 / 1024).toFixed(1).replace(".", ",");
  return `Video caricato, ma pesa ${mb} MB: sul telefono può partire lento. Meglio restare sotto i 5 MB (più corto, 720p o formato WebM).`;
}
