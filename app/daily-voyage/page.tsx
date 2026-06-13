"use client";

import { DailyVoyage } from "@/components/daily-voyage/DailyVoyage";
import { I18nProvider } from "@/lib/i18n";

export default function DailyVoyagePage() {
  return (
    <I18nProvider>
      <DailyVoyage />
    </I18nProvider>
  );
}
