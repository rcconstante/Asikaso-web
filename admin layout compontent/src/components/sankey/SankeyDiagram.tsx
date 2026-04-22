import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { sankey, sankeyLinkHorizontal, sankeyLeft } from "d3-sankey";
import { SankeyData, formatDuration } from "@/types/sankey";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, ArrowRight, Info, Maximize2, Minimize2, ZoomIn, ZoomOut, Move, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface SankeyDiagramProps {
  data: SankeyData;
  className?: string;
}

// Type definitions for d3-sankey
interface SankeyNodeDatum {
  name: string;
  color: string;
  value?: number;
  recordCount?: number; // Total records with this tag
  index?: number;
  x0?: number;
  x1?: number;
  y0?: number;
  y1?: number;
  sourceLinks?: SankeyLinkDatum[];
  targetLinks?: SankeyLinkDatum[];
  depth?: number;
}

interface SankeyLinkDatum {
  source: number | SankeyNodeDatum;
  target: number | SankeyNodeDatum;
  value: number;
  count: number;
  avgDurationDays: number;
  sourceName: string;
  targetName: string;
  conversionRate?: number;
  sourceColor?: string;
  targetColor?: string;
  width?: number;
  y0?: number;
  y1?: number;
}

// Custom tooltip state
interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  data: {
    type: 'node' | 'link';
    sourceName?: string;
    targetName?: string;
    count?: number;
    avgDurationDays?: number;
    conversionRate?: number;
    nodeName?: string;
    nodeValue?: number;
  } | null;
}

export function SankeyDiagram({ data, className }: SankeyDiagramProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, data: null });
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Diagram dimensions
  const width = 1200;
  const height = 550;
  const margin = { top: 40, right: 180, bottom: 40, left: 180 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Prevent page scroll when mouse is over the diagram
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom(z => Math.max(0.3, Math.min(3, z + delta)));
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Transform data for D3 Sankey format with proper node layering
  const chartData = useMemo(() => {
    if (!data || data.nodes.length === 0) return null;

    // Create a set of valid node names for quick lookup
    const nodeNameSet = new Set<string>(data.nodes.map(n => n.name));

    // Build links - filter invalid ones first
    let links = data.transitions
      .filter((t) => {
        if (!nodeNameSet.has(t.source) || !nodeNameSet.has(t.target)) return false;
        if (t.source === t.target) return false;
        if (t.count <= 0) return false;
        return true;
      })
      .map((t) => ({
        sourceName: t.source,
        targetName: t.target,
        value: Math.max(1, t.count),
        count: t.count,
        avgDurationDays: t.avgDurationDays || 0,
        conversionRate: t.conversionRate,
        // Capture transition colors for fallback
        sourceColor: t.sourceColor,
        targetColor: t.targetColor,
      }));

    /**
     * Smart Cycle Breaking Algorithm
     * 
     * Problem: Customer journeys naturally contain cycles (e.g., Customer → Lead → Customer)
     * because people can move backward through stages. However, Sankey diagrams are DAG-based
     * (Directed Acyclic Graphs) and cannot render cycles without causing infinite loops.
     * 
     * Solution: Use a greedy algorithm to create a valid DAG while preserving maximum information:
     * 1. Sort all transitions by record count (descending) - prioritize high-volume paths
     * 2. Add edges one-by-one, checking if each creates a cycle using BFS
     * 3. Keep edges that don't create cycles, skip those that do
     * 4. Track removed edges to inform users about hidden backward flows
     */
    type TempLink = typeof links[number];

    const breakCyclesSmartly = (inputLinks: TempLink[]): { validLinks: TempLink[]; removedLinks: TempLink[] } => {
      // Sort by count descending (prioritize high-volume paths)
      const sortedLinks = [...inputLinks].sort((a, b) => b.count - a.count);

      const validLinks: TempLink[] = [];
      const removedLinks: TempLink[] = [];
      const adjacency = new Map<string, Set<string>>();

      // BFS to check if adding an edge would create a cycle
      const wouldCreateCycle = (source: string, target: string): boolean => {
        // If adding source -> target, check if there's already a path target -> source
        const visited = new Set<string>();
        const queue = [target];

        while (queue.length > 0) {
          const current = queue.shift()!;
          if (current === source) return true; // Found a path back to source
          if (visited.has(current)) continue;
          visited.add(current);

          const neighbors = adjacency.get(current);
          if (neighbors) {
            for (const neighbor of neighbors) {
              if (!visited.has(neighbor)) {
                queue.push(neighbor);
              }
            }
          }
        }
        return false;
      };

      for (const link of sortedLinks) {
        if (!wouldCreateCycle(link.sourceName, link.targetName)) {
          validLinks.push(link);

          // Add to adjacency list
          if (!adjacency.has(link.sourceName)) {
            adjacency.set(link.sourceName, new Set());
          }
          adjacency.get(link.sourceName)!.add(link.targetName);
        } else {
          removedLinks.push(link);
        }
      }

      return { validLinks, removedLinks };
    };

    const { validLinks, removedLinks } = breakCyclesSmartly(links);
    links = validLinks;

    // Find all connected nodes
    const connectedNodeNames = new Set<string>();
    links.forEach(link => {
      connectedNodeNames.add(link.sourceName);
      connectedNodeNames.add(link.targetName);
    });

    // Filter nodes to only connected ones, preserving recordCount
    const connectedNodes: SankeyNodeDatum[] = data.nodes
      .filter(node => connectedNodeNames.has(node.name))
      .map(node => ({
        name: node.name,
        color: node.color || '#6b7280', // Ensure color is always set
        recordCount: node.recordCount, // Total records with this tag
      }));

    // Create a comprehensive color map from multiple sources
    const nodeColorMap = new Map<string, string>();

    // First, add colors from nodes
    data.nodes.forEach(node => {
      if (node.color) {
        nodeColorMap.set(node.name, node.color);
      }
    });

    // Then, add colors from transitions (as fallback for nodes without explicit colors)
    data.transitions.forEach(t => {
      if (t.sourceColor && !nodeColorMap.has(t.source)) {
        nodeColorMap.set(t.source, t.sourceColor);
      }
      if (t.targetColor && !nodeColorMap.has(t.target)) {
        nodeColorMap.set(t.target, t.targetColor);
      }
    });

    // Finally, ensure all connected nodes have a color (fallback to gray)
    connectedNodeNames.forEach(nodeName => {
      if (!nodeColorMap.has(nodeName)) {
        nodeColorMap.set(nodeName, '#6b7280');
      }
    });

    if (connectedNodes.length === 0 || links.length === 0) {
      return null;
    }

    // Create the D3 sankey generator with LEFT alignment for proper left-to-right flow
    // IMPORTANT: Don't use nodeId - use numeric indices instead for reliability
    const sankeyGenerator = sankey<SankeyNodeDatum, SankeyLinkDatum>()
      .nodeWidth(20)
      .nodePadding(25)
      .nodeAlign(sankeyLeft) // LEFT alignment ensures sources are on the left
      .extent([[0, 0], [innerWidth, innerHeight]]);

    // Create node name to index map for the connected nodes
    const nodeNameToIndex = new Map<string, number>();
    connectedNodes.forEach((node, idx) => {
      nodeNameToIndex.set(node.name, idx);
    });

    // Convert links to use numeric indices
    const sankeyLinks: SankeyLinkDatum[] = links.map(link => ({
      source: nodeNameToIndex.get(link.sourceName)!,
      target: nodeNameToIndex.get(link.targetName)!,
      value: link.value,
      count: link.count,
      avgDurationDays: link.avgDurationDays,
      sourceName: link.sourceName,
      targetName: link.targetName,
      conversionRate: link.conversionRate,
    })).filter(link => link.source !== undefined && link.target !== undefined);

    // Generate the sankey layout
    const sankeyData = sankeyGenerator({
      nodes: connectedNodes.map(n => ({ ...n })),
      links: sankeyLinks,
    });

    // Calculate total records (sum of values from all source nodes at depth 0)
    const totalRecords = data.stats?.totalRecords ||
      sankeyData.nodes
        .filter(n => n.depth === 0)
        .reduce((sum, n) => sum + (n.value || 0), 0) ||
      Math.max(...sankeyData.nodes.map(n => n.value || 0));

    // Calculate total transitions for link percentage calculations
    const totalTransitions = sankeyLinks.reduce((sum, link) => sum + link.value, 0);

    // Build node record counts map for looking up total records per tag
    const nodeRecordCounts = new Map<string, number>();
    connectedNodes.forEach(node => {
      if (node.recordCount !== undefined) {
        nodeRecordCounts.set(node.name, node.recordCount);
      }
    });

    // Calculate max record count for percentage calculations
    const maxRecordCount = Math.max(...Array.from(nodeRecordCounts.values()), 1);

    return {
      nodes: sankeyData.nodes,
      links: sankeyData.links,
      nodeColorMap, // Include color map for rendering
      nodeRecordCounts, // Total records per tag (for proper funnel display)
      maxRecordCount, // For percentage calculations
      totalRecords, // For node percentage calculations
      totalTransitions, // For link percentage calculations
      removedCycles: removedLinks.length,
      removedTransitions: removedLinks.map(link => ({
        source: link.sourceName,
        target: link.targetName,
        count: link.count,
      })),
    };
  }, [data, innerWidth, innerHeight]);

  // Generate curved link path
  const linkPathGenerator = sankeyLinkHorizontal<SankeyNodeDatum, SankeyLinkDatum>();

  // Handle tooltip display - now includes recordCount for total records with this tag
  const handleNodeMouseEnter = useCallback((e: React.MouseEvent, node: SankeyNodeDatum) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect || !chartData) return;

    const totalRecordsWithTag = chartData.nodeRecordCounts.get(node.name) || node.value || 0;

    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      data: {
        type: 'node',
        nodeName: node.name,
        nodeValue: totalRecordsWithTag, // Use recordCount for total records
      }
    });
  }, [chartData]);

  const handleLinkMouseEnter = useCallback((e: React.MouseEvent, link: SankeyLinkDatum) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;

    const source = link.source as SankeyNodeDatum;
    const target = link.target as SankeyNodeDatum;

    setTooltip({
      visible: true,
      x: e.clientX - rect.left + 10,
      y: e.clientY - rect.top - 10,
      data: {
        type: 'link',
        sourceName: source.name,
        targetName: target.name,
        count: link.count,
        avgDurationDays: link.avgDurationDays,
        conversionRate: link.conversionRate,
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setTooltip({ visible: false, x: 0, y: 0, data: null });
  }, []);

  if (!chartData || chartData.links.length === 0) {
    return (
      <Card className={cn("flex flex-col items-center justify-center py-12", className)}>
        <Info className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg font-medium text-muted-foreground">
          No journey data available
        </p>
        <p className="text-sm text-muted-foreground mt-2 text-center max-w-md">
          Start tagging records in HubSpot to see customer journey flows here.
          The Sankey diagram shows how records move between tags over time.
        </p>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.stats.totalRecords}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average Journey Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">
                {data.stats.avgJourneyDurationMonths > 0
                  ? `${data.stats.avgJourneyDurationMonths} months`
                  : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tag Transitions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{data.transitions.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Average Touchpoint Cycle Badge */}
      {data.stats.avgJourneyDurationMonths > 0 && (
        <div className="flex justify-center">
          <Badge variant="outline" className="text-base px-4 py-2">
            <Clock className="h-4 w-4 mr-2" />
            Average Touchpoint Cycle: {data.stats.avgJourneyDurationMonths} months
          </Badge>
        </div>
      )}

      {/* Cycle Warning - Show when backward flows are hidden */}
      {chartData.removedCycles > 0 && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950 dark:border-blue-800">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {chartData.removedCycles} backward flow{chartData.removedCycles > 1 ? 's' : ''} hidden
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Sankey diagrams show forward-only flows. Your data contains {chartData.removedCycles} transition{chartData.removedCycles > 1 ? 's' : ''} where records moved backward (e.g., Customer → Lead).
                  These are hidden to prevent circular paths, but represent real customer behavior worth investigating.
                </p>
                {chartData.removedTransitions.length > 0 && (
                  <details className="text-xs text-blue-600 dark:text-blue-400">
                    <summary className="cursor-pointer hover:underline font-medium">
                      View hidden transitions
                    </summary>
                    <ul className="mt-2 space-y-1 ml-4">
                      {chartData.removedTransitions.slice(0, 10).map((t, i) => (
                        <li key={i}>
                          {t.source} → {t.target} ({t.count} record{t.count > 1 ? 's' : ''})
                        </li>
                      ))}
                      {chartData.removedTransitions.length > 10 && (
                        <li className="italic">
                          ...and {chartData.removedTransitions.length - 10} more
                        </li>
                      )}
                    </ul>
                  </details>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sankey Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base font-medium">Journey Flow</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.max(0.3, z - 0.2))}
              disabled={zoom <= 0.3}
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setZoom(z => Math.min(3, z + 0.2))}
              disabled={zoom >= 3}
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
              title="Reset View"
            >
              <Move className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // Export to PNG
                const svgElement = svgRef.current;
                if (!svgElement) {
                  toast.error('No chart to export');
                  return;
                }

                // Clone the SVG to avoid modifying the original
                const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

                // Add white background for PNG
                const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                bgRect.setAttribute('width', '100%');
                bgRect.setAttribute('height', '100%');
                bgRect.setAttribute('fill', '#0f172a'); // Dark background
                svgClone.insertBefore(bgRect, svgClone.firstChild);

                // Serialize SVG to string
                const svgData = new XMLSerializer().serializeToString(svgClone);
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const svgUrl = URL.createObjectURL(svgBlob);

                // Create canvas and draw SVG
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const img = new Image();

                img.onload = () => {
                  canvas.width = img.width * 2; // 2x for high DPI
                  canvas.height = img.height * 2;
                  ctx!.scale(2, 2);
                  ctx!.drawImage(img, 0, 0);

                  // Convert to PNG and download
                  const pngUrl = canvas.toDataURL('image/png');
                  const downloadLink = document.createElement('a');
                  downloadLink.href = pngUrl;
                  downloadLink.download = `sankey-diagram-${new Date().toISOString().split('T')[0]}.png`;
                  downloadLink.click();

                  URL.revokeObjectURL(svgUrl);
                  toast.success('Chart exported as PNG');
                };

                img.src = svgUrl;
              }}
              title="Export as PNG"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setIsFullscreen(!isFullscreen);
                if (!isFullscreen) {
                  containerRef.current?.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div
            ref={containerRef}
            className={cn(
              "relative overflow-hidden border rounded-lg bg-card cursor-grab active:cursor-grabbing",
              isFullscreen && "h-screen"
            )}
            style={{ height: isFullscreen ? "100vh" : "650px", width: "100%" }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            }}
            onMouseMove={(e) => {
              if (isDragging) {
                setPan({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y,
                });
              }
            }}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
          >
            <div
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "center center",
                width: "100%",
                height: "100%",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
            >
              <svg
                ref={svgRef}
                data-sankey-diagram
                width={width}
                height={height}
                viewBox={`0 0 ${width} ${height}`}
                style={{ display: "block", margin: "0 auto" }}
              >
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                  {/* Render Links */}
                  <g className="links">
                    {chartData.links.map((link, i) => {
                      const gradientId = `link-gradient-${i}`;
                      // Use nodeColorMap for reliable color lookup, with link colors as fallback
                      const sourceColor = chartData.nodeColorMap.get(link.sourceName)
                        || link.sourceColor
                        || '#6b7280';
                      const targetColor = chartData.nodeColorMap.get(link.targetName)
                        || link.targetColor
                        || '#6b7280';

                      // Generate the path
                      const pathD = linkPathGenerator(link as never);

                      // Calculate percentage for link label - use totalTransitions for flow %
                      const sourceNode = link.source as SankeyNodeDatum;
                      const targetNode = link.target as SankeyNodeDatum;
                      const linkPercentage = chartData.totalTransitions > 0
                        ? ((link.count / chartData.totalTransitions) * 100).toFixed(1)
                        : '0';

                      // Calculate midpoint of the link for label placement
                      const midX = sourceNode.x1 && targetNode.x0
                        ? (sourceNode.x1 + targetNode.x0) / 2
                        : 0;
                      const midY = link.y0 !== undefined && link.y1 !== undefined
                        ? (link.y0 + link.y1) / 2
                        : 0;

                      return (
                        <g key={i}>
                          <defs>
                            <linearGradient
                              id={gradientId}
                              gradientUnits="userSpaceOnUse"
                              x1={typeof link.source === 'object' ? link.source.x1 : 0}
                              y1={typeof link.source === 'object' ? (link.source.y0! + link.source.y1!) / 2 : 0}
                              x2={typeof link.target === 'object' ? link.target.x0 : 0}
                              y2={typeof link.target === 'object' ? (link.target.y0! + link.target.y1!) / 2 : 0}
                            >
                              <stop offset="0%" stopColor={sourceColor} stopOpacity={0.55} />
                              <stop offset="100%" stopColor={targetColor} stopOpacity={0.55} />
                            </linearGradient>
                          </defs>
                          <path
                            d={pathD || ""}
                            fill="none"
                            stroke={`url(#${gradientId})`}
                            strokeWidth={Math.max(2, link.width || 2)}
                            strokeOpacity={0.6}
                            className="transition-all duration-200 hover:stroke-opacity-90"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleLinkMouseEnter(e, link)}
                            onMouseLeave={handleMouseLeave}
                          />
                          {/* Percentage label on link - only show for significant flows */}
                          {link.count > 0 && parseFloat(linkPercentage) >= 1 && (
                            <text
                              x={midX}
                              y={midY}
                              textAnchor="middle"
                              dominantBaseline="middle"
                              fontSize="8"
                              fontWeight="500"
                              fill="currentColor"
                              className="fill-muted-foreground"
                              style={{
                                textShadow: '0 1px 2px rgba(0,0,0,0.9)',
                                userSelect: 'none',
                                pointerEvents: 'none',
                              }}
                            >
                              {linkPercentage}%
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </g>

                  {/* Render Nodes */}
                  <g className="nodes">
                    {chartData.nodes.map((node, i) => {
                      const nodeWidth = (node.x1 || 0) - (node.x0 || 0);
                      const nodeHeight = (node.y1 || 0) - (node.y0 || 0);
                      // Use recordCount (total records with this tag) if available, fallback to flow value
                      const totalRecordsWithTag = chartData.nodeRecordCounts.get(node.name) || node.value || 0;
                      // Percentage of total records that have this tag
                      const percentage = chartData.totalRecords > 0
                        ? ((totalRecordsWithTag / chartData.totalRecords) * 100).toFixed(2)
                        : '0';

                      return (
                        <g key={i}>
                          {/* Node Rectangle */}
                          <rect
                            x={node.x0}
                            y={node.y0}
                            width={nodeWidth}
                            height={nodeHeight}
                            fill={node.color || "#6b7280"}
                            fillOpacity={0.9}
                            rx={4}
                            ry={4}
                            stroke={node.color || "#6b7280"}
                            strokeWidth={1}
                            className="transition-all duration-200 hover:fill-opacity-100"
                            style={{ cursor: 'pointer' }}
                            onMouseEnter={(e) => handleNodeMouseEnter(e, node)}
                            onMouseLeave={handleMouseLeave}
                          />

                          {/* Node Label - Name */}
                          <text
                            x={(node.x0 || 0) + nodeWidth / 2}
                            y={(node.y0 || 0) - 22}
                            textAnchor="middle"
                            fontSize="11"
                            fontWeight="600"
                            fill="currentColor"
                            className="fill-foreground"
                            style={{
                              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                              userSelect: 'none',
                            }}
                          >
                            {node.name}
                          </text>

                          {/* Percentage - Below name (% of total records with this tag) */}
                          <text
                            x={(node.x0 || 0) + nodeWidth / 2}
                            y={(node.y0 || 0) - 8}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="500"
                            fill="currentColor"
                            className="fill-foreground"
                            style={{
                              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                              userSelect: 'none',
                            }}
                          >
                            {percentage}%
                          </text>

                          {/* Record count - Below the node (total records with this tag) */}
                          <text
                            x={(node.x0 || 0) + nodeWidth / 2}
                            y={(node.y1 || 0) + 14}
                            textAnchor="middle"
                            fontSize="9"
                            fill="currentColor"
                            className="fill-muted-foreground"
                            style={{
                              textShadow: '0 1px 3px rgba(0,0,0,0.8)',
                              userSelect: 'none',
                            }}
                          >
                            {totalRecordsWithTag.toLocaleString()}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>

            {/* Custom Tooltip */}
            {tooltip.visible && tooltip.data && (
              <div
                className="absolute pointer-events-none z-50 rounded-lg border bg-popover p-3 text-popover-foreground shadow-lg min-w-[200px]"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: 'translate(0, -100%)',
                }}
              >
                {tooltip.data.type === 'node' ? (
                  <div>
                    <div className="font-medium mb-1">{tooltip.data.nodeName}</div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      <span>{tooltip.data.nodeValue?.toLocaleString()} records</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 font-medium mb-2">
                      <span className="text-sm">{tooltip.data.sourceName}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-sm">{tooltip.data.targetName}</span>
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Records:</span>
                        </div>
                        <span className="font-medium">{tooltip.data.count?.toLocaleString()}</span>
                      </div>
                      {tooltip.data.avgDurationDays !== undefined && tooltip.data.avgDurationDays > 0 && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>Avg Duration:</span>
                          </div>
                          <span className="font-medium">{formatDuration(tooltip.data.avgDurationDays)}</span>
                        </div>
                      )}
                      {tooltip.data.conversionRate !== undefined && (
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <ArrowRight className="h-3 w-3" />
                            <span>Conversion:</span>
                          </div>
                          <span className="font-medium">{tooltip.data.conversionRate}%</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Controls hint */}
          <div className="mt-2 text-xs text-muted-foreground text-center">
            Scroll to zoom • Drag to pan • Use buttons for precise control
          </div>
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Tags in Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.nodes.map((node) => (
              <Badge
                key={node.name}
                variant="secondary"
                style={{ backgroundColor: node.color, color: "white" }}
              >
                {node.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
