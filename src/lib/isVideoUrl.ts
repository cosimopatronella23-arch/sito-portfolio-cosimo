/** Vero se l'URL punta a un file video (mp4/webm) invece che a un'immagine. */
export function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm)$/i.test(url.split("?")[0]);
}
