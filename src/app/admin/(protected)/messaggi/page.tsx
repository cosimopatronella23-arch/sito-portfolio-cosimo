import Link from "next/link";
import clsx from "clsx";
import { getMessagesAdmin } from "@/lib/data/messages";
import {
  deleteMessageForever,
  restoreMessage,
  setMessageRead,
  trashMessage,
} from "@/lib/actions/messages";
import { MessageItem } from "@/components/admin/MessageItem";
import { DeleteButton } from "@/components/admin/DeleteButton";

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Rome",
});

function replyHref(email: string, name: string) {
  const subject = encodeURIComponent("Re: il tuo messaggio dal sito");
  const body = encodeURIComponent(`Ciao ${name},\n\n`);
  return `mailto:${email}?subject=${subject}&body=${body}`;
}

const actionButton =
  "min-h-10 border border-border-strong px-3 text-sm transition-colors hover:border-accent hover:text-accent";

export default async function AdminMessagesPage(
  props: PageProps<"/admin/messaggi">,
) {
  const params = await props.searchParams;
  const box = params.box === "cestino" ? "trash" : "inbox";
  const { available, messages } = await getMessagesAdmin(box);
  const unread = messages.filter((m) => !m.read_at).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Messaggi
        </h1>
        <p className="max-w-2xl text-sm text-foreground-muted">
          Tutto quello che arriva dal modulo contatti, anche se l&apos;email di
          avviso non ti raggiunge. I messaggi si cancellano da soli dopo 12
          mesi, come indicato nella privacy policy.
        </p>
      </div>

      {!available ? (
        <p className="border border-border px-5 py-10 text-sm text-foreground-muted">
          La sezione Messaggi non è ancora attiva sul database. Finché non lo è,
          il modulo contatti funziona come prima: i messaggi arrivano solo per
          email.
        </p>
      ) : (
        <>
          <div
            role="group"
            aria-label="Cartelle"
            className="flex flex-wrap gap-2"
          >
            {(
              [
                ["inbox", "Ricevuti", "/admin/messaggi"],
                ["trash", "Cestino", "/admin/messaggi?box=cestino"],
              ] as const
            ).map(([key, label, href]) => (
              <Link
                key={key}
                href={href}
                aria-current={box === key ? "page" : undefined}
                className={clsx(
                  "flex min-h-11 items-center border px-4 text-sm font-medium transition-colors",
                  box === key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border-strong text-foreground-muted hover:border-foreground hover:text-foreground",
                )}
              >
                {label}
                {key === "inbox" && box === "inbox" && unread
                  ? ` (${unread} da leggere)`
                  : ""}
              </Link>
            ))}
          </div>

          {messages.length === 0 ? (
            <p className="border border-border px-5 py-10 text-center text-sm text-foreground-muted">
              {box === "trash"
                ? "Il cestino dei messaggi è vuoto."
                : "Nessun messaggio per ora. Quando qualcuno compila il modulo contatti, lo trovi qui."}
            </p>
          ) : (
            <div className="flex flex-col border border-border-strong">
              {messages.map((m) => (
                <MessageItem
                  key={`${m.id}-${m.read_at ? "r" : "u"}`}
                  id={m.id}
                  unread={box === "inbox" && !m.read_at}
                  header={
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="font-medium">{m.name}</span>
                        <span className="text-xs text-foreground-muted">
                          {dateFormat.format(new Date(m.created_at))}
                        </span>
                      </div>
                      <span className="line-clamp-1 text-sm text-foreground-muted">
                        {m.message}
                      </span>
                    </div>
                  }
                >
                  <p className="text-sm text-foreground-muted">
                    <a
                      href={`mailto:${m.email}`}
                      className="font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:text-accent"
                    >
                      {m.email}
                    </a>
                  </p>
                  <p className="max-w-3xl leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                  {!m.email_sent ? (
                    <p className="text-xs text-foreground-muted">
                      L&apos;email di avviso per questo messaggio non è partita:
                      lo trovi solo qui.
                    </p>
                  ) : null}
                  <div className="flex flex-wrap items-center gap-3">
                    {box === "inbox" ? (
                      <>
                        <a
                          href={replyHref(m.email, m.name)}
                          className="flex min-h-10 items-center bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent hover:text-ink"
                        >
                          Rispondi via email
                        </a>
                        <form action={setMessageRead}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="read" value="0" />
                          <button type="submit" className={actionButton}>
                            Segna da leggere
                          </button>
                        </form>
                        <form action={trashMessage}>
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className={actionButton}>
                            Sposta nel cestino
                          </button>
                        </form>
                      </>
                    ) : (
                      <>
                        <form action={restoreMessage}>
                          <input type="hidden" name="id" value={m.id} />
                          <button type="submit" className={actionButton}>
                            Ripristina
                          </button>
                        </form>
                        <form action={deleteMessageForever}>
                          <input type="hidden" name="id" value={m.id} />
                          <DeleteButton
                            label="Elimina per sempre"
                            confirmText="Eliminare per sempre questo messaggio? Non si potrà più recuperare."
                          />
                        </form>
                      </>
                    )}
                  </div>
                </MessageItem>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
