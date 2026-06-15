export const XP_PER_MICRO_RANK = 100;
export const TOTAL_RANK_GROUPS = 50;
export const LEVELS_PER_GROUP = 5;
export const TOTAL_MICRO_RANKS = TOTAL_RANK_GROUPS * LEVELS_PER_GROUP;

export const rankGroups = [
  "New User",
  "Passenger",
  "VIP Passenger",
  "Crewmember",
  "Cabin Boy",
  "Deck Trainee",
  "Junior Deckhand",
  "Deckhand",
  "Senior Deckhand",
  "Able Seaman",
  "Lead Seaman",
  "Boatswain Assistant",
  "Boatswain",
  "Quartermaster Trainee",
  "Quartermaster",
  "Signal Assistant",
  "Signal Officer",
  "Radio Assistant",
  "Radio Officer",
  "Navigation Trainee",
  "Junior Navigator",
  "Navigator",
  "Senior Navigator",
  "Harbor Cadet",
  "Deck Cadet",
  "Officer Trainee",
  "Third Officer",
  "Second Officer",
  "First Officer",
  "Chief Officer",
  "Junior Captain",
  "Captain",
  "Senior Captain",
  "Fleet Captain",
  "Commodore",
  "Senior Commodore",
  "Rear Admiral",
  "Rear Admiral Senior",
  "Vice Admiral",
  "Vice Admiral Senior",
  "Admiral",
  "Senior Admiral",
  "Admiral of the Fleet",
  "Ocean Commander",
  "Grand Admiral",
  "Legendary Admiral",
  "Neptune Commander",
  "Master of the Seas",
  "Ocean Legend",
  "Admiral of Caplexy"
] as const;

const romanLevels = ["I", "II", "III", "IV", "V"] as const;

export type MicroRank = {
  index: number;
  groupIndex: number;
  levelIndex: number;
  groupName: string;
  level: string;
  name: string;
  xpRequired: number;
};

export const allMicroRanks: MicroRank[] = rankGroups.flatMap(
  (groupName, groupIndex) =>
    romanLevels.map((level, levelIndex) => {
      const index = groupIndex * LEVELS_PER_GROUP + levelIndex + 1;

      return {
        index,
        groupIndex: groupIndex + 1,
        levelIndex: levelIndex + 1,
        groupName,
        level,
        name: `${groupName} ${level}`,
        xpRequired: (index - 1) * XP_PER_MICRO_RANK
      };
    })
);

export function getRankIndex(xp: number) {
  return Math.min(
    TOTAL_MICRO_RANKS,
    Math.max(1, Math.floor(Math.max(0, xp) / XP_PER_MICRO_RANK) + 1)
  );
}

export function getRankByIndex(rankIndex: number) {
  const index = Math.min(
    TOTAL_MICRO_RANKS,
    Math.max(1, Math.floor(rankIndex))
  );

  return allMicroRanks[index - 1];
}

export function getNextRankByIndex(rankIndex: number) {
  return getRankByIndex(Math.min(TOTAL_MICRO_RANKS, rankIndex + 1));
}

export function getRankByXP(xp: number) {
  return allMicroRanks[getRankIndex(xp) - 1];
}

export function getNextRankByXP(xp: number) {
  const nextIndex = Math.min(TOTAL_MICRO_RANKS, getRankIndex(xp) + 1);
  return allMicroRanks[nextIndex - 1];
}

export function getRankProgress(xp: number) {
  const currentRank = getRankByXP(xp);
  const nextRank = getNextRankByXP(xp);

  if (currentRank.index === TOTAL_MICRO_RANKS) {
    return {
      currentRank,
      nextRank,
      xpIntoRank: XP_PER_MICRO_RANK,
      xpForNextRank: XP_PER_MICRO_RANK,
      percent: 100
    };
  }

  const xpIntoRank = Math.max(0, xp) - currentRank.xpRequired;
  const percent = Math.min(
    99,
    Math.max(0, Math.floor((xpIntoRank / XP_PER_MICRO_RANK) * 100))
  );

  return {
    currentRank,
    nextRank,
    xpIntoRank,
    xpForNextRank: XP_PER_MICRO_RANK,
    percent
  };
}

export function getRankProgressForRankIndex(xp: number, rankIndex: number) {
  const currentRank = getRankByIndex(rankIndex);
  const nextRank = getNextRankByIndex(rankIndex);

  if (currentRank.index === TOTAL_MICRO_RANKS) {
    return {
      currentRank,
      nextRank,
      xpIntoRank: XP_PER_MICRO_RANK,
      xpForNextRank: XP_PER_MICRO_RANK,
      percent: 100
    };
  }

  const xpIntoRank = Math.max(0, Math.max(0, xp) - currentRank.xpRequired);
  const percent =
    Math.max(0, xp) >= nextRank.xpRequired
      ? 100
      : Math.max(0, Math.floor((xpIntoRank / XP_PER_MICRO_RANK) * 100));

  return {
    currentRank,
    nextRank,
    xpIntoRank,
    xpForNextRank: XP_PER_MICRO_RANK,
    percent: Math.min(100, percent)
  };
}

export function getNearbyRanks(xp: number) {
  const currentIndex = getRankIndex(xp);

  return getNearbyRanksByIndex(currentIndex);
}

export function getNearbyRanksByIndex(rankIndex: number) {
  const currentIndex = getRankByIndex(rankIndex).index;
  const start = Math.max(1, currentIndex - 1);
  const end = Math.min(TOTAL_MICRO_RANKS, currentIndex + 3);

  return allMicroRanks.slice(start - 1, end);
}
