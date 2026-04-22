import { useMemo } from "react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SankeyData } from "@/types/sankey";
import { format } from "date-fns";

interface TouchpointScatterProps {
  data: SankeyData;
  className?: string;
}

// Custom tooltip for scatter plot
function CustomTooltip({ active, payload }: { active?: boolean; payload?: any[] }) {
  if (!active || !payload || payload.length === 0) return null;

  const data = payload[0]?.payload;
  if (!data) return null;

  return (
    <div className="rounded-lg border bg-popover p-3 text-popover-foreground shadow-md">
      <div className="font-medium">{data.tagName}</div>
      <div className="mt-1 text-sm text-muted-foreground">
        <div>Records: {data.count}</div>
        <div>Avg Duration: {data.avgDurationMonths.toFixed(1)} months</div>
      </div>
    </div>
  );
}

export function TouchpointScatter({ data, className }: TouchpointScatterProps) {
  // Transform data for scatter plot
  const scatterData = useMemo(() => {
    if (!data || data.transitions.length === 0) return [];

    // Calculate tag statistics
    const tagStats = new Map<string, { count: number; totalDuration: number; color: string }>();

    // Aggregate data from transitions
    data.transitions.forEach((t) => {
      // Source tag
      if (!tagStats.has(t.source)) {
        const node = data.nodes.find((n) => n.name === t.source);
        tagStats.set(t.source, { count: 0, totalDuration: 0, color: node?.color || "#6b7280" });
      }
      const sourceStats = tagStats.get(t.source)!;
      sourceStats.count += t.count;
      sourceStats.totalDuration += t.avgDurationDays * t.count;

      // Target tag
      if (!tagStats.has(t.target)) {
        const node = data.nodes.find((n) => n.name === t.target);
        tagStats.set(t.target, { count: 0, totalDuration: 0, color: node?.color || "#6b7280" });
      }
      const targetStats = tagStats.get(t.target)!;
      targetStats.count += t.count;
      targetStats.totalDuration += t.avgDurationDays * t.count;
    });

    // Convert to scatter plot format
    const points = Array.from(tagStats.entries()).map(([tagName, stats]) => ({
      tagName,
      count: stats.count,
      avgDurationDays: stats.count > 0 ? stats.totalDuration / stats.count : 0,
      avgDurationMonths: stats.count > 0 ? (stats.totalDuration / stats.count) / 30 : 0,
      color: stats.color,
    }));

    // Calculate min and max counts for size scaling
    const counts = points.map(p => p.count);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    // Add size with better scaling (smaller range means more visible differences)
    return points.map((point, index) => {
      // Use logarithmic scale for better visual differentiation
      // Range: 200 (smallest) to 1500 (largest)
      let size;
      if (maxCount === minCount) {
        size = 600; // All same size if all have same count
      } else {
        // Logarithmic scale for better distribution
        const logMin = Math.log(minCount + 1);
        const logMax = Math.log(maxCount + 1);
        const logValue = Math.log(point.count + 1);
        const normalized = (logValue - logMin) / (logMax - logMin);
        size = 200 + normalized * 1300; // Range from 200 to 1500
      }

      return {
        ...point,
        x: index,
        size,
      };
    });
  }, [data]);

  if (scatterData.length === 0) {
    return null;
  }

  // Calculate avg touchpoint cycle from actual data if stats is 0
  const avgTouchpointCycle = data.stats.avgJourneyDurationMonths > 0
    ? data.stats.avgJourneyDurationMonths
    : scatterData.reduce((sum, p) => sum + p.avgDurationMonths, 0) / scatterData.length;

  // Get min and max sizes for ZAxis range
  const minSize = Math.min(...scatterData.map(d => d.size));
  const maxSize = Math.max(...scatterData.map(d => d.size));

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">Tag Touchpoint Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Average Touchpoint Cycle */}
        <div className="mb-4 text-center">
          <div className="text-sm text-muted-foreground">
            Average Touchpoint Cycle: <span className="font-semibold text-foreground">{avgTouchpointCycle.toFixed(1)} months</span>
          </div>
        </div>

        {/* Scatter Chart */}
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={{ top: 20, right: 40, bottom: 60, left: 80 }}
            >
              <XAxis
                type="number"
                dataKey="avgDurationMonths"
                name="Months"
                domain={[0, 'auto']}
                tickFormatter={(value) => value.toFixed(1)}
                tick={{ fontSize: 11 }}
                label={{ value: "Avg Duration (Months)", position: "insideBottom", offset: -10, fontSize: 12 }}
              />
              <YAxis
                type="number"
                dataKey="count"
                name="Records"
                domain={[0, 'auto']}
                tick={{ fontSize: 11 }}
                width={70}
                label={{ value: "Number of Records", angle: -90, position: "insideLeft", offset: 10, fontSize: 12 }}
              />
              <ZAxis
                type="number"
                dataKey="size"
                range={[minSize, maxSize]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData}>
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} opacity={0.75} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Legend showing size meaning */}
        <div className="mt-4 text-xs text-muted-foreground text-center">
          Circle size represents the number of records (larger = more records)
        </div>
      </CardContent>
    </Card>
  );
}
