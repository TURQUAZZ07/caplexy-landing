import { CargoStorage } from "@/components/cargo-storage/CargoStorage";
import { I18nProvider } from "@/lib/i18n";

export default async function CargoStorageDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <I18nProvider>
      <CargoStorage holdId={id} />
    </I18nProvider>
  );
}
