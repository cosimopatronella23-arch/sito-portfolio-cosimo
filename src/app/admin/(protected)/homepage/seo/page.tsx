import Link from "next/link";
import { getPageSeo } from "@/lib/data/settings";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { PageHeader } from "@/components/admin/settings/PageHeader";

export default async function HomepageSeoPage() {
  const seo = await getPageSeo("home");
  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <Link href="/admin/homepage" className="w-max text-sm text-foreground-muted hover:text-foreground">
        ← Homepage
      </Link>
      <PageHeader
        crumb="Aspetto del sito · Homepage"
        title="SEO della homepage"
        lead="Come la homepage appare su Google e quando la condividi (WhatsApp, LinkedIn): titolo, descrizione e immagine."
      />
      <PageSeoForm pageKey="home" seo={seo} />
    </div>
  );
}
