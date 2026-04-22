import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Download,
    Upload,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    Users,
    Calendar,
    Mail,
    Globe,
    Clock,
    FileDown,
    Trash2,
} from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useToast } from "@/hooks/use-toast";

type TimeframeOption = "7days" | "14days" | "30days" | "90days";

export function AdminLifecycleLogs() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [timeframe, setTimeframe] = useState<TimeframeOption>("30days");
    const { toast } = useToast();

    // Fetch stats, logs, and server-side poller status
    const stats = useQuery(api.appLifecycleLogs.getStats);
    const allLogs = useQuery(api.appLifecycleLogs.getAllLogs, { limit: 100 });
    const installLogs = useQuery(api.appLifecycleLogs.getLogsByAction, { action: "APP_INSTALL", limit: 50 });
    const uninstallLogs = useQuery(api.appLifecycleLogs.getLogsByAction, { action: "APP_UNINSTALL", limit: 50 });
    const deleteDuplicates = useMutation(api.appLifecycleLogs.deleteDuplicates);

    // Server-side poller status - automatically updates via Convex subscriptions
    const pollerStatus = useQuery(api.journalPoller.getPollerStatus);

    // Filter chart data by timeframe
    const getFilteredChartData = () => {
        if (!stats?.chartData) return [];

        const now = new Date();
        const daysMap: Record<TimeframeOption, number> = {
            "7days": 7,
            "14days": 14,
            "30days": 30,
            "90days": 90,
        };
        const days = daysMap[timeframe];
        const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        return stats.chartData.filter((item) => new Date(item.date) >= cutoffDate);
    };

    // Manual refresh - triggers an immediate poll (in addition to server-side scheduled polling)
    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            const response = await fetch("/.netlify/functions/webhook-journal-poll");
            const data = await response.json();

            if (data.eventsProcessed > 0) {
                toast({
                    title: "Events Processed",
                    description: `${data.eventsProcessed} new event(s) found`,
                });
            } else {
                toast({
                    title: "Poll Complete",
                    description: "No new events found",
                });
            }
        } catch (error) {
            console.error("Failed to poll journal:", error);
            toast({
                title: "Poll Failed",
                description: "Could not fetch events from HubSpot",
                variant: "destructive",
            });
        }
        setIsRefreshing(false);
    };

    // Format relative time for display
    const formatRelativeTime = (seconds: number) => {
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const handleCleanDuplicates = async () => {
        try {
            const result = await deleteDuplicates({});
            toast({
                title: "Duplicates Removed",
                description: `Deleted ${result.deletedCount} duplicate entries`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to clean duplicates",
                variant: "destructive",
            });
        }
    };

    const handleExportCSV = () => {
        if (!allLogs || allLogs.length === 0) {
            toast({
                title: "No Data",
                description: "No logs to export",
                variant: "destructive",
            });
            return;
        }

        const headers = ["Portal ID", "Domain", "Company", "Email", "Action", "Event Time", "Processed At"];
        const rows = allLogs.map((log) => [
            log.portalId,
            log.domain || "",
            log.companyName || "",
            log.userEmail || "",
            log.action,
            log.occurredAt,
            log.processedAt,
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `lifecycle-logs-${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);

        toast({
            title: "Export Complete",
            description: `Exported ${allLogs.length} log entries`,
        });
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return dateStr;
        }
    };

    const LogRow = ({ log }: { log: any }) => (
        <div className="flex items-center justify-between p-4 border-b border-border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-4">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${log.action === "APP_INSTALL"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : "bg-red-100 dark:bg-red-900/30"
                        }`}
                >
                    {log.action === "APP_INSTALL" ? (
                        <Download className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                        <Upload className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                </div>
                <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">
                            {log.domain || log.companyName || `Portal ${log.portalId}`}
                        </span>
                        <Badge
                            variant="outline"
                            className={`flex-shrink-0 ${log.action === "APP_INSTALL"
                                ? "border-green-500 text-green-600 dark:text-green-400"
                                : "border-red-500 text-red-600 dark:text-red-400"
                                }`}
                        >
                            {log.action === "APP_INSTALL" ? "Installed" : "Uninstalled"}
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {log.userEmail && (
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {log.userEmail}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Globe className="h-3 w-3" />
                            ID: {log.portalId}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground flex-shrink-0">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">{formatDate(log.occurredAt)}</span>
            </div>
        </div>
    );

    // Loading state
    const isLoading = stats === undefined || allLogs === undefined;
    const chartData = getFilteredChartData();

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold">App Lifecycle Logs</h2>
                    <p className="text-muted-foreground">
                        Track app installations and uninstallations across all portals
                    </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    {/* Server-side polling status indicator */}
                    {pollerStatus && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground border rounded-md px-2 py-1">
                            <div className={`w-2 h-2 rounded-full ${pollerStatus.lastSuccess ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                            <span>Server polling: {formatRelativeTime(pollerStatus.secondsSinceLastPoll)}</span>
                            <span className="text-muted-foreground/60">({pollerStatus.totalEventsProcessed} events)</span>
                        </div>
                    )}
                    <Button onClick={handleCleanDuplicates} variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clean Duplicates
                    </Button>
                    <Button onClick={handleExportCSV} variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button onClick={handleRefresh} disabled={isRefreshing} size="sm" title="Trigger immediate poll (server polls automatically every minute)">
                        <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                        {isRefreshing ? "Polling..." : "Manual Poll"}
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Installs</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-16 mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold text-green-600">{stats?.totalInstalls || 0}</p>
                                )}
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                                <Download className="h-5 w-5 lg:h-6 lg:w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Total Uninstalls</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-16 mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold text-red-600">{stats?.totalUninstalls || 0}</p>
                                )}
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                                <Upload className="h-5 w-5 lg:h-6 lg:w-6 text-red-600 dark:text-red-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Net Active</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-16 mt-1" />
                                ) : (
                                    <p className={`text-3xl font-bold ${(stats?.netActive || 0) >= 0 ? "text-primary" : "text-red-600"}`}>
                                        {(stats?.netActive || 0) >= 0 ? `+${stats?.netActive || 0}` : stats?.netActive}
                                    </p>
                                )}
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                {(stats?.netActive || 0) >= 0 ? (
                                    <TrendingUp className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 lg:h-6 lg:w-6 text-red-600" />
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Last 30 Days</p>
                                {isLoading ? (
                                    <Skeleton className="h-9 w-16 mt-1" />
                                ) : (
                                    <p className="text-3xl font-bold">{stats?.recentLogsCount || 0}</p>
                                )}
                            </div>
                            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Calendar className="h-5 w-5 lg:h-6 lg:w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Chart with Timeframe Selector */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Install/Uninstall Trend</CardTitle>
                        <CardDescription>Track user activity over time</CardDescription>
                    </div>
                    <Select value={timeframe} onValueChange={(v) => setTimeframe(v as TimeframeOption)}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7days">Last 7 days</SelectItem>
                            <SelectItem value="14days">Last 14 days</SelectItem>
                            <SelectItem value="30days">Last 30 days</SelectItem>
                            <SelectItem value="90days">Last 90 days</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-[300px] w-full" />
                    ) : chartData.length > 0 ? (
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--background))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "8px",
                                        }}
                                        formatter={(value: number, name: string) => [
                                            value,
                                            name === "installs" ? "Installs" : "Uninstalls",
                                        ]}
                                        labelFormatter={(label) => {
                                            const date = new Date(label);
                                            return date.toLocaleDateString("en-US", {
                                                weekday: "short",
                                                month: "short",
                                                day: "numeric",
                                            });
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="installs"
                                        stroke="#22c55e"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "#22c55e" }}
                                        activeDot={{ r: 6 }}
                                        name="Installs"
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="uninstalls"
                                        stroke="#ef4444"
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: "#ef4444" }}
                                        activeDot={{ r: 6 }}
                                        name="Uninstalls"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground gap-2">
                            <Calendar className="h-12 w-12 opacity-20" />
                            <p>No data available for the selected timeframe</p>
                            <p className="text-xs">Events will appear here once they are logged</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Logs Table with Tabs */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Event Logs</CardTitle>
                        <CardDescription>Recent app lifecycle events</CardDescription>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Tabs defaultValue="all" className="w-full">
                        <div className="px-6 border-b overflow-x-auto">
                            <TabsList className="h-12">
                                <TabsTrigger value="all" className="gap-2">
                                    <Users className="h-4 w-4" />
                                    <span className="hidden sm:inline">All Events</span>
                                    <Badge variant="secondary" className="ml-1">{allLogs?.length || 0}</Badge>
                                </TabsTrigger>
                                <TabsTrigger value="installs" className="gap-2">
                                    <Download className="h-4 w-4" />
                                    <span className="hidden sm:inline">Installs</span>
                                    <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                        {installLogs?.length || 0}
                                    </Badge>
                                </TabsTrigger>
                                <TabsTrigger value="uninstalls" className="gap-2">
                                    <Upload className="h-4 w-4" />
                                    <span className="hidden sm:inline">Uninstalls</span>
                                    <Badge variant="secondary" className="ml-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                        {uninstallLogs?.length || 0}
                                    </Badge>
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="all" className="m-0">
                            <ScrollArea className="h-[400px]">
                                {isLoading ? (
                                    <div className="p-4 space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <Skeleton className="h-10 w-10 rounded-xl" />
                                                <div className="space-y-2 flex-1">
                                                    <Skeleton className="h-4 w-48" />
                                                    <Skeleton className="h-3 w-32" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : allLogs && allLogs.length > 0 ? (
                                    allLogs.map((log) => <LogRow key={log._id} log={log} />)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                                        <Users className="h-12 w-12 opacity-20" />
                                        <p>No events logged yet</p>
                                        <p className="text-xs">Install or uninstall events will appear here</p>
                                        <Button variant="outline" size="sm" onClick={handleRefresh} className="mt-2">
                                            <RefreshCw className="h-4 w-4 mr-2" />
                                            Check for Events
                                        </Button>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="installs" className="m-0">
                            <ScrollArea className="h-[400px]">
                                {installLogs && installLogs.length > 0 ? (
                                    installLogs.map((log) => <LogRow key={log._id} log={log} />)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                                        <Download className="h-12 w-12 opacity-20" />
                                        <p>No install events logged</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>

                        <TabsContent value="uninstalls" className="m-0">
                            <ScrollArea className="h-[400px]">
                                {uninstallLogs && uninstallLogs.length > 0 ? (
                                    uninstallLogs.map((log) => <LogRow key={log._id} log={log} />)
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground gap-2">
                                        <Upload className="h-12 w-12 opacity-20" />
                                        <p>No uninstall events logged</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

export default AdminLifecycleLogs;
