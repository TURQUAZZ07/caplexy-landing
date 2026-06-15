"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Anchor, ArrowRight, Compass, Ship } from "lucide-react";
import { LanguageSwitcher } from "@/components/i18n/LanguageSwitcher";
import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { useI18n } from "@/lib/i18n";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const { t } = useI18n();
  const config = getSupabaseConfigStatus();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [statusMessage, setStatusMessage] = useState(config.isConfigured ? "" : config.message);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatusMessage("");

    if (!config.isConfigured) {
      setStatusMessage(config.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      if (isRegister) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username
            }
          }
        });

        if (error) {
          setStatusMessage(error.message);
          return;
        }

        const userId = data.user?.id;

        if (!userId) {
          setStatusMessage(
            "Account created. Please check your email before signing in."
          );
          return;
        }

        await ensureUserProfile(username);
        router.push("/dashboard");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      await ensureUserProfile();
      router.push("/dashboard");
    } catch (error) {
      setStatusMessage(
        error instanceof Error ? error.message : "Authentication failed."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink text-white">
      <div className="absolute inset-0 bg-chart-grid bg-[size:48px_48px] opacity-[0.08]" />
      <div className="absolute left-1/2 top-[-8rem] h-80 w-[44rem] -translate-x-1/2 rounded-full bg-tide/25 blur-3xl" />
      <div className="absolute bottom-[-10rem] right-[-6rem] h-96 w-96 rounded-full bg-glass/[0.16] blur-3xl" />

      <section className="section-shell relative grid min-h-screen place-items-center py-6 sm:py-10">
        <div className="w-full max-w-5xl rounded-lg border border-white/14 bg-white/[0.08] p-2 shadow-glow backdrop-blur-2xl">
          <div className="overflow-hidden rounded-lg border border-white/10 bg-[#f8faf7] text-ink shadow-soft">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
              <aside className="relative hidden overflow-hidden bg-ink p-8 text-white lg:block">
                <div className="absolute inset-0 bg-chart-grid bg-[size:42px_42px] opacity-10" />
                <div className="absolute -right-24 top-10 h-64 w-64 rounded-full bg-tide/25 blur-3xl" />
                <div className="relative flex h-full min-h-[620px] flex-col justify-between">
                  <a href="/" className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-lg border border-white/18 bg-white/10">
                      <Ship className="h-6 w-6 text-glass" />
                    </span>
                    <span>
                      <span className="block text-xl font-semibold">Caplexy</span>
                      <span className="text-xs font-semibold uppercase text-white/48">
                        Maritime English Career
                      </span>
                    </span>
                  </a>

                  <div>
                    <div className="inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white/78">
                      <Compass className="h-4 w-4 text-signal" />
                      Cadet Access
                    </div>
                    <h2 className="mt-5 text-balance text-4xl font-semibold leading-tight">
                      Learn English through voyages, ranks, and promotions.
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-white/62">
                      Your progress, academy training, mission records, and rank
                      path stay connected to your Caplexy career.
                    </p>
                  </div>

                  <div className="grid gap-3 rounded-lg border border-white/12 bg-white/[0.08] p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-white/58">Rank path</span>
                      <span className="font-bold text-signal">250 ranks</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/12">
                      <div className="h-full w-[31%] rounded-full bg-gradient-to-r from-glass to-signal" />
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-white/46">
                      <span>Cadet</span>
                      <span>Admiral</span>
                    </div>
                  </div>
                </div>
              </aside>

              <div className="p-5 sm:p-8 lg:p-10">
                <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
                  <a href="/" className="flex items-center gap-3 lg:hidden">
                    <span className="grid h-11 w-11 place-items-center rounded-lg bg-ink text-white">
                      <Ship className="h-5 w-5" />
                    </span>
                    <span className="text-lg font-semibold">Caplexy</span>
                  </a>

                  <div className="ml-auto flex items-center gap-2">
                    <a
                      href="/dashboard"
                      className="rounded-lg border border-ink/10 bg-white px-3 py-2 text-sm font-bold text-ink shadow-sm transition hover:border-tide/30 hover:text-tide"
                    >
                      Dashboard
                    </a>
                    <LanguageSwitcher />
                  </div>
                </div>

                <div className="mx-auto w-full max-w-md">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-tide/15 bg-tide/10 px-3 py-2 text-sm font-bold text-tide">
                    <Anchor className="h-4 w-4" />
                    {isRegister
                      ? t("auth.register.eyebrow")
                      : t("auth.login.eyebrow")}
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-4xl">
                    {isRegister ? t("auth.register.title") : t("auth.login.title")}
                  </h1>
                  <p className="mt-3 text-sm leading-6 text-steel">
                    {isRegister
                      ? t("auth.register.description")
                      : t("auth.login.description")}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
                    {isRegister ? (
                      <label className="grid gap-2 text-sm font-bold text-ink">
                        {t("auth.fields.username")}
                        <input
                          value={username}
                          onChange={(event) => setUsername(event.target.value)}
                          required
                          className="h-12 rounded-lg border border-ink/10 bg-white px-4 text-sm outline-none transition placeholder:text-steel/55 focus:border-tide focus:ring-4 focus:ring-tide/10"
                          placeholder="Ekrem"
                        />
                      </label>
                    ) : null}

                    <label className="grid gap-2 text-sm font-bold text-ink">
                      {t("auth.fields.email")}
                      <input
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                        className="h-12 rounded-lg border border-ink/10 bg-white px-4 text-sm outline-none transition placeholder:text-steel/55 focus:border-tide focus:ring-4 focus:ring-tide/10"
                        placeholder="you@example.com"
                      />
                    </label>

                    <label className="grid gap-2 text-sm font-bold text-ink">
                      {t("auth.fields.password")}
                      <input
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                        minLength={6}
                        className="h-12 rounded-lg border border-ink/10 bg-white px-4 text-sm outline-none transition placeholder:text-steel/55 focus:border-tide focus:ring-4 focus:ring-tide/10"
                        placeholder="password"
                      />
                    </label>

                    {statusMessage ? (
                      <div className="rounded-lg border border-signal/30 bg-signal/15 p-4 text-sm font-semibold leading-6 text-ink">
                        {statusMessage}
                      </div>
                    ) : null}

                    <button
                      type="submit"
                      disabled={isSubmitting || !config.isConfigured}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-harbor disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting
                        ? t("auth.actions.pleaseWait")
                        : isRegister
                          ? t("auth.actions.createAccount")
                          : t("auth.actions.login")}
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm font-semibold text-steel">
                    {isRegister
                      ? t("auth.links.hasAccount")
                      : t("auth.links.noAccount")}{" "}
                    <a
                      href={isRegister ? "/login" : "/register"}
                      className="text-tide transition hover:text-harbor"
                    >
                      {isRegister
                        ? t("auth.actions.login")
                        : t("auth.actions.register")}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
