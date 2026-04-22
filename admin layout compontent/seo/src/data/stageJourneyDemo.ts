// Demo data for Stage Journey visualization
// This provides sample data to demonstrate the Sankey diagram layout

import { SankeyData } from "@/types/sankey";

// Demo Stage Journey data showing a typical B2B sales funnel
export const STAGE_JOURNEY_DEMO_DATA: SankeyData = {
    nodes: [
        { name: "Website Visitor", color: "#64748b" },
        { name: "Lead", color: "#3b82f6" },
        { name: "MQL", color: "#8b5cf6" },
        { name: "SQL", color: "#06b6d4" },
        { name: "Opportunity", color: "#f59e0b" },
        { name: "Negotiation", color: "#ec4899" },
        { name: "Closed Won", color: "#22c55e" },
        { name: "Closed Lost", color: "#ef4444" },
    ],
    transitions: [
        // Website Visitor → Lead
        {
            source: "Website Visitor",
            target: "Lead",
            count: 1200,
            totalDurationMs: 86400000 * 3, // 3 days
            avgDurationMs: 86400000 * 3,
            avgDurationDays: 3,
            conversionRate: 60
        },
        // Lead → MQL
        {
            source: "Lead",
            target: "MQL",
            count: 720,
            totalDurationMs: 86400000 * 7,
            avgDurationMs: 86400000 * 7,
            avgDurationDays: 7,
            conversionRate: 60
        },
        // Lead → Closed Lost (early drop-off)
        {
            source: "Lead",
            target: "Closed Lost",
            count: 180,
            totalDurationMs: 86400000 * 14,
            avgDurationMs: 86400000 * 14,
            avgDurationDays: 14,
            conversionRate: 15
        },
        // MQL → SQL
        {
            source: "MQL",
            target: "SQL",
            count: 432,
            totalDurationMs: 86400000 * 5,
            avgDurationMs: 86400000 * 5,
            avgDurationDays: 5,
            conversionRate: 60
        },
        // MQL → Closed Lost
        {
            source: "MQL",
            target: "Closed Lost",
            count: 108,
            totalDurationMs: 86400000 * 10,
            avgDurationMs: 86400000 * 10,
            avgDurationDays: 10,
            conversionRate: 15
        },
        // SQL → Opportunity
        {
            source: "SQL",
            target: "Opportunity",
            count: 324,
            totalDurationMs: 86400000 * 10,
            avgDurationMs: 86400000 * 10,
            avgDurationDays: 10,
            conversionRate: 75
        },
        // SQL → Closed Lost
        {
            source: "SQL",
            target: "Closed Lost",
            count: 54,
            totalDurationMs: 86400000 * 21,
            avgDurationMs: 86400000 * 21,
            avgDurationDays: 21,
            conversionRate: 12.5
        },
        // Opportunity → Negotiation
        {
            source: "Opportunity",
            target: "Negotiation",
            count: 243,
            totalDurationMs: 86400000 * 14,
            avgDurationMs: 86400000 * 14,
            avgDurationDays: 14,
            conversionRate: 75
        },
        // Opportunity → Closed Lost
        {
            source: "Opportunity",
            target: "Closed Lost",
            count: 40,
            totalDurationMs: 86400000 * 30,
            avgDurationMs: 86400000 * 30,
            avgDurationDays: 30,
            conversionRate: 12.3
        },
        // Negotiation → Closed Won
        {
            source: "Negotiation",
            target: "Closed Won",
            count: 170,
            totalDurationMs: 86400000 * 21,
            avgDurationMs: 86400000 * 21,
            avgDurationDays: 21,
            conversionRate: 70
        },
        // Negotiation → Closed Lost
        {
            source: "Negotiation",
            target: "Closed Lost",
            count: 73,
            totalDurationMs: 86400000 * 28,
            avgDurationMs: 86400000 * 28,
            avgDurationDays: 28,
            conversionRate: 30
        },
    ],
    stats: {
        totalRecords: 1200,
        avgJourneyDurationMs: 86400000 * 45, // 45 days average
        avgJourneyDurationDays: 45,
        avgJourneyDurationMonths: 1.5,
    }
};

// Function to check if we should show demo data
export function shouldShowStageJourneyDemo(userId: string | undefined, isStageMode: boolean): boolean {
    // Show demo when in stage mode and no real data (or for demo purposes)
    return isStageMode && !userId;
}
