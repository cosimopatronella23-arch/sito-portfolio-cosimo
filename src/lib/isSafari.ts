/**
 * Vero solo su Safari (desktop e iOS) — Chrome/Edge riportano comunque
 * "Safari" nello user agent su Mac, quindi va escluso esplicitamente insieme
 * ad Android (le WebView Android includono "Safari" ma non sono WebKit puro
 * nello stesso senso). Usato solo per alleggerire effetti che Safari
 * ricompone molto peggio di Chrome (blur, mix-blend-mode, scroll via JS),
 * mai per nascondere funzionalità.
 */
export function isSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
