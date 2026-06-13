export const academyModules = [
  {
    key: "harborBasics",
    slug: "harbor-basics",
    unlockRank: 1,
    hiddenTopic: "To Be + Introductions"
  },
  {
    key: "dailyDeckRoutine",
    slug: "daily-deck-routine",
    unlockRank: 10,
    hiddenTopic: "Present Simple"
  },
  {
    key: "weatherWatch",
    slug: "weather-watch",
    unlockRank: 20,
    hiddenTopic: "Present Continuous"
  },
  {
    key: "voyageRecords",
    slug: "voyage-records",
    unlockRank: 35,
    hiddenTopic: "Past Simple"
  },
  {
    key: "stormReports",
    slug: "storm-reports",
    unlockRank: 50,
    hiddenTopic: "Past Continuous"
  },
  {
    key: "captainsOrders",
    slug: "captains-orders",
    unlockRank: 70,
    hiddenTopic: "Modals"
  },
  {
    key: "futureRoutes",
    slug: "future-routes",
    unlockRank: 90,
    hiddenTopic: "Future Forms"
  },
  {
    key: "missionConditions",
    slug: "mission-conditions",
    unlockRank: 120,
    hiddenTopic: "Conditionals"
  }
] as const;

export type AcademyModule = (typeof academyModules)[number];
export type AcademyStatus = "locked" | "available" | "completed";

export function getAcademyModuleBySlug(slug: string) {
  return academyModules.find((module) => module.slug === slug);
}

export function getAcademyModuleStatus(
  module: AcademyModule,
  currentRankIndex: number
): AcademyStatus {
  const moduleIndex = academyModules.findIndex((item) => item.slug === module.slug);
  const nextModule = academyModules[moduleIndex + 1];

  if (currentRankIndex < module.unlockRank) {
    return "locked";
  }

  if (nextModule && currentRankIndex >= nextModule.unlockRank) {
    return "completed";
  }

  return "available";
}

export function getAcademyModuleProgress(
  module: AcademyModule,
  currentRankIndex: number
) {
  const moduleIndex = academyModules.findIndex((item) => item.slug === module.slug);
  const nextModule = academyModules[moduleIndex + 1];
  const endRank = nextModule?.unlockRank ?? 250;

  if (currentRankIndex < module.unlockRank) {
    return 0;
  }

  if (currentRankIndex >= endRank) {
    return 100;
  }

  const rankSpan = Math.max(1, endRank - module.unlockRank);
  const rankProgress = currentRankIndex - module.unlockRank + 1;

  return Math.min(99, Math.max(8, Math.floor((rankProgress / rankSpan) * 100)));
}

export function getUnlockedAcademyModules(currentRankIndex: number) {
  return academyModules.filter((module) => currentRankIndex >= module.unlockRank);
}
