/**
 * Sistema la gerarchia dei titoli nel contenuto ricco (articoli, blocchi
 * progetto). La pagina ha già il suo h1 (il titolo), quindi:
 * - un h1 incollato nel testo diventa h2;
 * - se il testo non ha nessun h2 ma usa h3 (succede incollando da altre
 *   fonti), gli h3 diventano h2 e gli h4 diventano h3, così i titoletti
 *   non saltano un livello e prendono lo stile dei titoli di sezione.
 */
export function normalizeHeadings(html: string) {
  let out = html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
  if (!/<h2[\s>]/i.test(out) && /<h3[\s>]/i.test(out)) {
    out = out
      .replace(/<(\/?)h3(\s|>)/gi, "<$1h2$2")
      .replace(/<(\/?)h4(\s|>)/gi, "<$1h3$2");
  }
  return out;
}
