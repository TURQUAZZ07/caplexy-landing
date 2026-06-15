"use client";

import { CareerProfile } from "@/components/profile/CareerProfile";
import { I18nProvider } from "@/lib/i18n";

export default function ProfilePage() {
  return (
    <I18nProvider>
      <CareerProfile />
    </I18nProvider>
  );
}
