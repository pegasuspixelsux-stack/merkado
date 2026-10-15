const MAX_FILE_BYTES = 15 * 1024 * 1024;

// Turns an uploaded image into a downscaled JPEG data URL small enough to keep in localStorage
// (roughly 150 to 400 KB each). A real backend would upload the original file to storage and keep
// only its URL; this is the local-development stand-in.
export async function fileToDataUrl(file: File, maxSide = 1920, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error(`${file.name} no es una imagen.`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`${file.name} pesa más de 15 MB.`);

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error(`No se pudo leer ${file.name} como imagen.`);
  }

  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Este navegador no puede procesar imágenes.");

  ctx.fillStyle = "#fff"; // JPEG has no transparency
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  return canvas.toDataURL("image/jpeg", quality);
}
