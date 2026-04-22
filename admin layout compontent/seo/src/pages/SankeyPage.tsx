import { useState, useEffect } from "react";
import { SankeyDiagram } from "@/components/sankey/SankeyDiagram";
import { SankeyControls } from "@/components/sankey/SankeyControls";
import { TouchpointScatter } from "@/components/sankey/TouchpointScatter";
import { TransitionTable } from "@/components/sankey/TransitionTable";
import { useSankeyData, useAvailableTags } from "@/hooks/useSankeyData";
import { SankeyFilters, DEFAULT_SANKEY_FILTERS } from "@/types/sankey";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, GitBranch, Sparkles, X } from "lucide-react";
import { SankeyContextData } from "@/components/ai/types";

// Extend window type for Sankey data exposure
declare global {
  interface Window {
    __TAGBASE_SANKEY_DATA__?: SankeyContextData;
  }
}

export default function SankeyPage() {
  const [filters, setFilters] = useState<SankeyFilters>(DEFAULT_SANKEY_FILTERS);
  const { data, isLoading, isEmpty, userId, isDemo, isStageMode, toggleDemo } = useSankeyData(filters);
  const { tags: availableTags, isLoading: tagsLoading } = useAvailableTags();

  // Mark customer journey as viewed for Getting Started tracking
  useEffect(() => {
    localStorage.setItem('tagbase_viewed_journey', 'true');
  }, []);

  // Expose Sankey data to window for AI access
  useEffect(() => {
    if (data && !isEmpty) {
      // Calculate stats for AI context
      const totalRecords = data.stats?.totalRecords || 
        data.nodes.reduce((sum, n) => sum + (n.recordCount || 0), 0);
      
      const avgDurationDays = data.transitions.length > 0
        ? data.transitions.reduce((sum, t) => sum + (t.avgDurationDays || 0), 0) / data.transitions.length
        : 0;
      
      const sankeyContext: SankeyContextData = {
        totalRecords,
        avgJourneyDurationMonths: Math.round((avgDurationDays / 30) * 10) / 10,
        transitionsCount: data.transitions.length,
        nodes: data.nodes.map(n => ({
          name: n.name,
          recordCount: n.recordCount,
          color: n.color,
        })),
        transitions: data.transitions.map(t => ({
          source: t.source,
          target: t.target,
          count: t.count,
          avgDurationDays: t.avgDurationDays,
          conversionRate: t.conversionRate,
        })),
      };
      
      window.__TAGBASE_SANKEY_DATA__ = sankeyContext;
    } else {
      window.__TAGBASE_SANKEY_DATA__ = undefined;
    }

    return () => {
      window.__TAGBASE_SANKEY_DATA__ = undefined;
    };
  }, [data, isEmpty]);

  // Not connected state - only show for Tag Journey mode (Stage Journey has demo)
  if (!userId && !isStageMode) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex flex-col items-center justify-center py-16">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Not Connected</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Please connect your HubSpot account to view customer journey data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 relative">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <GitBranch className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">Customer Journey</h1>
              {isDemo && (
                <Badge variant="secondary" className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Demo Data
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {isStageMode
                ? "Visualize how records progress through lifecycle stages"
                : "Visualize how records flow through your tags over time"}
            </p>
          </div>
        </div>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 dark:border-purple-800">
          <CardContent className="py-3">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                  Viewing Demo Stage Journey
                </p>
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  This is sample data showing a typical B2B sales funnel. Connect your HubSpot account and sync lifecycle stage data to see your real customer journey.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <SankeyControls
        filters={filters}
        onFiltersChange={setFilters}
        availableTags={availableTags}
        isLoading={isLoading || tagsLoading}
        isDemo={isDemo}
        onToggleDemo={toggleDemo}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardContent className="pt-6">
              <Skeleton className="h-[500px] w-full" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && isEmpty && (
        <Card className="py-16">
          <CardContent className="flex flex-col items-center justify-center">
            <GitBranch className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              {isStageMode ? "No Stage Journey Data Yet" : "No Journey Data Yet"}
            </h2>
            <p className="text-muted-foreground text-center max-w-md mb-4">
              {isStageMode ? (
                <>
                  Stage journeys will appear here once you sync lifecycle stage data.
                  Click <strong>"View Demo"</strong> above to see an example visualization.
                </>
              ) : (
                <>
                  Customer journeys will appear here once you start tagging records
                  in HubSpot. Each tag action is tracked to build journey flows.
                </>
              )}
            </p>
            <div className="text-sm text-muted-foreground bg-muted rounded-lg p-4 max-w-lg">
              <p className="font-medium mb-2">
                {isStageMode ? "What you'll see:" : "How it works:"}
              </p>
              <ol className="list-decimal list-inside space-y-1">
                {isStageMode ? (
                  <>
                    <li>Contacts progressing through lifecycle stages</li>
                    <li>Deals moving through pipeline stages</li>
                    <li>Tickets transitioning through support stages</li>
                    <li>Visual flow showing conversion rates and drop-offs</li>
                  </>
                ) : (
                  <>
                    <li>Apply tags to contacts, companies, deals, or tickets</li>
                    <li>As records progress, add new tags to track their journey</li>
                    <li>The Sankey diagram shows how records flow between tags</li>
                    <li>Use filters to focus on specific conversion paths</li>
                  </>
                )}
              </ol>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sankey Diagram, Touchpoint Scatter, and Transition Table */}
      {!isLoading && data && !isEmpty && (
        <>
          <SankeyDiagram data={data} />
          <TransitionTable data={data} />
          <TouchpointScatter data={data} />
        </>
      )}
    </div>
  );
}

