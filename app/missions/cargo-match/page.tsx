"use client";

import { CargoMatchMission } from "@/components/missions/CargoMatchMission";
import { I18nProvider } from "@/lib/i18n";

export default function CargoMatchPage() {
  return (
    <I18nProvider>
      <CargoMatchMission />
    </I18nProvider>
  );
}
