/** Ficha de la app en el App Store. Sin el `/au/` del enlace original: así
 *  Apple redirige a cada quien a la tienda de su país. */
export const appStoreUrl = "https://apps.apple.com/app/id6797777410";

/** El mismo id, suelto, para la meta `apple-itunes-app` de Safari en iOS. */
export const appStoreId = "6797777410";

/** Ficha de Google Play. Sin el `hl=es_PE` del enlace original: así Google
 *  enseña la ficha en el idioma de cada quien. */
export const playStoreUrl = "https://play.google.com/store/apps/details?id=com.anonimas.app";

/** Enlace para entrar directo a una sala. Es lo que lleva el QR de la pantalla
 *  grande y lo que se comparte al invitar: abre la web con el código ya puesto. */
export function joinUrl(code: string): string {
  return `${location.origin}/?sala=${encodeURIComponent(code)}`;
}
