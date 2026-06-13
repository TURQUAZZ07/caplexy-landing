"use client";

import { LearnerDashboard } from "@/components/dashboard/LearnerDashboard";
import { I18nProvider } from "@/lib/i18n";

export default function DashboardPage() {
  return (
    <I18nProvider>
      <LearnerDashboard />
    </I18nProvider>
  );
}
