export type AcademyModule = {
  key: string;
  slug: string;
  unlockRank: number;
  hiddenTopic: string;
  vocabularyThemes: string[];
  listeningActivities: string[];
  speakingActivities: string[];
  assessment: string;
  badge: string;
};

export const academyModules = [
  createAcademyModule("harborBasics", "harbor-basics", 1, "To Be + Introductions", ["identity", "harbor", "roles"], ["arrivalCall"], ["selfIntroduction"], "harborCheck", "harborCadet"),
  createAcademyModule("crewOrientation", "crew-orientation", 7, "Personal Information", ["crew", "roles", "documents"], ["crewBriefing"], ["crewCheckIn"], "orientationReport", "newCrew"),
  createAcademyModule("cabinReadiness", "cabin-readiness", 12, "There Is / There Are", ["cabins", "objects", "locations"], ["cabinInspection"], ["roomReport"], "cabinChecklist", "cabinReady"),
  createAcademyModule("dailyDeckRoutine", "daily-deck-routine", 18, "Present Simple", ["routine", "deck", "time"], ["dutySchedule"], ["dailyReport"], "routineLog", "deckRoutine"),
  createAcademyModule("watchDuty", "watch-duty", 24, "Adverbs of Frequency", ["watch", "frequency", "duties"], ["watchRotation"], ["watchHandover"], "watchRecord", "watchKeeper"),
  createAcademyModule("cargoInspection", "cargo-inspection", 29, "Countable and Uncountable Nouns", ["cargo", "quantities", "labels"], ["cargoManifest"], ["cargoReport"], "cargoAudit", "cargoInspector"),
  createAcademyModule("galleyService", "galley-service", 35, "Requests and Offers", ["food", "service", "requests"], ["serviceOrder"], ["politeRequest"], "serviceBrief", "galleyCrew"),
  createAcademyModule("weatherWatch", "weather-watch", 41, "Present Continuous", ["weather", "sea", "actions"], ["weatherUpdate"], ["liveStatus"], "weatherReport", "weatherWatcher"),
  createAcademyModule("deckOperations", "deck-operations", 46, "Imperatives", ["equipment", "movement", "safety"], ["deckCommand"], ["commandResponse"], "operationCheck", "deckOperator"),
  createAcademyModule("portArrival", "port-arrival", 52, "Prepositions of Place", ["port", "directions", "locations"], ["arrivalInstructions"], ["locationReport"], "arrivalMap", "portGuide"),
  createAcademyModule("passengerAssistance", "passenger-assistance", 58, "Can / Could", ["passengers", "help", "questions"], ["helpDeskCall"], ["assistanceDialogue"], "assistanceReview", "guestSupport"),
  createAcademyModule("safetyDrill", "safety-drill", 63, "Must / Have To", ["safety", "rules", "equipment"], ["safetyAnnouncement"], ["safetyInstruction"], "safetyClearance", "safetyReady"),
  createAcademyModule("radioCommunication", "radio-communication", 69, "Short Functional Messages", ["radio", "signals", "messages"], ["radioTransmission"], ["radioReply"], "radioCheck", "radioOperator"),
  createAcademyModule("emergencySignals", "emergency-signals", 75, "Warnings and Prohibitions", ["emergency", "signals", "hazards"], ["alarmMessage"], ["warningCall"], "signalTest", "signalOfficer"),
  createAcademyModule("navigationBriefing", "navigation-briefing", 80, "Sequencing Words", ["navigation", "routes", "sequence"], ["routeBriefing"], ["routeSummary"], "navigationQuiz", "juniorNavigator"),
  createAcademyModule("voyageRecords", "voyage-records", 86, "Past Simple", ["records", "voyage", "events"], ["logReview"], ["pastReport"], "recordRepair", "logOfficer"),
  createAcademyModule("maintenanceBay", "maintenance-bay", 92, "Need To / Need", ["maintenance", "tools", "problems"], ["repairRequest"], ["maintenanceReport"], "maintenanceTicket", "repairCrew"),
  createAcademyModule("engineRoomUpdate", "engine-room-update", 97, "Present Perfect Basics", ["engine", "systems", "status"], ["engineUpdate"], ["systemStatus"], "engineStatus", "engineRunner"),
  createAcademyModule("stormReports", "storm-reports", 103, "Past Continuous", ["storm", "weather", "incidents"], ["stormReport"], ["incidentSummary"], "stormLog", "stormReporter"),
  createAcademyModule("medicalBay", "medical-bay", 109, "Advice with Should", ["health", "injury", "advice"], ["medicalCall"], ["careAdvice"], "medicalNote", "medicalAssistant"),
  createAcademyModule("supplyRequest", "supply-request", 114, "Some / Any / Much / Many", ["supplies", "quantities", "requests"], ["supplyList"], ["supplyRequest"], "supplyForm", "supplyOfficer"),
  createAcademyModule("customsClearance", "customs-clearance", 120, "Formal Questions", ["customs", "documents", "inspection"], ["customsInterview"], ["formalAnswer"], "clearanceForm", "clearanceReady"),
  createAcademyModule("crewCoordination", "crew-coordination", 126, "Object Pronouns", ["teamwork", "tasks", "people"], ["teamBriefing"], ["taskAssignment"], "coordinationCheck", "crewCoordinator"),
  createAcademyModule("captainsOrders", "captains-orders", 131, "Modals", ["orders", "permission", "obligation"], ["captainBriefing"], ["orderResponse"], "ordersReview", "ordersOfficer"),
  createAcademyModule("routePlanning", "route-planning", 137, "Future with Going To", ["routes", "plans", "ports"], ["planningMeeting"], ["routePlan"], "routePlanReview", "routePlanner"),
  createAcademyModule("futureRoutes", "future-routes", 143, "Future Forms", ["future", "schedule", "arrival"], ["futureSchedule"], ["arrivalPlan"], "futureRouteBrief", "futureNavigator"),
  createAcademyModule("harborNegotiation", "harbor-negotiation", 148, "Comparatives", ["prices", "services", "choices"], ["harborOffer"], ["compareOptions"], "offerReview", "harborNegotiator"),
  createAcademyModule("fleetComparison", "fleet-comparison", 154, "Superlatives", ["fleet", "ships", "features"], ["fleetBrief"], ["shipComparison"], "fleetReview", "fleetAnalyst"),
  createAcademyModule("missionConditions", "mission-conditions", 160, "Conditionals", ["conditions", "mission", "decisions"], ["missionBriefing"], ["conditionalPlan"], "missionDecision", "missionPlanner"),
  createAcademyModule("shoreLeave", "shore-leave", 165, "Plans and Invitations", ["city", "freeTime", "invitations"], ["shorePlan"], ["invitationReply"], "shorePlanCheck", "shoreCoordinator"),
  createAcademyModule("incidentInvestigation", "incident-investigation", 171, "Past Perfect Awareness", ["evidence", "timeline", "incidents"], ["incidentInterview"], ["timelineReport"], "investigationFile", "incidentAnalyst"),
  createAcademyModule("rescueCoordination", "rescue-coordination", 177, "Giving Instructions", ["rescue", "coordination", "urgency"], ["rescueCall"], ["rescueInstruction"], "rescueProtocol", "rescueCoordinator"),
  createAcademyModule("diplomaticPortCall", "diplomatic-port-call", 182, "Polite Formal Language", ["diplomacy", "welcome", "protocol"], ["welcomeMessage"], ["formalGreeting"], "protocolReview", "portDiplomat"),
  createAcademyModule("advancedRadioRelay", "advanced-radio-relay", 188, "Reported Speech Basics", ["relay", "messages", "reports"], ["relayMessage"], ["messageRelay"], "relayAccuracy", "relayOfficer"),
  createAcademyModule("environmentalWatch", "environmental-watch", 194, "Cause and Effect", ["environment", "pollution", "prevention"], ["environmentReport"], ["causeReport"], "environmentChecklist", "ecoWatch"),
  createAcademyModule("securityPatrol", "security-patrol", 199, "Relative Clauses Basics", ["security", "areas", "people"], ["patrolBrief"], ["securityDescription"], "patrolReport", "securityPatrol"),
  createAcademyModule("internationalCrew", "international-crew", 205, "Cultural Communication", ["culture", "crew", "communication"], ["cultureBrief"], ["teamConversation"], "crewCultureCheck", "globalCrew"),
  createAcademyModule("technicalManuals", "technical-manuals", 211, "Passive Voice Awareness", ["manuals", "systems", "process"], ["manualInstruction"], ["processExplanation"], "manualReview", "manualReader"),
  createAcademyModule("leadershipBriefing", "leadership-briefing", 216, "Persuasion and Recommendations", ["leadership", "strategy", "recommendations"], ["leadershipBrief"], ["recommendation"], "leadershipReview", "teamLead"),
  createAcademyModule("crisisCommand", "crisis-command", 222, "Mixed Tenses in Context", ["crisis", "decisions", "updates"], ["crisisUpdate"], ["commandBrief"], "crisisSimulation", "crisisCommander"),
  createAcademyModule("fleetLogistics", "fleet-logistics", 228, "Complex Quantity and Scheduling", ["logistics", "fleet", "schedule"], ["logisticsReport"], ["scheduleBrief"], "logisticsPlan", "fleetLogistician"),
  createAcademyModule("oceanDiplomacy", "ocean-diplomacy", 233, "Negotiation Language", ["negotiation", "agreement", "ports"], ["agreementCall"], ["negotiateTerms"], "agreementDraft", "oceanDiplomat"),
  createAcademyModule("admiralStrategy", "admiral-strategy", 239, "Advanced Connectors", ["strategy", "risk", "planning"], ["strategyBrief"], ["strategicReport"], "strategyReview", "strategist"),
  createAcademyModule("masterCommand", "master-command", 245, "Integrated Communication", ["command", "leadership", "mission"], ["commandScenario"], ["missionCommand"], "commandAssessment", "masterCommander"),
  createAcademyModule("caplexyAdmiralty", "caplexy-admiralty", 250, "Capstone Review", ["admiralty", "career", "legacy"], ["admiraltyReview"], ["finalBriefing"], "admiraltyBoard", "admiraltyGraduate")
] as const satisfies AcademyModule[];

export type AcademyStatus = "locked" | "available" | "completed";

function createAcademyModule(
  key: string,
  slug: string,
  unlockRank: number,
  hiddenTopic: string,
  vocabularyThemes: string[],
  listeningActivities: string[],
  speakingActivities: string[],
  assessment: string,
  badge: string
): AcademyModule {
  return {
    key,
    slug,
    unlockRank,
    hiddenTopic,
    vocabularyThemes,
    listeningActivities,
    speakingActivities,
    assessment,
    badge
  };
}

export function getAcademyModuleBySlug(slug: string) {
  return academyModules.find((academyModule) => academyModule.slug === slug);
}

export function getAcademyModuleStatus(
  academyModule: AcademyModule | undefined,
  currentRankIndex: number
): AcademyStatus {
  if (!academyModule) {
    return "locked";
  }

  const moduleIndex = academyModules.findIndex(
    (item) => item.slug === academyModule.slug
  );
  const nextModule = moduleIndex >= 0 ? academyModules[moduleIndex + 1] : undefined;

  if (currentRankIndex < academyModule.unlockRank) {
    return "locked";
  }

  if (nextModule && currentRankIndex >= nextModule.unlockRank) {
    return "completed";
  }

  return "available";
}

export function getAcademyModuleProgress(
  academyModule: AcademyModule | undefined,
  currentRankIndex: number
) {
  if (!academyModule) {
    return 0;
  }

  const moduleIndex = academyModules.findIndex(
    (item) => item.slug === academyModule.slug
  );
  const nextModule = moduleIndex >= 0 ? academyModules[moduleIndex + 1] : undefined;
  const endRank = nextModule?.unlockRank ?? 250;

  if (currentRankIndex < academyModule.unlockRank) {
    return 0;
  }

  if (currentRankIndex >= endRank) {
    return 100;
  }

  const rankSpan = Math.max(1, endRank - academyModule.unlockRank);
  const rankProgress = currentRankIndex - academyModule.unlockRank + 1;

  return Math.min(99, Math.max(8, Math.floor((rankProgress / rankSpan) * 100)));
}

export function getUnlockedAcademyModules(currentRankIndex: number) {
  return academyModules.filter(
    (academyModule) => currentRankIndex >= academyModule.unlockRank
  );
}
