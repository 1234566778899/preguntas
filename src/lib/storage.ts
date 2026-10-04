import { supabase, answersBucket } from "./supabase";

/** Una hora de validez para las URLs firmadas: de sobra para una revelación,
 *  y si alguien reenvía el enlace por ahí caduca solo. */
const SIGNED_URL_TTL = 3600;

const cache = new Map<string, string>();

/** URL temporal para enseñar una foto. El bucket es privado, así que sin firma
 *  no se ve nada; se guardan en memoria para no volver a firmar cada vez que se
 *  pasa de pregunta en la revelación. La usan el juego y la pantalla grande. */
export async function signedImageUrl(path: string): Promise<string | null> {
  const cached = cache.get(path);
  if (cached) return cached;
  if (!supabase) return null;

  const { data, error } = await supabase.storage
    .from(answersBucket)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (error || !data) return null;

  cache.set(path, data.signedUrl);
  return data.signedUrl;
}

export function forgetImageUrls() {
  cache.clear();
}
