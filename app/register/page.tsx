"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { I18nProvider } from "@/lib/i18n";

export default function RegisterPage() {
  return (
    <I18nProvider>
      <AuthForm mode="register" />
    </I18nProvider>
  );
}
