"use client";

import { VoyageLog } from "@/components/voyage-log/VoyageLog";
import { I18nProvider } from "@/lib/i18n";

export default function VoyageLogPage() {
  return (
    <I18nProvider>
      <VoyageLog />
    </I18nProvider>
  );
}
