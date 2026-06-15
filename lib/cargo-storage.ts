"use client";

import { ensureUserProfile } from "@/lib/auth/ensureUserProfile";
import { recordCareerEvent } from "@/lib/career-events";
import { readStoredXp, writeStoredXp } from "@/lib/progress";
import { getSupabaseClient, getSupabaseConfigStatus } from "@/lib/supabase/client";

export const cargoStudyRewardNm = 20;

export type CargoHold = {
  id: string;
  userId: string | null;
  title: string;
  description: string;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

export type CargoItem = {
  id: string;
  holdId: string;
  userId: string | null;
  englishWord: string;
  nativeMeaning: string;
  exampleSentence: string;
  pronunciation: string;
  note: string;
  createdAt: string;
};

export type CargoStorageOverview = {
  holds: CargoHold[];
  isAuthenticated: boolean;
  error: string | null;
};

export type CargoHoldDetail = {
  hold: CargoHold | null;
  items: CargoItem[];
  isAuthenticated: boolean;
  error: string | null;
};

export type CargoStudyMode =
  | "flashcard"
  | "multiple-choice"
  | "cargo-match"
  | "review";

const localCargoHoldsKey = "caplexy.cargoStorage.holds";
const localCargoItemsKey = "caplexy.cargoStorage.items";

const seedHolds: CargoHold[] = [
  {
    id: "local-yks-vocabulary",
    userId: null,
    title: "YKS Vocabulary",
    description: "Exam-focused cargo for high-frequency academic words.",
    itemCount: 4,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString()
  },
  {
    id: "local-business-english",
    userId: null,
    title: "Business English",
    description: "Professional cargo for meetings, emails and presentations.",
    itemCount: 4,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString()
  },
  {
    id: "local-travel-english",
    userId: null,
    title: "Travel English",
    description: "Travel cargo for airports, hotels and city routes.",
    itemCount: 4,
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString()
  }
];

const seedItems: CargoItem[] = [
  createSeedItem("local-yks-vocabulary", "approach", "yaklasim", "The crew used a careful approach during the storm."),
  createSeedItem("local-yks-vocabulary", "evidence", "kanit", "The captain checked the evidence in the ship log."),
  createSeedItem("local-yks-vocabulary", "require", "gerektirmek", "This route requires careful planning."),
  createSeedItem("local-yks-vocabulary", "increase", "artmak", "The wind speed started to increase."),
  createSeedItem("local-business-english", "schedule", "program", "The officer shared the meeting schedule."),
  createSeedItem("local-business-english", "invoice", "fatura", "The cargo invoice arrived before departure."),
  createSeedItem("local-business-english", "confirm", "onaylamak", "Please confirm the delivery time."),
  createSeedItem("local-business-english", "proposal", "teklif", "The team prepared a new proposal."),
  createSeedItem("local-travel-english", "reservation", "rezervasyon", "The passenger checked the hotel reservation."),
  createSeedItem("local-travel-english", "departure", "kalkis", "The departure gate changed at noon."),
  createSeedItem("local-travel-english", "luggage", "bagaj", "The luggage was loaded onto the ship."),
  createSeedItem("local-travel-english", "destination", "varis noktasi", "The destination appears on the route map.")
];

export async function getCargoStorageOverview(): Promise<CargoStorageOverview> {
  const session = await getCargoSession();

  if (!session.userId) {
    const local = readLocalCargoStorage();

    return {
      holds: local.holds,
      isAuthenticated: false,
      error: session.error
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: holdsData, error: holdsError } = await supabase
      .from("cargo_holds")
      .select("id,user_id,title,description,created_at,updated_at")
      .eq("user_id", session.userId)
      .order("updated_at", { ascending: false });

    if (holdsError) {
      return {
        holds: [],
        isAuthenticated: true,
        error: holdsError.message
      };
    }

    const { data: itemRows } = await supabase
      .from("cargo_items")
      .select("hold_id")
      .eq("user_id", session.userId);
    const counts = getItemCounts(itemRows);

    return {
      holds: (Array.isArray(holdsData) ? holdsData : []).map((row) =>
        toCargoHold(row, counts.get(String((row as Record<string, unknown>).id ?? "")) ?? 0)
      ),
      isAuthenticated: true,
      error: null
    };
  } catch (error) {
    return {
      holds: [],
      isAuthenticated: true,
      error: error instanceof Error ? error.message : "Cargo Storage could not be loaded."
    };
  }
}

export async function getCargoHoldDetail(holdId: string): Promise<CargoHoldDetail> {
  const session = await getCargoSession();

  if (!session.userId) {
    const local = readLocalCargoStorage();
    const hold = local.holds.find((item) => item.id === holdId) ?? null;
    const items = local.items.filter((item) => item.holdId === holdId);

    return {
      hold,
      items,
      isAuthenticated: false,
      error: session.error
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: holdData, error: holdError } = await supabase
      .from("cargo_holds")
      .select("id,user_id,title,description,created_at,updated_at")
      .eq("id", holdId)
      .eq("user_id", session.userId)
      .maybeSingle();

    if (holdError || !holdData) {
      return {
        hold: null,
        items: [],
        isAuthenticated: true,
        error: holdError?.message ?? "Cargo Hold was not found."
      };
    }

    const { data: itemsData, error: itemsError } = await supabase
      .from("cargo_items")
      .select(
        "id,hold_id,user_id,english_word,native_meaning,example_sentence,pronunciation,note,created_at"
      )
      .eq("hold_id", holdId)
      .eq("user_id", session.userId)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return {
        hold: toCargoHold(holdData, 0),
        items: [],
        isAuthenticated: true,
        error: itemsError.message
      };
    }

    const items = (Array.isArray(itemsData) ? itemsData : []).map(toCargoItem);

    return {
      hold: toCargoHold(holdData, items.length),
      items,
      isAuthenticated: true,
      error: null
    };
  } catch (error) {
    return {
      hold: null,
      items: [],
      isAuthenticated: true,
      error: error instanceof Error ? error.message : "Cargo Hold could not be loaded."
    };
  }
}

export async function createCargoHold(input: {
  title: string;
  description?: string;
}) {
  const title = input.title.trim();
  const description = input.description?.trim() ?? "";

  if (!title) {
    return {
      hold: null as CargoHold | null,
      error: "Cargo Hold name is required."
    };
  }

  const session = await getCargoSession();

  if (!session.userId) {
    const local = readLocalCargoStorage();
    const now = new Date().toISOString();
    const hold: CargoHold = {
      id: `local-${Date.now()}`,
      userId: null,
      title,
      description,
      itemCount: 0,
      createdAt: now,
      updatedAt: now
    };

    writeLocalCargoStorage({
      holds: [hold, ...local.holds],
      items: local.items
    });

    return {
      hold,
      error: null
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from("cargo_holds")
      .insert({
        user_id: session.userId,
        title,
        description
      });

    if (error) {
      return {
        hold: null,
        error: error.message
      };
    }

    const { data, error: readError } = await supabase
      .from("cargo_holds")
      .select("id,user_id,title,description,created_at,updated_at")
      .eq("user_id", session.userId)
      .eq("title", title)
      .order("created_at", { ascending: false })
      .limit(1);
    const createdHold = Array.isArray(data) ? data[0] : null;

    if (readError || !createdHold) {
      return {
        hold: null,
        error: readError?.message ?? "Cargo Hold could not be created."
      };
    }

    return {
      hold: toCargoHold(createdHold, 0),
      error: null
    };
  } catch (error) {
    return {
      hold: null,
      error: error instanceof Error ? error.message : "Cargo Hold could not be created."
    };
  }
}

export async function createCargoItem(input: {
  holdId: string;
  englishWord: string;
  nativeMeaning: string;
  exampleSentence: string;
  pronunciation?: string;
  note?: string;
}) {
  const englishWord = input.englishWord.trim();
  const nativeMeaning = input.nativeMeaning.trim();
  const exampleSentence = input.exampleSentence.trim();
  const pronunciation = input.pronunciation?.trim() ?? "";
  const note = input.note?.trim() ?? "";

  if (!englishWord || !nativeMeaning || !exampleSentence) {
    return {
      item: null as CargoItem | null,
      error: "Cargo Item requires a word, meaning and example sentence."
    };
  }

  const session = await getCargoSession();

  if (!session.userId) {
    const local = readLocalCargoStorage();
    const now = new Date().toISOString();
    const item: CargoItem = {
      id: `local-item-${Date.now()}`,
      holdId: input.holdId,
      userId: null,
      englishWord,
      nativeMeaning,
      exampleSentence,
      pronunciation,
      note,
      createdAt: now
    };
    const holds = local.holds.map((hold) =>
      hold.id === input.holdId
        ? {
            ...hold,
            itemCount: hold.itemCount + 1,
            updatedAt: now
          }
        : hold
    );

    writeLocalCargoStorage({
      holds,
      items: [...local.items, item]
    });

    return {
      item,
      error: null
    };
  }

  try {
    const supabase = getSupabaseClient();
    const now = new Date().toISOString();
    const { error } = await supabase
      .from("cargo_items")
      .insert({
        hold_id: input.holdId,
        user_id: session.userId,
        english_word: englishWord,
        native_meaning: nativeMeaning,
        example_sentence: exampleSentence,
        pronunciation,
        note
      });

    if (error) {
      return {
        item: null,
        error: error.message
      };
    }

    const { data, error: readError } = await supabase
      .from("cargo_items")
      .select(
        "id,hold_id,user_id,english_word,native_meaning,example_sentence,pronunciation,note,created_at"
      )
      .eq("hold_id", input.holdId)
      .eq("user_id", session.userId)
      .eq("english_word", englishWord)
      .order("created_at", { ascending: false })
      .limit(1);
    const createdItem = Array.isArray(data) ? data[0] : null;

    if (readError || !createdItem) {
      return {
        item: null,
        error: readError?.message ?? "Cargo Item could not be loaded."
      };
    }

    await supabase
      .from("cargo_holds")
      .update({ updated_at: now })
      .eq("id", input.holdId);

    return {
      item: toCargoItem(createdItem),
      error: null
    };
  } catch (error) {
    return {
      item: null,
      error: error instanceof Error ? error.message : "Cargo Item could not be created."
    };
  }
}

export async function completeCargoStudySession(input: {
  holdId: string;
  holdTitle: string;
  mode: CargoStudyMode;
  rewardNm?: number;
}) {
  const rewardNm = input.rewardNm ?? cargoStudyRewardNm;
  const session = await getCargoSession();

  if (!session.userId) {
    const nextNm = readStoredXp() + rewardNm;

    writeStoredXp(nextNm);

    return {
      awarded: true,
      currentNm: nextNm,
      error: session.error
    };
  }

  try {
    const supabase = getSupabaseClient();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("current_xp")
      .eq("id", session.userId)
      .maybeSingle();

    if (profileError || !profile) {
      return {
        awarded: false,
        currentNm: readStoredXp(),
        error: profileError?.message ?? "Profile row was not found."
      };
    }

    const currentNm = getNumberValue(profile, "current_xp");
    const nextNm = currentNm + rewardNm;
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ current_xp: nextNm })
      .eq("id", session.userId);

    if (updateError) {
      return {
        awarded: false,
        currentNm,
        error: updateError.message
      };
    }

    writeStoredXp(nextNm);

    await recordCareerEvent({
      userId: session.userId,
      eventType: "mission_completed",
      title: `${input.holdTitle} cargo reviewed`,
      description: `Completed a ${formatModeName(input.mode)} Cargo Storage session.`,
      nmAmount: 0,
      moduleSlug: "cargo-storage",
      missionKey: input.mode
    });
    await recordCareerEvent({
      userId: session.userId,
      eventType: "nm_earned",
      title: `+${rewardNm} NM Cargo Storage session`,
      description: `${input.holdTitle} added ${rewardNm} Nautical Miles to your career record.`,
      nmAmount: rewardNm,
      moduleSlug: "cargo-storage",
      missionKey: input.mode
    });

    return {
      awarded: true,
      currentNm: nextNm,
      error: null
    };
  } catch (error) {
    return {
      awarded: false,
      currentNm: readStoredXp(),
      error: error instanceof Error ? error.message : "Cargo session could not be saved."
    };
  }
}

function createSeedItem(
  holdId: string,
  englishWord: string,
  nativeMeaning: string,
  exampleSentence: string
): CargoItem {
  return {
    id: `${holdId}-${englishWord}`,
    holdId,
    userId: null,
    englishWord,
    nativeMeaning,
    exampleSentence,
    pronunciation: "",
    note: "",
    createdAt: new Date(0).toISOString()
  };
}

async function getCargoSession() {
  const config = getSupabaseConfigStatus();

  if (!config.isConfigured) {
    return {
      userId: null,
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
        userId: null,
        error: sessionError?.message ?? "Sign in to sync Cargo Storage."
      };
    }

    const ensuredProfile = await ensureUserProfile();

    if (ensuredProfile.error) {
      return {
        userId: null,
        error: ensuredProfile.error
      };
    }

    return {
      userId: user.id,
      error: null
    };
  } catch (error) {
    return {
      userId: null,
      error: error instanceof Error ? error.message : "Cargo session could not be loaded."
    };
  }
}

function readLocalCargoStorage() {
  if (typeof window === "undefined") {
    return {
      holds: seedHolds,
      items: seedItems
    };
  }

  try {
    const storedHolds = JSON.parse(
      window.localStorage.getItem(localCargoHoldsKey) ?? "null"
    );
    const storedItems = JSON.parse(
      window.localStorage.getItem(localCargoItemsKey) ?? "null"
    );
    const holds = Array.isArray(storedHolds)
      ? storedHolds.map(toLocalCargoHold)
      : seedHolds;
    const items = Array.isArray(storedItems)
      ? storedItems.map(toLocalCargoItem)
      : seedItems;
    const counts = items.reduce((map, item) => {
      map.set(item.holdId, (map.get(item.holdId) ?? 0) + 1);

      return map;
    }, new Map<string, number>());

    return {
      holds: holds.map((hold) => ({
        ...hold,
        itemCount: counts.get(hold.id) ?? 0
      })),
      items
    };
  } catch {
    return {
      holds: seedHolds,
      items: seedItems
    };
  }
}

function writeLocalCargoStorage(storage: { holds: CargoHold[]; items: CargoItem[] }) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localCargoHoldsKey, JSON.stringify(storage.holds));
  window.localStorage.setItem(localCargoItemsKey, JSON.stringify(storage.items));
}

function getItemCounts(rows: unknown) {
  const counts = new Map<string, number>();

  if (!Array.isArray(rows)) {
    return counts;
  }

  rows.forEach((row) => {
    const holdId = String((row as Record<string, unknown>).hold_id ?? "");

    if (holdId) {
      counts.set(holdId, (counts.get(holdId) ?? 0) + 1);
    }
  });

  return counts;
}

function toCargoHold(row: unknown, itemCount = 0): CargoHold {
  const value = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(value.id ?? ""),
    userId: typeof value.user_id === "string" ? value.user_id : null,
    title: String(value.title ?? "Cargo Hold"),
    description: String(value.description ?? ""),
    itemCount,
    createdAt: String(value.created_at ?? ""),
    updatedAt: String(value.updated_at ?? value.created_at ?? "")
  };
}

function toCargoItem(row: unknown): CargoItem {
  const value = (row ?? {}) as Record<string, unknown>;

  return {
    id: String(value.id ?? ""),
    holdId: String(value.hold_id ?? value.holdId ?? ""),
    userId: typeof value.user_id === "string" ? value.user_id : null,
    englishWord: String(value.english_word ?? value.englishWord ?? ""),
    nativeMeaning: String(value.native_meaning ?? value.nativeMeaning ?? ""),
    exampleSentence: String(value.example_sentence ?? value.exampleSentence ?? ""),
    pronunciation: String(value.pronunciation ?? ""),
    note: String(value.note ?? ""),
    createdAt: String(value.created_at ?? value.createdAt ?? "")
  };
}

function toLocalCargoHold(row: unknown): CargoHold {
  const value = row as Partial<CargoHold>;

  return {
    id: String(value.id ?? `local-${Date.now()}`),
    userId: null,
    title: String(value.title ?? "Cargo Hold"),
    description: String(value.description ?? ""),
    itemCount: typeof value.itemCount === "number" ? value.itemCount : 0,
    createdAt: String(value.createdAt ?? new Date().toISOString()),
    updatedAt: String(value.updatedAt ?? new Date().toISOString())
  };
}

function toLocalCargoItem(row: unknown): CargoItem {
  const value = row as Partial<CargoItem>;

  return {
    id: String(value.id ?? `local-item-${Date.now()}`),
    holdId: String(value.holdId ?? ""),
    userId: null,
    englishWord: String(value.englishWord ?? ""),
    nativeMeaning: String(value.nativeMeaning ?? ""),
    exampleSentence: String(value.exampleSentence ?? ""),
    pronunciation: String(value.pronunciation ?? ""),
    note: String(value.note ?? ""),
    createdAt: String(value.createdAt ?? new Date().toISOString())
  };
}

function getNumberValue(row: unknown, key: string) {
  if (!row || typeof row !== "object") {
    return 0;
  }

  const value = (row as Record<string, unknown>)[key];

  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function formatModeName(mode: CargoStudyMode) {
  return mode
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}
