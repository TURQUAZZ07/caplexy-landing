"use client";

import { useEffect, useState } from "react";
import { LogOut, UserRound } from "lucide-react";
import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

type AuthHeaderActionsProps = {
  dashboardLabel: string;
  loginLabel: string;
  registerLabel: string;
  profileLabel: string;
  logoutLabel?: string;
  compact?: boolean;
};

type AuthDisplayUser = {
  id: string;
  email: string;
  name: string;
};

export function AuthHeaderActions({
  dashboardLabel,
  loginLabel,
  registerLabel,
  profileLabel,
  logoutLabel = "Logout",
  compact = false
}: AuthHeaderActionsProps) {
  const [user, setUser] = useState<AuthDisplayUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      const config = getSupabaseConfigStatus();

      if (!config.isConfigured) {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const authUser = sessionData.session?.user ?? null;

        if (!authUser) {
          if (isMounted) {
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        const metadataUsername =
          typeof authUser.user_metadata?.username === "string"
            ? authUser.user_metadata.username
            : "";

        await ensureUserProfile(metadataUsername);

        const { data: profile } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", authUser.id)
          .maybeSingle();
        const username =
          typeof profile?.username === "string" ? profile.username.trim() : "";
        const email = authUser.email ?? "";

        if (isMounted) {
          setUser({
            id: authUser.id,
            email,
            name: username || email || "Caplexy User"
          });
          setIsLoading(false);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setIsLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleLogout() {
    setUser(null);

    try {
      const config = getSupabaseConfigStatus();

      if (config.isConfigured) {
        await getSupabaseClient().auth.signOut();
      }
    } finally {
      window.location.href = "/";
    }
  }

  if (isLoading) {
    return null;
  }

  if (!user) {
    return (
      <>
        <a className={navLinkClass(compact)} href="/login">
          {loginLabel}
        </a>
        <a className={navLinkClass(compact)} href="/register">
          {registerLabel}
        </a>
      </>
    );
  }

  return (
    <>
      <span
        className={`inline-flex items-center gap-2 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-sm font-semibold text-white ${
          compact ? "max-w-[12rem]" : "max-w-[14rem]"
        }`}
      >
        <UserRound className="h-4 w-4 shrink-0 text-signal" />
        <span className="truncate">{user.name}</span>
      </span>
      <a className={navLinkClass(compact)} href="/dashboard">
        {dashboardLabel}
      </a>
      <a className={navLinkClass(compact)} href="/profile">
        {profileLabel}
      </a>
      <button
        type="button"
        onClick={handleLogout}
        className={`${navLinkClass(compact)} inline-flex items-center gap-2`}
      >
        <LogOut className="h-4 w-4" />
        {logoutLabel}
      </button>
    </>
  );
}

function navLinkClass(compact: boolean) {
  return compact
    ? "rounded-lg px-3 py-2 text-sm font-semibold text-white/72 transition hover:bg-white/10 hover:text-white"
    : "rounded-lg px-3 py-2 text-sm font-semibold text-white/78 transition hover:bg-white/10 hover:text-white";
}
