"use client";

import { ArrowLeft, ClipboardCheck, Ship } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { I18nProvider, useI18n } from "@/lib/i18n";

export default function FixTheShipLogPage() {
  return (
    <I18nProvider>
      <FixTheShipLogPlaceholder />
    </I18nProvider>
  );
}

function FixTheShipLogPlaceholder() {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-[#f3f6f1] text-ink">
      <header className="bg-ink text-white">
        <div className="section-shell flex flex-wrap items-center justify-between gap-3 py-5">
          <a href="/dashboard" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-lg border border-white/20 bg-white/10">
              <Ship className="h-5 w-5" />
            </span>
            <span className="text-lg font-semibold tracking-wide">Caplexy</span>
          </a>
          <LanguageSwitcher />
        </div>
      </header>

      <section className="section-shell py-12 sm:py-16">
        <article className="mx-auto max-w-2xl rounded-lg border border-ink/8 bg-white p-8 text-center shadow-soft">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-lg bg-tide text-white">
            <ClipboardCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-3xl font-semibold text-ink">
            {t("fixShipLog.title")}
          </h1>
          <p className="mt-3 text-lg leading-8 text-steel">
            {t("fixShipLog.message")}
          </p>
          <a
            href="/dashboard"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-harbor"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("fixShipLog.returnDashboard")}
          </a>
        </article>
      </section>
    </main>
  );
}
