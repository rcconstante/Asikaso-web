// Sankey Diagram Types

export type TimeframeOption = "7days" | "14days" | "30days" | "3months" | "6months" | "12months" | "all" | "custom";

export type ObjectTypeFilter = "contacts" | "companies" | "deals" | "tickets" | "all";

// Journey tracking mode
export type JourneyMode = "tags" | "stages";

export interface SankeyNode {
  name: string;
  color: string;
  recordCount?: number; // Total records that have this tag (for proper funnel visualization)
}

export interface SankeyTransition {
  source: string;
  target: string;
  count: number;
  totalDurationMs: number;
  avgDurationMs: number;
  avgDurationDays: number;
  sourceColor?: string;
  targetColor?: string;
  // Conversion rate percentage (for stages mode)
  conversionRate?: number;
}

export interface SankeyStats {
  totalRecords: number;
  avgJourneyDurationMs: number;
  avgJourneyDurationDays: number;
  avgJourneyDurationMonths: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  transitions: SankeyTransition[];
  stats: SankeyStats;
}

export interface SankeyFilters {
  journeyMode: JourneyMode;
  timeframe: TimeframeOption;
  objectType: ObjectTypeFilter;
  conversionTag: string | null;
  minTransitions: number;
  includeOnlyTags: string[];
  // Custom date range (used when timeframe is "custom")
  customDateRange?: {
    startDate: Date;
    endDate: Date;
  };
  // Advanced filter: Only show records that got a specific tag within a specific timeframe
  tagInTimeframe?: {
    tagName: string;
    startDate: Date;
    endDate: Date;
  };
}

export const DEFAULT_SANKEY_FILTERS: SankeyFilters = {
  journeyMode: "tags",
  timeframe: "12months",
  objectType: "contacts",
  conversionTag: null,
  minTransitions: 1,
  includeOnlyTags: [],
  customDateRange: undefined,
  tagInTimeframe: undefined,
};

// Helper to convert timeframe to date range
export function getDateRangeFromTimeframe(
  timeframe: TimeframeOption,
  customDateRange?: { startDate: Date; endDate: Date }
): {
  startDate: number | undefined;
  endDate: number | undefined;
} {
  const now = Date.now();
  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerMonth = 30 * msPerDay;

  switch (timeframe) {
    case "7days":
      return { startDate: now - 7 * msPerDay, endDate: now };
    case "14days":
      return { startDate: now - 14 * msPerDay, endDate: now };
    case "30days":
      return { startDate: now - 30 * msPerDay, endDate: now };
    case "3months":
      return { startDate: now - 3 * msPerMonth, endDate: now };
    case "6months":
      return { startDate: now - 6 * msPerMonth, endDate: now };
    case "12months":
      return { startDate: now - 12 * msPerMonth, endDate: now };
    case "custom":
      if (customDateRange) {
        return {
          startDate: customDateRange.startDate.getTime(),
          endDate: customDateRange.endDate.getTime(),
        };
      }
      return { startDate: undefined, endDate: undefined };
    case "all":
      return { startDate: undefined, endDate: undefined };
  }
}

// Format duration for display
export function formatDuration(days: number): string {
  if (days < 1) {
    const hours = Math.round(days * 24);
    return hours <= 1 ? "< 1 hour" : `${hours} hours`;
  }
  if (days < 7) {
    return `${Math.round(days)} day${Math.round(days) !== 1 ? "s" : ""}`;
  }
  if (days < 30) {
    const weeks = Math.round(days / 7);
    return `${weeks} week${weeks !== 1 ? "s" : ""}`;
  }
  const months = Math.round(days / 30 * 10) / 10;
  return `${months} month${months !== 1 ? "s" : ""}`;
}
