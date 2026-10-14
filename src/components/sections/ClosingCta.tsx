import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { WhatsAppIcon } from "@/components/contact/WhatsAppIcon";
import { whatsappHref } from "@/lib/phone";

/**
 * Chiusura delle pagine interne (servizi, articoli): stessa voce della
 * sezione Contatti in homepage, in formato breve. WhatsApp solo se c'è un
 * numero nelle impostazioni; il modulo resta a un clic.
 */
export function ClosingCta({
  title,
  text,
  contactPhone,
}: {
  title: string;
  text: string;
  contactPhone?: string;
}) {
  return (
    <section className="theme-accent container-px py-20 sm:py-28">
      <div className="flex max-w-4xl flex-col gap-8">
        <h2 className="font-display text-[clamp(2.5rem,6vw,5rem)] leading-[0.95] font-bold tracking-[-0.045em] text-balance">
          <AnimatedText text={title} />
        </h2>
        <p className="max-w-xl text-lg leading-relaxed sm:text-xl">{text}</p>
        <div className="flex flex-col gap-3 sm:flex-row">
          {contactPhone ? (
            <Button href={whatsappHref(contactPhone)} size="lg" arrow className="justify-between">
              <WhatsAppIcon className="h-5 w-5 text-[#25D366]" />
              Scrivimi su WhatsApp
            </Button>
          ) : null}
          <Button
            href="/#contatti"
            size="lg"
            variant={contactPhone ? "secondary" : "primary"}
            arrow={!contactPhone}
            className="justify-between"
          >
            Compila il modulo
          </Button>
        </div>
      </div>
    </section>
  );
}
