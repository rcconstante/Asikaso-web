import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { useMemo, useState } from "react";
import {
  SankeyFilters,
  SankeyData,
  DEFAULT_SANKEY_FILTERS,
  getDateRangeFromTimeframe,
} from "@/types/sankey";
import { STAGE_JOURNEY_DEMO_DATA } from "@/data/stageJourneyDemo";

export function useSankeyData(filters: SankeyFilters = DEFAULT_SANKEY_FILTERS) {
  const { connectionStatus } = useHubSpot();
  const userId = connectionStatus.portalId || "";
  const [showDemo, setShowDemo] = useState(false);

  // Calculate date range from timeframe (including custom date range support)
  const { startDate, endDate } = useMemo(
    () => getDateRangeFromTimeframe(filters.timeframe, filters.customDateRange),
    [filters.timeframe, filters.customDateRange]
  );

  // Fetch tag-based journey data from Convex
  const tagData = useQuery(
    api.sankeyData.getAggregatedTransitions,
    filters.journeyMode === "tags" && userId
      ? {
        userId,
        objectType: filters.objectType === "all" ? undefined : filters.objectType,
        startDate,
        endDate,
        conversionTagName: filters.conversionTag || undefined,
        minTransitions: filters.minTransitions,
      }
      : "skip"
  );

  // Fetch stage-based journey data from Convex
  const stageData = useQuery(
    api.stageJourney.getStageTransitions,
    filters.journeyMode === "stages" && userId
      ? {
        userId,
        objectType: filters.objectType === "all" ? "contacts" : filters.objectType,
        startDate,
        endDate,
        minTransitions: filters.minTransitions,
      }
      : "skip"
  );

  // Select the right data based on mode
  const rawData = filters.journeyMode === "tags" ? tagData : stageData;

  // Process and filter data
  const sankeyData: SankeyData | null = useMemo(() => {
    // For Stage Journey mode: handle demo mode toggle
    if (filters.journeyMode === "stages") {
      // If user explicitly requested demo mode, show demo data
      if (showDemo) {
        return STAGE_JOURNEY_DEMO_DATA;
      }

      // Otherwise, show real data if available
      if (rawData && rawData.transitions && rawData.transitions.length > 0) {
        return rawData;
      }

      // No real data available and not in demo mode - return null to show empty state
      return null;
    }

    if (!rawData) return null;

    let { nodes, transitions, stats } = rawData;

    // Apply "include only tags" filter if specified (only for tag mode)
    if (filters.journeyMode === "tags" && filters.includeOnlyTags.length > 0) {
      const includedSet = new Set(filters.includeOnlyTags);
      transitions = transitions.filter(
        (t) => includedSet.has(t.source) || includedSet.has(t.target)
      );

      // Rebuild nodes based on filtered transitions
      const nodeSet = new Set<string>();
      for (const t of transitions) {
        nodeSet.add(t.source);
        nodeSet.add(t.target);
      }
      nodes = nodes.filter((n) => nodeSet.has(n.name));
    }

    return { nodes, transitions, stats };
  }, [rawData, filters.includeOnlyTags, filters.journeyMode, showDemo, stageData]);

  // Check if we're loading - only loading when we expect data but haven't received it yet
  // For stage mode, we're loading if stageData is undefined and we're not in demo mode
  const isLoading = filters.journeyMode === "stages"
    ? userId && stageData === undefined && !showDemo
    : userId && rawData === undefined && !showDemo;

  // Check if there's no data - true when not in demo and either no sankeyData or no transitions
  const isEmpty = !showDemo && (!sankeyData || !sankeyData.transitions || sankeyData.transitions.length === 0);

  // Check if showing demo data
  const isDemo = showDemo && filters.journeyMode === "stages";

  return {
    data: sankeyData,
    isLoading,
    isEmpty,
    userId,
    isStageMode: filters.journeyMode === "stages",
    isDemo,
    toggleDemo: () => setShowDemo(prev => !prev),
  };
}

// Hook for advanced filter: records with specific tag in specific timeframe
export function useSankeyDataByTagInTimeframe(
  tagName: string,
  startDate: Date,
  endDate: Date,
  objectType?: string
) {
  const { connectionStatus } = useHubSpot();
  const userId = connectionStatus.portalId || "";

  const rawData = useQuery(
    api.sankeyData.getSankeyDataByTagInTimeframe,
    userId && tagName
      ? {
        userId,
        filterTagName: tagName,
        filterStartDate: startDate.getTime(),
        filterEndDate: endDate.getTime(),
        objectType,
      }
      : "skip"
  );

  return {
    data: rawData,
    isLoading: userId && tagName && rawData === undefined,
  };
}

// Hook to get available tags for filter dropdowns
export function useAvailableTags() {
  const { connectionStatus } = useHubSpot();
  const userId = connectionStatus.portalId || "";

  const tags = useQuery(api.tags.getTags, userId ? { userId } : "skip");

  return {
    tags: tags || [],
    isLoading: userId && tags === undefined,
  };
}
