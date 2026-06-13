"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getNextRankByXP,
  getRankByXP,
  getRankIndex,
  getRankProgress
} from "@/lib/ranks";

export const playerXpStorageKey = "caplexy.playerXp";
export const cargoMatchCompletedStorageKey = "caplexy.cargoMatch.completedToday";
export const shipLogRepairCompletedStorageKey = "caplexy.shipLogRepair.completedToday";
export const radioCheckCompletedStorageKey = "caplexy.radioCheck.completedToday";
export const voyageLastCompletedDateStorageKey = "caplexy.dailyVoyage.lastCompletedDate";
export const voyageLogCompletedDatesStorageKey = "caplexy.voyageLog.completedDates";
export const voyageLogCurrentStorageKey = "caplexy.voyageLog.currentVoyage";
export const voyageLogLongestStorageKey = "caplexy.voyageLog.longestVoyage";
export const voyageLogAchievedMilestonesStorageKey = "caplexy.voyageLog.achievedMilestones";
export const defaultPlayerXp = 1250;
const progressChangedEvent = "caplexy.progress.changed";
const missionXpReward = 25;
const dailyVoyageBonusXp = 25;

export const dailyVoyageMissionIds = [
  "cargo-match",
  "radio-check",
  "ship-log-repair"
] as const;

export type DailyVoyageMissionId = (typeof dailyVoyageMissionIds)[number];

export type DailyVoyageState = {
  dateKey: string;
  completedMissionIds: DailyVoyageMissionId[];
  completedCount: number;
  totalCount: number;
  progressPercent: number;
  bonusAwarded: boolean;
  isComplete: boolean;
  xpEarnedToday: number;
};

export type VoyageLogMilestone = {
  days: number;
  rewardKey: string;
  xpReward: number;
  achieved: boolean;
};

export type VoyageLogState = {
  currentVoyage: number;
  longestVoyage: number;
  completedDates: string[];
  completedToday: boolean;
  nextMilestone: VoyageLogMilestone;
  milestoneProgressPercent: number;
  milestones: VoyageLogMilestone[];
};

const voyageLogMilestones = [
  { days: 3, rewardKey: "xp50", xpReward: 50 },
  { days: 7, rewardKey: "steadySailor", xpReward: 0 },
  { days: 14, rewardKey: "reliableCrewmate", xpReward: 0 },
  { days: 30, rewardKey: "oceanRegular", xpReward: 0 },
  { days: 60, rewardKey: "longVoyage", xpReward: 0 },
  { days: 100, rewardKey: "legendaryVoyage", xpReward: 0 }
] as const;

function getClientStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

function readCookieValue(key: string) {
  if (typeof document === "undefined") {
    return null;
  }

  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${encodeURIComponent(key)}=`));

  return cookie ? decodeURIComponent(cookie.split("=").slice(1).join("=")) : null;
}

function writeCookieValue(key: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(key)}=${encodeURIComponent(
    value
  )}; path=/; max-age=31536000; SameSite=Lax`;
}

function removeCookieValue(key: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${encodeURIComponent(key)}=; path=/; max-age=0; SameSite=Lax`;
}

function readClientValue(key: string) {
  const storage = getClientStorage();

  if (storage) {
    try {
      return storage.getItem(key);
    } catch {
      return null;
    }
  }

  return null;
}

function writeClientValue(key: string, value: string) {
  const storage = getClientStorage();

  if (storage) {
    try {
      storage.setItem(key, value);
      return;
    } catch {
      return;
    }
  }
}

function removeClientValue(key: string) {
  const storage = getClientStorage();

  if (storage) {
    try {
      storage.removeItem(key);
      return;
    } catch {
      return;
    }
  }
}

function getTodayDateKey() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${today.getFullYear()}-${month}-${day}`;
}

function getPreviousDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() - 1);

  const previousMonth = String(date.getMonth() + 1).padStart(2, "0");
  const previousDay = String(date.getDate()).padStart(2, "0");

  return `${date.getFullYear()}-${previousMonth}-${previousDay}`;
}

function getDailyVoyageStorageKey(dateKey = getTodayDateKey()) {
  return `caplexy.dailyVoyage.${dateKey}`;
}

function isDailyVoyageMissionId(value: string): value is DailyVoyageMissionId {
  return dailyVoyageMissionIds.includes(value as DailyVoyageMissionId);
}

function readDailyVoyageRecord(dateKey = getTodayDateKey()) {
  const fallback = {
    completedMissionIds: [] as DailyVoyageMissionId[],
    bonusAwarded: false
  };
  const rawValue = readClientValue(getDailyVoyageStorageKey(dateKey));

  if (!rawValue) {
    return fallback;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as {
      completedMissionIds?: string[];
      bonusAwarded?: boolean;
    };
    const completedMissionIds = Array.from(
      new Set(parsedValue.completedMissionIds?.filter(isDailyVoyageMissionId) ?? [])
    );

    return {
      completedMissionIds,
      bonusAwarded: parsedValue.bonusAwarded === true
    };
  } catch {
    return fallback;
  }
}

function writeDailyVoyageRecord(
  record: { completedMissionIds: DailyVoyageMissionId[]; bonusAwarded: boolean },
  dateKey = getTodayDateKey()
) {
  writeClientValue(getDailyVoyageStorageKey(dateKey), JSON.stringify(record));
}

function readNumberValue(key: string) {
  const parsedValue = Number(readClientValue(key));

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? Math.floor(parsedValue)
    : 0;
}

function readStringArrayValue(key: string) {
  const rawValue = readClientValue(key);

  if (!rawValue) {
    return [] as string[];
  }

  try {
    const parsedValue = JSON.parse(rawValue);

    return Array.isArray(parsedValue)
      ? parsedValue.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

function writeStringArrayValue(key: string, value: string[]) {
  writeClientValue(key, JSON.stringify(Array.from(new Set(value)).sort()));
}

function readAchievedMilestones() {
  return readStringArrayValue(voyageLogAchievedMilestonesStorageKey)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value > 0);
}

function writeAchievedMilestones(milestones: number[]) {
  writeStringArrayValue(
    voyageLogAchievedMilestonesStorageKey,
    milestones.map(String)
  );
}

function readCurrentVoyageCount(dateKey = getTodayDateKey()) {
  const lastCompletedDate = readClientValue(voyageLastCompletedDateStorageKey);

  if (!lastCompletedDate) {
    return 0;
  }

  if (lastCompletedDate === dateKey || lastCompletedDate === getPreviousDateKey(dateKey)) {
    return readNumberValue(voyageLogCurrentStorageKey);
  }

  writeClientValue(voyageLogCurrentStorageKey, "0");
  return 0;
}

export function readVoyageLogState(): VoyageLogState {
  const dateKey = getTodayDateKey();
  const completedDates = readStringArrayValue(voyageLogCompletedDatesStorageKey);
  const currentVoyage = readCurrentVoyageCount(dateKey);
  const longestVoyage = Math.max(
    currentVoyage,
    readNumberValue(voyageLogLongestStorageKey)
  );
  const achievedMilestones = readAchievedMilestones();
  const milestones = voyageLogMilestones.map((milestone) => ({
    ...milestone,
    achieved: achievedMilestones.includes(milestone.days)
  }));
  const nextMilestone =
    milestones.find((milestone) => currentVoyage < milestone.days) ??
    milestones[milestones.length - 1];
  const previousMilestoneDays =
    [...voyageLogMilestones]
      .reverse()
      .find((milestone) => milestone.days < nextMilestone.days)?.days ?? 0;
  const milestoneSpan = nextMilestone.days - previousMilestoneDays;
  const milestoneProgress = Math.max(0, currentVoyage - previousMilestoneDays);

  return {
    currentVoyage,
    longestVoyage,
    completedDates,
    completedToday: completedDates.includes(dateKey),
    nextMilestone,
    milestoneProgressPercent: Math.min(
      100,
      Math.floor((milestoneProgress / milestoneSpan) * 100)
    ),
    milestones
  };
}

function updateVoyageLog(dateKey = getTodayDateKey()) {
  const completedDates = readStringArrayValue(voyageLogCompletedDatesStorageKey);
  const achievedMilestones = readAchievedMilestones();
  const lastCompletedDate = readClientValue(voyageLastCompletedDateStorageKey);
  const existingCurrentVoyage = readCurrentVoyageCount(dateKey);

  if (completedDates.includes(dateKey)) {
    return 0;
  }

  const previousDateKey = getPreviousDateKey(dateKey);
  const nextCurrentVoyage =
    lastCompletedDate === previousDateKey ? existingCurrentVoyage + 1 : 1;
  const nextLongestVoyage = Math.max(
    nextCurrentVoyage,
    readNumberValue(voyageLogLongestStorageKey)
  );
  const newlyAchievedMilestones = voyageLogMilestones
    .filter((milestone) => nextCurrentVoyage >= milestone.days)
    .filter((milestone) => !achievedMilestones.includes(milestone.days));
  const milestoneXp = newlyAchievedMilestones.reduce(
    (total, milestone) => total + milestone.xpReward,
    0
  );

  writeStringArrayValue(voyageLogCompletedDatesStorageKey, [
    ...completedDates,
    dateKey
  ]);
  writeClientValue(voyageLogCurrentStorageKey, String(nextCurrentVoyage));
  writeClientValue(voyageLogLongestStorageKey, String(nextLongestVoyage));
  writeClientValue(voyageLastCompletedDateStorageKey, dateKey);
  writeAchievedMilestones([
    ...achievedMilestones,
    ...newlyAchievedMilestones.map((milestone) => milestone.days)
  ]);

  return milestoneXp;
}

export function readDailyVoyageState(): DailyVoyageState {
  const dateKey = getTodayDateKey();
  const record = readDailyVoyageRecord(dateKey);
  const completedCount = record.completedMissionIds.length;
  const bonusAwarded = record.bonusAwarded;

  return {
    dateKey,
    completedMissionIds: record.completedMissionIds,
    completedCount,
    totalCount: dailyVoyageMissionIds.length,
    progressPercent: Math.floor(
      (completedCount / dailyVoyageMissionIds.length) * 100
    ),
    bonusAwarded,
    isComplete: completedCount === dailyVoyageMissionIds.length,
    xpEarnedToday:
      completedCount * missionXpReward + (bonusAwarded ? dailyVoyageBonusXp : 0)
  };
}

function completeDailyVoyageMission(missionId: DailyVoyageMissionId) {
  if (typeof window === "undefined") {
    return 0;
  }

  const dateKey = getTodayDateKey();
  const record = readDailyVoyageRecord(dateKey);
  let awardedXp = 0;

  if (!record.completedMissionIds.includes(missionId)) {
    record.completedMissionIds = [...record.completedMissionIds, missionId];
    awardedXp += missionXpReward;
  }

  const allMissionsComplete =
    record.completedMissionIds.length === dailyVoyageMissionIds.length;

  if (allMissionsComplete && !record.bonusAwarded) {
    record.bonusAwarded = true;
    awardedXp += dailyVoyageBonusXp;
    awardedXp += updateVoyageLog(dateKey);
  }

  writeDailyVoyageRecord(record, dateKey);

  if (awardedXp > 0) {
    writeStoredXp(readStoredXp() + awardedXp);
  } else {
    window.dispatchEvent(new Event(progressChangedEvent));
  }

  return awardedXp;
}

export function readStoredXp() {
  if (typeof window === "undefined") {
    return defaultPlayerXp;
  }

  const storedValue = readClientValue(playerXpStorageKey);
  const parsedValue = Number(storedValue);

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? Math.floor(parsedValue)
    : defaultPlayerXp;
}

export function writeStoredXp(nextXp: number) {
  if (typeof window === "undefined") {
    return;
  }

  writeClientValue(playerXpStorageKey, String(Math.max(0, Math.floor(nextXp))));
  window.dispatchEvent(new Event(progressChangedEvent));
}

export function readCargoMatchCompleted() {
  if (typeof window === "undefined") {
    return false;
  }

  return readDailyVoyageState().completedMissionIds.includes("cargo-match");
}

export function readRadioCheckCompleted() {
  if (typeof window === "undefined") {
    return false;
  }

  return readDailyVoyageState().completedMissionIds.includes("radio-check");
}

export function readShipLogRepairCompleted() {
  if (typeof window === "undefined") {
    return false;
  }

  return readDailyVoyageState().completedMissionIds.includes("ship-log-repair");
}

export function markCargoMatchCompleted() {
  if (typeof window === "undefined") {
    return;
  }

  completeDailyVoyageMission("cargo-match");
}

export function markRadioCheckCompleted() {
  if (typeof window === "undefined") {
    return;
  }

  completeDailyVoyageMission("radio-check");
}

export function markShipLogRepairCompleted() {
  if (typeof window === "undefined") {
    return;
  }

  completeDailyVoyageMission("ship-log-repair");
}

export function usePlayerProgress() {
  const [xp, setXpState] = useState(defaultPlayerXp);
  const [dailyVoyage, setDailyVoyage] = useState<DailyVoyageState>(() =>
    readDailyVoyageState()
  );
  const [voyageLog, setVoyageLog] = useState<VoyageLogState>(() =>
    readVoyageLogState()
  );
  const [cargoMatchCompleted, setCargoMatchCompleted] = useState(false);
  const [shipLogRepairCompleted, setShipLogRepairCompleted] = useState(false);
  const [radioCheckCompleted, setRadioCheckCompleted] = useState(false);

  useEffect(() => {
    function refreshProgress() {
      const nextDailyVoyage = readDailyVoyageState();

      setXpState(readStoredXp());
      setDailyVoyage(nextDailyVoyage);
      setVoyageLog(readVoyageLogState());
      setCargoMatchCompleted(
        nextDailyVoyage.completedMissionIds.includes("cargo-match")
      );
      setShipLogRepairCompleted(
        nextDailyVoyage.completedMissionIds.includes("ship-log-repair")
      );
      setRadioCheckCompleted(
        nextDailyVoyage.completedMissionIds.includes("radio-check")
      );
    }

    refreshProgress();
    window.addEventListener(progressChangedEvent, refreshProgress);

    return () => window.removeEventListener(progressChangedEvent, refreshProgress);
  }, []);

  const setXp = useCallback((nextXp: number) => {
    writeStoredXp(nextXp);
    setXpState(Math.max(0, Math.floor(nextXp)));
  }, []);

  const addXp = useCallback((amount: number) => {
    setXpState((currentXp) => {
      const nextXp = Math.max(0, currentXp + amount);
      writeStoredXp(nextXp);
      return nextXp;
    });
  }, []);

  const completeCargoMatch = useCallback(() => {
    markCargoMatchCompleted();
    setXpState(readStoredXp());
    setDailyVoyage(readDailyVoyageState());
    setVoyageLog(readVoyageLogState());
    setCargoMatchCompleted(readCargoMatchCompleted());
    setShipLogRepairCompleted(readShipLogRepairCompleted());
    setRadioCheckCompleted(readRadioCheckCompleted());
  }, []);

  const completeRadioCheck = useCallback(() => {
    markRadioCheckCompleted();
    setXpState(readStoredXp());
    setDailyVoyage(readDailyVoyageState());
    setVoyageLog(readVoyageLogState());
    setCargoMatchCompleted(readCargoMatchCompleted());
    setShipLogRepairCompleted(readShipLogRepairCompleted());
    setRadioCheckCompleted(readRadioCheckCompleted());
  }, []);

  const completeShipLogRepair = useCallback(() => {
    markShipLogRepairCompleted();
    setXpState(readStoredXp());
    setDailyVoyage(readDailyVoyageState());
    setVoyageLog(readVoyageLogState());
    setCargoMatchCompleted(readCargoMatchCompleted());
    setShipLogRepairCompleted(readShipLogRepairCompleted());
    setRadioCheckCompleted(readRadioCheckCompleted());
  }, []);

  const resetProgress = useCallback(() => {
    if (typeof window !== "undefined") {
      writeClientValue(playerXpStorageKey, "0");
      removeClientValue(cargoMatchCompletedStorageKey);
      removeClientValue(shipLogRepairCompletedStorageKey);
      removeClientValue(radioCheckCompletedStorageKey);
      removeClientValue(getDailyVoyageStorageKey());
      removeClientValue(voyageLastCompletedDateStorageKey);
      removeClientValue(voyageLogCompletedDatesStorageKey);
      removeClientValue(voyageLogCurrentStorageKey);
      removeClientValue(voyageLogLongestStorageKey);
      removeClientValue(voyageLogAchievedMilestonesStorageKey);
      window.dispatchEvent(new Event(progressChangedEvent));
    }

    setXpState(0);
    setDailyVoyage(readDailyVoyageState());
    setVoyageLog(readVoyageLogState());
    setCargoMatchCompleted(false);
    setShipLogRepairCompleted(false);
    setRadioCheckCompleted(false);
  }, []);

  return useMemo(() => {
    const rankProgress = getRankProgress(xp);

    return {
      xp,
      setXp,
      addXp,
      resetProgress,
      dailyVoyage,
      voyageLog,
      cargoMatchCompleted,
      shipLogRepairCompleted,
      radioCheckCompleted,
      completeCargoMatch,
      completeShipLogRepair,
      completeRadioCheck,
      currentRank: getRankByXP(xp),
      nextRank: getNextRankByXP(xp),
      rankIndex: getRankIndex(xp),
      rankProgress
    };
  }, [
    addXp,
    cargoMatchCompleted,
    completeCargoMatch,
    completeShipLogRepair,
    completeRadioCheck,
    radioCheckCompleted,
    resetProgress,
    shipLogRepairCompleted,
    setXp,
    dailyVoyage,
    voyageLog,
    xp
  ]);
}
