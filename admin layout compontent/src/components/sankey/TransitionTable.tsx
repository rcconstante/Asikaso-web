import { SankeyData } from "@/types/sankey";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TransitionTableProps {
  data: SankeyData;
  className?: string;
}

export function TransitionTable({ data, className }: TransitionTableProps) {
  if (!data || data.transitions.length === 0) {
    return null;
  }

  // Sort transitions by count (highest first)
  const sortedTransitions = [...data.transitions].sort((a, b) => b.count - a.count);

  // Calculate totals
  const totalRecords = data.stats.totalRecords;
  const totalTransitions = data.transitions.reduce((sum, t) => sum + t.count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Tag Transition Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">From Tag</TableHead>
                <TableHead className="w-[180px]">To Tag</TableHead>
                <TableHead className="text-right w-[120px]">Records</TableHead>
                <TableHead className="text-right w-[100px]">Flow %</TableHead>
                <TableHead className="text-right w-[140px]">Avg Duration</TableHead>
                <TableHead className="w-[100px]">Flow</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTransitions.map((transition, index) => {
                // Use total transitions for percentage - shows what % of all flows this path represents
                const percentage = totalTransitions > 0
                  ? ((transition.count / totalTransitions) * 100).toFixed(1)
                  : '0.0';
                const sourceNode = data.nodes.find(n => n.name === transition.source);
                const targetNode = data.nodes.find(n => n.name === transition.target);

                return (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sourceNode?.color || '#6b7280' }}
                        />
                        <span className="truncate">{transition.source}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: targetNode?.color || '#6b7280' }}
                        />
                        <span className="truncate">{transition.target}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {transition.count.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{percentage}%</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {transition.avgDurationDays < 1
                        ? '< 1 day'
                        : transition.avgDurationDays < 30
                          ? `${Math.round(transition.avgDurationDays)} days`
                          : `${(transition.avgDurationDays / 30).toFixed(1)} months`}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${Math.min(100, (transition.count / Math.max(...sortedTransitions.map(t => t.count))) * 100)}%`,
                            backgroundColor: sourceNode?.color || '#6b7280',
                            opacity: 0.6
                          }}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
          <div>Total Transitions: <span className="font-semibold text-foreground">{totalTransitions}</span></div>
          <div>Total Records: <span className="font-semibold text-foreground">{totalRecords}</span></div>
          <div>Unique Paths: <span className="font-semibold text-foreground">{data.transitions.length}</span></div>
        </div>
      </CardContent>
    </Card>
  );
}
