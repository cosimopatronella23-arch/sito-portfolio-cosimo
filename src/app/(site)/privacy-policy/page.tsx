import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { getSiteSettings } from "@/lib/data/settings";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Privacy Policy",
    description:
      "Informativa sul trattamento dei dati personali raccolti da questo sito, ai sensi del Regolamento UE 2016/679 (GDPR).",
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings();

  return (
    <div className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-14">
        <SectionHeading title="Privacy Policy." size="poster" as="h1" />

        <div className="prose-editor max-w-3xl text-foreground-muted">
          <p>
            Ultimo aggiornamento:{" "}
            {new Date().toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h2>Titolare del trattamento</h2>
          <p>
            Il titolare del trattamento dei dati raccolti tramite questo
            sito è Cosimo Patronella, contattabile all&apos;indirizzo email{" "}
            <a href={`mailto:${settings.contact_email}`}>
              {settings.contact_email}
            </a>
            .
          </p>

          <h2>Quali dati raccogliamo</h2>
          <p>
            Questo sito raccoglie solo i dati che l&apos;utente sceglie di
            fornire volontariamente e alcuni dati tecnici necessari al
            funzionamento del servizio:
          </p>
          <ul>
            <li>
              <strong>Dati inviati tramite il modulo di contatto:</strong>{" "}
              nome, indirizzo email e contenuto del messaggio, raccolti solo
              quando l&apos;utente compila e invia volontariamente il modulo
              presente sul sito.
            </li>
            <li>
              <strong>Dati di navigazione:</strong> il servizio di hosting
              (Vercel) raccoglie automaticamente alcuni dati tecnici
              standard (come indirizzo IP e user agent) necessari al
              funzionamento e alla sicurezza del sito, per il tempo
              strettamente necessario a queste finalità.
            </li>
            <li>
              <strong>Dati statistici anonimi:</strong> solo se l&apos;utente
              presta consenso esplicito tramite il banner cookie, viene
              utilizzato Google Analytics per raccogliere statistiche
              aggregate e anonimizzate sull&apos;uso del sito. Maggiori
              dettagli nella{" "}
              <a href="/cookie-policy">Cookie Policy</a>.
            </li>
          </ul>

          <h2>Finalità e base giuridica del trattamento</h2>
          <p>
            I dati inviati tramite il modulo di contatto sono trattati al
            solo scopo di rispondere alle richieste ricevute, sulla base del
            consenso implicito nell&apos;invio volontario del messaggio
            (art. 6.1.a GDPR). I dati tecnici di navigazione sono trattati
            per garantire la sicurezza e il corretto funzionamento del sito,
            sulla base del legittimo interesse del titolare (art. 6.1.f
            GDPR). I dati statistici sono trattati solo previo consenso
            esplicito (art. 6.1.a GDPR).
          </p>

          <h2>Come vengono trattati i dati</h2>
          <p>
            I messaggi inviati tramite il modulo di contatto vengono
            recapitati alla casella email del titolare attraverso il
            servizio Resend, che agisce in qualità di responsabile del
            trattamento per l&apos;invio tecnico dell&apos;email. Il sito è
            ospitato su Vercel e i contenuti sono gestiti tramite Supabase;
            entrambi i fornitori possono trattare dati tecnici come
            responsabili del trattamento, nel rispetto del GDPR. Nessun dato
            viene venduto o ceduto a terzi per finalità di marketing.
          </p>

          <h2>Periodo di conservazione</h2>
          <p>
            I dati inviati tramite il modulo di contatto sono conservati per
            il tempo necessario a gestire la richiesta e, successivamente,
            per il tempo previsto dagli obblighi di legge applicabili. I
            dati tecnici di navigazione sono conservati per il periodo
            minimo necessario alle finalità di sicurezza, secondo le
            policy del fornitore di hosting.
          </p>

          <h2>Diritti dell&apos;interessato</h2>
          <p>
            In qualsiasi momento è possibile esercitare, nei confronti del
            titolare del trattamento, i diritti previsti dagli articoli
            15-22 del GDPR: accesso ai dati, rettifica, cancellazione,
            limitazione del trattamento, portabilità dei dati e opposizione
            al trattamento. Per esercitare questi diritti è sufficiente
            scrivere a{" "}
            <a href={`mailto:${settings.contact_email}`}>
              {settings.contact_email}
            </a>
            . È inoltre possibile proporre reclamo all&apos;Autorità
            Garante per la protezione dei dati personali (
            <a
              href="https://www.garanteprivacy.it"
              target="_blank"
              rel="noopener noreferrer"
            >
              www.garanteprivacy.it
            </a>
            ).
          </p>

          <h2>Modifiche a questa informativa</h2>
          <p>
            Questa informativa può essere aggiornata nel tempo, ad esempio a
            seguito di modifiche normative o di funzionalità del sito. La
            versione sempre aggiornata è disponibile a questo indirizzo.
          </p>
        </div>
      </div>
    </div>
  );
}
