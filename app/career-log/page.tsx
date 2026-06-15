"use client";

import { CareerLog } from "@/components/career-log/CareerLog";
import { I18nProvider } from "@/lib/i18n";

export default function CareerLogPage() {
  return (
    <I18nProvider>
      <CareerLog />
    </I18nProvider>
  );
}
