import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createPublicClient } from "@/lib/supabase/publicClient";

/**
 * Backup settimanale (Vercel Cron, vedi vercel.json): legge i contenuti del
 * sito e li invia come file JSON allegato all'email di contatto. Solo
 * lettura — non scrive nulla sul database — e il backup finisce fuori da
 * Supabase, quindi resta disponibile anche se il progetto Supabase avesse
 * problemi.
 *
 * Usa la chiave pubblica (anon), quindi le policy RLS limitano la lettura a
 * ciò che è pubblico: progetti e articoli pubblicati, impostazioni, SEO
 * pagine. Le bozze restano escluse per scelta: leggerle richiederebbe la
 * service role key, una chiave che scavalca ogni protezione del database.
 * Per un backup completo bozze incluse c'è "Esporta" in /admin.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")?.trim();
  const expected = `Bearer ${process.env.CRON_SECRET?.trim()}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createPublicClient();
  const [projects, blogPosts, servicePages, siteSettings, pageSeo, media] =
    await Promise.all([
      supabase.from("projects").select("*").order("created_at"),
      supabase.from("blog_posts").select("*").order("created_at"),
      supabase.from("service_pages").select("*").order("sort_order"),
      supabase.from("site_settings").select("*"),
      supabase.from("page_seo").select("*"),
      supabase.storage
        .from("media")
        .list("", {
          limit: 1000,
          sortBy: { column: "created_at", order: "asc" },
        }),
    ]);

  const failed = [
    projects,
    blogPosts,
    servicePages,
    siteSettings,
    pageSeo,
    media,
  ].find((r) => r.error);
  if (failed?.error) {
    return NextResponse.json(
      { ok: false, error: failed.error.message },
      { status: 500 },
    );
  }

  const contactEmail = siteSettings.data?.[0]?.contact_email;
  if (!contactEmail) {
    return NextResponse.json(
      { ok: false, error: "Email di contatto non impostata" },
      { status: 500 },
    );
  }

  const exportedAt = new Date();
  const date = exportedAt.toISOString().slice(0, 10);
  const mediaFiles = (media.data ?? [])
    .filter((f) => f.name && !f.name.endsWith("/"))
    .map((f) => ({
      name: f.name,
      url: supabase.storage.from("media").getPublicUrl(f.name).data.publicUrl,
      size: f.metadata?.size ?? null,
      created_at: f.created_at,
    }));

  const backup = {
    exported_at: exportedAt.toISOString(),
    note: "Backup automatico settimanale dei contenuti pubblici. Le bozze non sono incluse: per quelle usa Esporta in /admin.",
    projects: projects.data ?? [],
    blog_posts: blogPosts.data ?? [],
    service_pages: servicePages.data ?? [],
    site_settings: siteSettings.data ?? [],
    page_seo: pageSeo.data ?? [],
    media_files: mediaFiles,
  };

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: "Sito Portfolio <onboarding@resend.dev>",
    to: contactEmail,
    subject: `Backup settimanale del sito — ${date}`,
    text: [
      "Ecco il backup settimanale dei contenuti del sito, in allegato.",
      "",
      `Progetti pubblicati: ${backup.projects.length}`,
      `Articoli pubblicati: ${backup.blog_posts.length}`,
      `Servizi pubblicati: ${backup.service_pages.length}`,
      `File nella libreria media: ${mediaFiles.length} (elenco con indirizzi; i file veri restano su Supabase)`,
      "",
      "Non serve fare nulla: conserva questa email. Le bozze non sono incluse, per quelle usa Esporta in /admin.",
    ].join("\n"),
    attachments: [
      {
        filename: `backup-sito-${date}.json`,
        content: Buffer.from(JSON.stringify(backup, null, 2)),
      },
    ],
  });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    ranAt: exportedAt.toISOString(),
    projects: backup.projects.length,
    blogPosts: backup.blog_posts.length,
    servicePages: backup.service_pages.length,
    mediaFiles: mediaFiles.length,
  });
}
