"use client";

import { AuthForm } from "@/components/auth/AuthForm";
import { I18nProvider } from "@/lib/i18n";

export default function LoginPage() {
  return (
    <I18nProvider>
      <AuthForm mode="login" />
    </I18nProvider>
  );
}
