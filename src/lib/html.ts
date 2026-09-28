/**
 * Trasforma gli h1 del contenuto ricco in h2: ogni pagina ha già il suo h1
 * (il titolo), e un secondo h1 incollato nel testo confonde Google e gli
 * screen reader sulla gerarchia della pagina.
 */
export function demoteH1(html: string) {
  return html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}
