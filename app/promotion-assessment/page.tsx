"use client";

import { I18nProvider } from "@/lib/i18n";
import { PromotionAssessment } from "@/components/promotion-assessment/PromotionAssessment";

export default function PromotionAssessmentPage() {
  return (
    <I18nProvider>
      <PromotionAssessment />
    </I18nProvider>
  );
}
