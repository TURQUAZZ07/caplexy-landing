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
  const module = getAcademyModuleBySlug(slug);

  if (!module) {
    notFound();
  }

  return (
    <I18nProvider>
      <AcademyModuleOverview module={module} />
    </I18nProvider>
  );
}
