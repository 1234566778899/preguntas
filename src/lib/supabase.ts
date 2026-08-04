import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const key = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supportEmail =
  import.meta.env.PUBLIC_SUPPORT_EMAIL ?? "tu-correo@ejemplo.com";

export const isConfigured =
  Boolean(url) && Boolean(key) && !url.includes("TU-PROYECTO");

/** `null` mientras no esté configurado el .env, para poder enseñar instrucciones
 *  en vez de reventar sin explicación (igual que SetupView en la app). */
export const supabase: SupabaseClient | null = isConfigured
  ? createClient(url, key, {
      auth: { persistSession: false },
      realtime: { params: { eventsPerSecond: 10 } },
    })
  : null;
