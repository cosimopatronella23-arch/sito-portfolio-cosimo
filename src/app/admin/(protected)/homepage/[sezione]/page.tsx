import Link from "next/link";
import { notFound } from "next/navigation";
import { getSiteSettings } from "@/lib/data/settings";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { HOME_DEFAULTS, THEME_LABELS, processSteps, sectionTheme } from "@/lib/homeDefaults";
import { HOME_SECTIONS_ADMIN, type HomeSectionSlug } from "@/lib/homeSectionsAdmin";
import { HomeCustomizer } from "@/components/admin/home/HomeCustomizer";
import { HeroSlidesEditor } from "@/components/admin/HeroSlidesEditor";
import { ServicesEditor } from "@/components/admin/ServicesEditor";
import { ProcessStepsEditor } from "@/components/admin/ProcessStepsEditor";
import { HomepageBlocksEditor } from "@/components/admin/HomepageBlocksEditor";
import { inputClass } from "@/components/admin/settings/FieldRow";
import type { HomeSectionKey } from "@/lib/types";

function Field({
  label,
  help,
  children,
}: {
  label: string;
  help?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold">{label}</span>
      {children}
      {help ? <span className="text-xs leading-relaxed text-foreground-muted">{help}</span> : null}
    </label>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-border-strong bg-background p-4 text-sm leading-relaxed text-foreground-muted">
      {children}
    </p>
  );
}

export default async function HomeSectionEditor(
  props: PageProps<"/admin/homepage/[sezione]">,
) {
  const { sezione } = await props.params;
  const meta = HOME_SECTIONS_ADMIN[sezione as HomeSectionSlug];
  if (!meta) notFound();

  const settings = await getSiteSettings();
  const c = settings.home_content;
  const themeKey = meta.key === "blocks" ? null : (meta.key as HomeSectionKey);

  let body: React.ReactNode = null;
  switch (meta.key) {
    case "hero": {
      const projects = (await getAllProjectsAdmin())
        .filter((p) => p.status === "published")
        .map((p) => ({ slug: p.slug, title: p.title }));
      body = (
        <>
          <Field label="Titolo" help="Con Invio vai a capo, su telefono e tablet.">
            <textarea name="hero_title_main" defaultValue={c.hero_title_main} rows={2} className={inputClass} />
          </Field>
          <Field label="Parte colorata" help="Esce in lavanda, subito dopo il titolo.">
            <input name="hero_title_accent" defaultValue={c.hero_title_accent} className={inputClass} />
          </Field>
          <Field label="Testo del pulsante" help="Il pulsante porta al modulo di contatto.">
            <input name="cta_primary" defaultValue={c.cta_primary} className={inputClass} />
          </Field>
          <HeroSlidesEditor name="hero_slides" defaultValue={c.hero_slides ?? []} projects={projects} />
          <details className="border-t border-border pt-4">
            <summary className="min-h-11 cursor-pointer text-sm font-semibold">
              Solo per Google (non si vede sulla pagina)
            </summary>
            <div className="mt-3 flex flex-col gap-4">
              <Field label="Chi sei e dove lavori" help="Lo leggono Google e i lettori di schermo.">
                <input name="hero_eyebrow" defaultValue={c.hero_eyebrow ?? ""} placeholder={HOME_DEFAULTS.hero_eyebrow} className={inputClass} />
              </Field>
              <Field label="Descrizione">
                <textarea name="hero_subtitle" defaultValue={c.hero_subtitle} rows={3} className={inputClass} />
              </Field>
            </div>
          </details>
        </>
      );
      break;
    }
    case "marquee":
      body = (
        <Note>
          La banda mostra i nomi dei servizi in movimento. Per cambiarli apri{" "}
          <Link href="/admin/homepage/servizi" className="text-foreground underline underline-offset-4">
            la sezione Servizi
          </Link>
          .
        </Note>
      );
      break;
    case "projects":
      body = (
        <>
          <Field label="Titolo" help={`Vuoto = "${HOME_DEFAULTS.projects_title}"`}>
            <input name="projects_title" defaultValue={c.projects_title ?? ""} placeholder={HOME_DEFAULTS.projects_title} className={inputClass} />
          </Field>
          <Note>
            Qui compaiono i progetti segnati &quot;In evidenza&quot;, nell&apos;ordine scelto in{" "}
            <Link href="/admin/progetti" className="text-foreground underline underline-offset-4">Progetti</Link>.
          </Note>
        </>
      );
      break;
    case "services":
      body = (
        <>
          <Field label="Titolo" help="È anche il titolo della pagina /servizi.">
            <input name="services_title" defaultValue={c.services_title} className={inputClass} />
          </Field>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Servizi in evidenza</span>
            <ServicesEditor name="services" defaultValue={c.services} />
          </div>
        </>
      );
      break;
    case "process":
      body = (
        <>
          <Field label="Titolo">
            <input name="process_title" defaultValue={c.process_title ?? ""} placeholder={HOME_DEFAULTS.process_title} className={inputClass} />
          </Field>
          <Field label="Sottotitolo">
            <input name="process_subtitle" defaultValue={c.process_subtitle ?? ""} placeholder={HOME_DEFAULTS.process_subtitle} className={inputClass} />
          </Field>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Passi</span>
            <ProcessStepsEditor name="process_steps" defaultValue={processSteps(c)} />
          </div>
        </>
      );
      break;
    case "reviews":
      body = (
        <Note>
          Le recensioni si aggiungono e si modificano in{" "}
          <Link href="/admin/recensioni" className="text-foreground underline underline-offset-4">Recensioni</Link>
          . Qui scegli solo lo sfondo della sezione.
        </Note>
      );
      break;
    case "blog":
      body = <Note>Mostra da sola gli ultimi articoli pubblicati. Qui scegli solo lo sfondo della sezione.</Note>;
      break;
    case "blocks":
      body = (
        <>
          <Note>Sezioni libere (testo, galleria, banner con pulsante) che puoi aggiungere alla homepage. Nell&apos;elenco della homepage si spostano tutte insieme.</Note>
          <HomepageBlocksEditor name="blocks" defaultValue={c.blocks ?? []} />
        </>
      );
      break;
    case "contact":
      body = (
        <>
          <Field label="Etichetta piccola">
            <input name="contact_eyebrow" defaultValue={c.contact_eyebrow ?? ""} placeholder={HOME_DEFAULTS.contact_eyebrow} className={inputClass} />
          </Field>
          <Field label="Titolo grande">
            <input name="contact_title" defaultValue={c.contact_title ?? ""} placeholder={HOME_DEFAULTS.contact_title} className={inputClass} />
          </Field>
          <Field label="Testo">
            <textarea name="contact_text" defaultValue={c.contact_text ?? ""} placeholder={HOME_DEFAULTS.contact_text} rows={3} className={inputClass} />
          </Field>
          <Note>Email e telefono mostrati qui si cambiano in Impostazioni, scheda Contatti e social.</Note>
        </>
      );
      break;
  }

  return (
    <HomeCustomizer title={meta.title} groups={[meta.group]} anchor={meta.key}>
      {body}
      {themeKey ? (
        <Field label="Sfondo della sezione" help="Testi, bordi e pulsanti si adattano da soli per restare leggibili.">
          <select name="section_theme" defaultValue={sectionTheme(c, themeKey)} className={inputClass}>
            {Object.entries(THEME_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      ) : null}
    </HomeCustomizer>
  );
}
