"use client";

import { RadioCheckMission } from "@/components/missions/RadioCheckMission";
import { I18nProvider } from "@/lib/i18n";

export default function RadioCheckPage() {
  return (
    <I18nProvider>
      <RadioCheckMission />
    </I18nProvider>
  );
}
