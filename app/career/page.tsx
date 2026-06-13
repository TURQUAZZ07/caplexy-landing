"use client";

import { CareerPath } from "@/components/career/CareerPath";
import { I18nProvider } from "@/lib/i18n";

export default function CareerPage() {
  return (
    <I18nProvider>
      <CareerPath />
    </I18nProvider>
  );
}
