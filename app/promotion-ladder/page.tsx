"use client";

import { PromotionLadder } from "@/components/promotion-ladder/PromotionLadder";
import { I18nProvider } from "@/lib/i18n";

export default function PromotionLadderPage() {
  return (
    <I18nProvider>
      <PromotionLadder />
    </I18nProvider>
  );
}
