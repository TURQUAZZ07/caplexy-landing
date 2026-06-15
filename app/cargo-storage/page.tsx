"use client";

import { CargoStorage } from "@/components/cargo-storage/CargoStorage";
import { I18nProvider } from "@/lib/i18n";

export default function CargoStoragePage() {
  return (
    <I18nProvider>
      <CargoStorage />
    </I18nProvider>
  );
}
