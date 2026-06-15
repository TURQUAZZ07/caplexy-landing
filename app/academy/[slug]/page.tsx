import { notFound } from "next/navigation";
import { AcademyModuleOverview } from "@/components/academy/AcademyModuleOverview";
import { getAcademyModuleBySlug } from "@/lib/academy";
import { I18nProvider } from "@/lib/i18n";

export default async function AcademyModulePage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const academyModule = getAcademyModuleBySlug(slug);

  if (!academyModule) {
    notFound();
  }

  return (
    <I18nProvider>
      <AcademyModuleOverview academyModule={academyModule} />
    </I18nProvider>
  );
}
