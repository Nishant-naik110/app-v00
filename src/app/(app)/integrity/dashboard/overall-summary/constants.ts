// ============================================================================
// COLOR PALETTE
// ============================================================================

export const COLOR_PALETTE = [
  "#5DADEC",
  "#FF7F0E",
  "#9B59B6",
  "#FF0000",
  "#b91c1c",
  "#604652",
  "#1E90FF",
  "#FFD700",
  "#FF69B4",
  "#8A2BE2",
  "#FF7F50",
  "#20B2AA",
  "#DC143C",
  "#00CED1",
  "#FF4500",
  "#2E8B57",
  "#DAA520",
  "#4B0082",
  "#7FFF00",
  "#D2691E",
  "#6495ED",
  "#FF6347",
  "#40E0D0",
  "#A0522D",
  "#C71585",
  "#BDB76B",
  "#4682B4",
  "#9ACD32",
  "#008B8B",
  "#B22222",
  "#5F9EA0",
  "#9932CC",
] as const;

export const CHART_COLORS = [
  "#8b5cf6",
  "#a855f7",
  "#c084fc",
  "#f59e42",
  "#00A86B",
  "#FF0000",
  "#D49B54",
  "#2563eb",
  "#f97316",
  "#84cc16",
  "#0d9488",
  "#9333ea",
  "#ef4444",
  "#e76e50",
  "#2a9d90",
  "#a8a032",
  "#274754",
  "#e8c468",
  "#2dc048",
  "#d97706",
  "#0ea5e9",
  "#c2410c",
  "#f59e42",
  "#d8b4fe",
  "#e9d5ff",
  "#f3e8ff",
  "#a855f7",
  "#c084fc",
  "#f59e42",
  "#8b5cf6",
] as const;

// ============================================================================
// FREQUENCY MAPPINGS
// ============================================================================

export const DW_TREND_FREQUENCY_MAP: Record<string, string> = {
  Daily: "daily",
  Weekly: "weekly",
  Monthly: "monthly",
};

export const DW_TREND_SELECT_OPTIONS = ["Daily", "Weekly", "Monthly"] as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getPercentageKey = (sourceType: string): string => {
  switch (sourceType) {
    case "Blocked":
      return "percentage";
    case "Forwarded":
      return "percentage";
    default:
      return "percentage";
  }
};

// ============================================================================
// DEFAULT VALUES
// ============================================================================

export const DEFAULT_FILTER_QUERY = {
  publishers: ["all"],
  campaigns: ["all"],
  country: ["all"],
} as const;

export const DEFAULT_PUBLISHER_DATA = {
  Affiliate: [],
  "Whitelisted Affiliate": [""],
  "Whitelisted Publisher": [],
} as const;

