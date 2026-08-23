/**
 * Preparar una foto antes de subirla.
 *
 * Volver a dibujarla en un canvas no es solo para que pese menos: al re-codificar
 * se pierden todos los metadatos EXIF, y ahí es donde viajan el GPS, el modelo
 * del móvil y la hora exacta del disparo. En un juego anónimo eso no puede salir
 * del dispositivo.
 *
 * Lo que el canvas NO puede quitar es lo que se ve en la foto. Tu cocina, tu
 * funda o tu perro te delatan igual entre doce amigos; por eso la interfaz avisa
 * antes de adjuntar.
 */

/** Lado máximo. Una foto de iPhone son 4032px: reducirla a 1600 la deja en
 *  unos 300 KB, que es la diferencia entre caber en el plan gratuito o no. */
const MAX_SIDE = 1600;
const QUALITY = 0.82;

/** Por encima de esto ni lo intentamos: decodificarla tumbaría la pestaña. */
const MAX_INPUT = 25 * 1024 * 1024;

/** Lo que ofrece el selector de archivos. */
export const ACCEPTED = "image/*";

/** Mensajes ya escritos para enseñar tal cual; el resto de errores son bugs. */
export class ImageError extends Error {}

export async function prepareImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) {
    throw new ImageError("Eso no es una imagen.");
  }
  if (file.size > MAX_INPUT) {
    throw new ImageError("La foto es demasiado grande.");
  }

  const source = await decode(file);
  const ratio = Math.min(1, MAX_SIDE / Math.max(source.width, source.height));
  const width = Math.max(1, Math.round(source.width * ratio));
  const height = Math.max(1, Math.round(source.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageError("No se pudo preparar la foto.");
  ctx.drawImage(source, 0, 0, width, height);
  if (source instanceof ImageBitmap) source.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", QUALITY),
  );
  if (!blob) throw new ImageError("No se pudo preparar la foto.");
  return blob;
}

async function decode(file: File): Promise<ImageBitmap | HTMLImageElement> {
  try {
    // `from-image` respeta la orientación EXIF antes de tirarla a la basura:
    // si no, las fotos verticales del móvil salen tumbadas.
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await decodeWithTag(file);
  }
}

/** Safari no siempre acepta un File en `createImageBitmap`. Y el HEIC del
 *  iPhone solo lo abren los navegadores de Apple: en Windows o Android no hay
 *  decodificador y hay que decirlo, no fallar en silencio. */
function decodeWithTag(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(
        new ImageError("Ese formato no se puede abrir aquí. Prueba con un JPG o una captura."),
      );
    };
    img.src = url;
  });
}
