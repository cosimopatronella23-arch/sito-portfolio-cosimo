import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { buildMetadata } from "@/lib/seo";
import { CookiePreferencesButton } from "@/components/analytics/CookiePreferencesButton";

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "Cookie Policy",
    description:
      "Informativa sui cookie e le tecnologie simili utilizzate da questo sito.",
    path: "/cookie-policy",
  });
}

export default function CookiePolicyPage() {
  return (
    <div className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-14">
        <SectionHeading title="Cookie Policy." size="poster" as="h1" />

        <div className="prose-editor max-w-3xl text-foreground-muted">
          <p>
            Ultimo aggiornamento:{" "}
            {new Date().toLocaleDateString("it-IT", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <h2>Cosa sono i cookie</h2>
          <p>
            I cookie sono piccoli file di testo che i siti visitati inviano
            al browser dell&apos;utente, dove vengono memorizzati per essere
            poi ritrasmessi agli stessi siti alla visita successiva. Questo
            sito utilizza il minimo indispensabile, spiegato di seguito.
          </p>

          <h2>Cookie tecnici e memoria locale</h2>
          <p>
            Il sito utilizza il <strong>local storage</strong> del browser
            (una tecnologia simile ai cookie, ma non inviata al server) per
            ricordare la scelta espressa nel banner cookie, così da non
            richiederla ad ogni visita. Non richiede consenso perché
            strettamente necessaria al funzionamento del banner stesso.
          </p>

          <h2>Cookie analitici (Google Analytics)</h2>
          <p>
            Solo se l&apos;utente clicca &quot;Accetta&quot; nel banner
            cookie, il sito carica <strong>Google Analytics 4</strong>, un
            servizio di analisi statistica fornito da Google che utilizza
            cookie per raccogliere informazioni in forma aggregata e con
            IP anonimizzato su come viene utilizzato il sito (pagine
            visitate, provenienza del traffico, dispositivo usato). Questi
            dati aiutano a capire come migliorare il sito e non vengono
            utilizzati per identificare singoli utenti. Se l&apos;utente
            clicca &quot;Rifiuta&quot;, oppure non compie alcuna scelta,
            questi cookie non vengono mai installati.
          </p>
          <p>
            Maggiori informazioni sul trattamento dati di Google sono
            disponibili nella{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
            >
              informativa privacy di Google
            </a>
            .
          </p>

          <h2>Come cambiare la tua scelta</h2>
          <p>
            Puoi modificare in qualsiasi momento la preferenza espressa sui
            cookie analitici con il pulsante qui sotto: la scelta salvata
            verrà cancellata e il banner ricomparirà alla prossima visita.
          </p>
          <div className="not-prose py-2">
            <CookiePreferencesButton />
          </div>

          <h2>Come disabilitare i cookie dal browser</h2>
          <p>
            Oltre a gestire il consenso direttamente su questo sito, è
            possibile bloccare o eliminare i cookie tramite le impostazioni
            del proprio browser. Le procedure specifiche variano da browser
            a browser: Chrome, Firefox, Safari ed Edge mettono a
            disposizione guide dedicate nelle rispettive pagine di
            supporto.
          </p>
        </div>
      </div>
    </div>
  );
}
