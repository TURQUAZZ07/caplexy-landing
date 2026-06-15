import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

export type CareerEventType =
  | "mission_completed"
  | "nm_earned"
  | "academy_completed"
  | "badge_unlocked"
  | "rank_promoted";

export type CareerEvent = {
  id: string;
  userId: string;
  eventType: CareerEventType;
  title: string;
  description: string;
  nmAmount: number;
  moduleSlug: string | null;
  missionKey: string | null;
  rankName: string | null;
  badgeName: string | null;
  createdAt: string;
};

type RecordCareerEventInput = {
  userId?: string;
  eventType: CareerEventType;
  title: string;
  description: string;
  nmAmount?: number;
  moduleSlug?: string | null;
  missionKey?: string | null;
  rankName?: string | null;
  badgeName?: string | null;
};

type SupabaseRowsResult = {
  data: Record<string, unknown>[] | null;
  error: { message: string } | null;
};

export async function recordCareerEvent(input: RecordCareerEventInput) {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return {
      saved: false,
      error: config.message
    };
  }

  try {
    const supabase = getSupabaseClient();
    let userId = input.userId;

    if (!userId) {
      const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError || !sessionData.session?.user) {
        return {
          saved: false,
          error: sessionError?.message ?? "No authenticated user found."
        };
      }

      userId = sessionData.session.user.id;
    }

    const { error } = await supabase.from("career_events").insert({
      user_id: userId,
      event_type: input.eventType,
      title: input.title,
      description: input.description,
      nm_amount: input.nmAmount ?? 0,
      module_slug: input.moduleSlug ?? null,
      mission_key: input.missionKey ?? null,
      rank_name: input.rankName ?? null,
      badge_name: input.badgeName ?? null
    });

    if (error) {
      console.error("[Caplexy career log] event insert failed:", error);
      return {
        saved: false,
        error: error.message
      };
    }

    return {
      saved: true,
      error: null
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Career event could not be saved.";
    console.error("[Caplexy career log] event insert failed:", error);

    return {
      saved: false,
      error: message
    };
  }
}

export async function getCareerEvents(limitCount = 50) {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return {
      events: [] as CareerEvent[],
      error: config.message
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    const user = sessionData.session?.user;

    if (sessionError || !user) {
      return {
        events: [] as CareerEvent[],
        error: sessionError?.message ?? "No authenticated user found."
      };
    }

    const { data, error } = (await supabase
      .from("career_events")
      .select(
        "id,user_id,event_type,title,description,nm_amount,module_slug,mission_key,rank_name,badge_name,created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limitCount)) as SupabaseRowsResult;

    if (error) {
      return {
        events: [] as CareerEvent[],
        error: error.message
      };
    }

    return {
      events: (data ?? []).map(toCareerEvent),
      error: null
    };
  } catch (error) {
    return {
      events: [] as CareerEvent[],
      error: error instanceof Error ? error.message : "Career events could not be loaded."
    };
  }
}

export function formatEventSubject(value: string) {
  return value
    .split("-")
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toCareerEvent(row: Record<string, unknown>): CareerEvent {
  return {
    id: String(row.id ?? ""),
    userId: String(row.user_id ?? ""),
    eventType: isCareerEventType(row.event_type)
      ? row.event_type
      : "mission_completed",
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    nmAmount: typeof row.nm_amount === "number" ? row.nm_amount : 0,
    moduleSlug: typeof row.module_slug === "string" ? row.module_slug : null,
    missionKey: typeof row.mission_key === "string" ? row.mission_key : null,
    rankName: typeof row.rank_name === "string" ? row.rank_name : null,
    badgeName: typeof row.badge_name === "string" ? row.badge_name : null,
    createdAt: String(row.created_at ?? "")
  };
}

function isCareerEventType(value: unknown): value is CareerEventType {
  return (
    value === "mission_completed" ||
    value === "nm_earned" ||
    value === "academy_completed" ||
    value === "badge_unlocked" ||
    value === "rank_promoted"
  );
}
