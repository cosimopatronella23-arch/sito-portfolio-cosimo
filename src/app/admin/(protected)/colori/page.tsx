import { getSiteSettings } from "@/lib/data/settings";
import { GroupForm } from "@/components/admin/settings/GroupForm";
import { PageHeader } from "@/components/admin/settings/PageHeader";
import { ColorsFields } from "@/components/admin/settings/ColorsFields";

export default async function AdminColorsPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <PageHeader
        crumb="Aspetto del sito"
        title="Colori"
        lead="I tre colori del sito. Lo sfondo di ogni sezione della homepage si sceglie dentro la sezione stessa, in Homepage."
      />
      <GroupForm groups={["colors"]}>
        <ColorsFields
          accent={settings.accent_color}
          background={settings.home_content.background_color ?? ""}
          foreground={settings.home_content.foreground_color ?? ""}
        />
      </GroupForm>
    </div>
  );
}
