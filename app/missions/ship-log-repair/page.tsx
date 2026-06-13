"use client";

import { ShipLogRepairMission } from "@/components/missions/ShipLogRepairMission";
import { I18nProvider } from "@/lib/i18n";

export default function ShipLogRepairPage() {
  return (
    <I18nProvider>
      <ShipLogRepairMission />
    </I18nProvider>
  );
}
