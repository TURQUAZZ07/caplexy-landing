"use client";

import { ShipAcademy } from "@/components/academy/ShipAcademy";
import { I18nProvider } from "@/lib/i18n";

export default function AcademyPage() {
  return (
    <I18nProvider>
      <ShipAcademy />
    </I18nProvider>
  );
}
