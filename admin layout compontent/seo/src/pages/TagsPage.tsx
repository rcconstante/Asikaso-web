import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TagFormModal } from "@/components/tags/TagFormModal";
import { TagList } from "@/components/tags/TagList";
import {
    Plus,
    Tag as TagIcon,
    Search,
    AlertCircle,
    Users,
    Building2,
    Handshake,
    Ticket,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Download,
} from "lucide-react";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// Helper to get stored previous stats
const getPreviousStats = (): Record<string, number> => {
    try {
        const stored = localStorage.getItem('tagbase_previous_stats');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error reading previous stats:', e);
    }
    return {};
};

// Calculate change text
const calculateChange = (current: number, previous: number | undefined) => {
    if (previous === undefined || previous === 0) {
        return { text: current > 0 ? `+${current} new` : 'No change', positive: current > 0, neutral: current === 0 };
    }

    const diff = current - previous;
    const percentChange = ((diff / previous) * 100).toFixed(1);

    if (diff > 0) {
        return { text: `+${percentChange}%`, positive: true, neutral: false };
    } else if (diff < 0) {
        return { text: `${percentChange}%`, positive: false, neutral: false };
    }
    return { text: 'No change', positive: false, neutral: true };
};

// Base stat card configuration - colors match HubSpot object types
const baseStatCardConfig = [
    {
        key: "tags",
        title: "Total Tags",
        icon: TagIcon,
        bgColor: "bg-[#FFE2E5]",
        iconBg: "bg-[#FA5A7D]",
        darkBgColor: "dark:bg-[#FA5A7D]/20",
        darkIconBg: "dark:bg-[#FA5A7D]/30",
        changeColor: "text-[#FA5A7D]",
        negativeColor: "text-red-600",
    },
    {
        key: "contacts",
        title: "Contacts",
        icon: Users,
        // Green for Contacts
        bgColor: "bg-[#DCFCE7]",
        iconBg: "bg-[#22C55E]",
        darkBgColor: "dark:bg-[#22C55E]/20",
        darkIconBg: "dark:bg-[#22C55E]/30",
        changeColor: "text-[#22C55E]",
        negativeColor: "text-red-600",
    },
    {
        key: "companies",
        title: "Companies",
        icon: Building2,
        // Orange for Companies
        bgColor: "bg-[#FFF4DE]",
        iconBg: "bg-[#F97316]",
        darkBgColor: "dark:bg-[#F97316]/20",
        darkIconBg: "dark:bg-[#F97316]/30",
        changeColor: "text-[#F97316]",
        negativeColor: "text-red-600",
    },
    {
        key: "deals",
        title: "Deals",
        icon: Handshake,
        // Blue for Deals
        bgColor: "bg-[#E0F2FE]",
        iconBg: "bg-[#3B82F6]",
        darkBgColor: "dark:bg-[#3B82F6]/20",
        darkIconBg: "dark:bg-[#3B82F6]/30",
        changeColor: "text-[#3B82F6]",
        negativeColor: "text-red-600",
    },
    {
        key: "tickets",
        title: "Tickets",
        icon: Ticket,
        // Red for Tickets
        bgColor: "bg-[#FEE2E2]",
        iconBg: "bg-[#EF4444]",
        darkBgColor: "dark:bg-[#EF4444]/20",
        darkIconBg: "dark:bg-[#EF4444]/30",
        changeColor: "text-[#EF4444]",
        negativeColor: "text-red-600",
    },
];

const TagsPage = () => {
    const { toast } = useToast();
    const { tags, createTag, updateTag, deleteTag, connectionStatus } = useHubSpot();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTag, setEditingTag] = useState<Tag | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [tagToDelete, setTagToDelete] = useState<{
        id: string;
        name: string;
        totalTagged?: number;
        contactCount?: number;
        companyCount?: number;
        dealCount?: number;
        ticketCount?: number;
    } | null>(null);
    const [objectTypeFilter, setObjectTypeFilter] = useState<string[]>([]);
    const [sortBy, setSortBy] = useState<"name" | "contacts" | "companies" | "deals" | "tickets">("name");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [previousStats, setPreviousStats] = useState<Record<string, number>>({});

    // Load previous stats on mount
    useEffect(() => {
        const prev = getPreviousStats();
        setPreviousStats(prev);
    }, []);

    const objectTypeFilters = [
        { value: "contacts", label: "Contacts", color: "bg-green-500" },
        { value: "companies", label: "Companies", color: "bg-orange-500" },
        { value: "deals", label: "Deals", color: "bg-blue-500" },
        { value: "tickets", label: "Tickets", color: "bg-red-500" },
    ];

    const toggleObjectTypeFilter = (type: string) => {
        setObjectTypeFilter(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleSort = (field: "name" | "contacts" | "companies" | "deals" | "tickets") => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    let filteredTags = tags.filter((tag) => {
        // Search filter
        if (tag && tag.name && !tag.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        // Object type filter
        if (objectTypeFilter.length > 0) {
            const tagObjectTypes = tag.objectTypes || [];
            // Tag must have at least one of the selected object types
            if (tagObjectTypes.length === 0) return true; // Show tags with no objectTypes
            return objectTypeFilter.some(filter => tagObjectTypes.includes(filter));
        }
        return true;
    });

    // Apply sorting
    filteredTags = [...filteredTags].sort((a, b) => {
        let comparison = 0;

        if (sortBy === "name") {
            comparison = a.name.localeCompare(b.name);
        } else if (sortBy === "contacts") {
            comparison = a.contactCount - b.contactCount;
        } else if (sortBy === "companies") {
            comparison = a.companyCount - b.companyCount;
        } else if (sortBy === "deals") {
            comparison = a.dealCount - b.dealCount;
        } else if (sortBy === "tickets") {
            comparison = (a.ticketCount || 0) - (b.ticketCount || 0);
        }

        return sortOrder === "asc" ? comparison : -comparison;
    });

    // Calculate stats - count how many tags were created for each object type
    const stats = useMemo(() => ({
        tags: tags.length,
        contacts: tags.filter(t => t.objectTypes?.includes('contacts')).length,
        companies: tags.filter(t => t.objectTypes?.includes('companies')).length,
        deals: tags.filter(t => t.objectTypes?.includes('deals')).length,
        tickets: tags.filter(t => t.objectTypes?.includes('tickets')).length,
    }), [tags]);

    // Calculate stat card config with dynamic changes
    const statCardConfig = useMemo(() => {
        return baseStatCardConfig.map(config => {
            const currentValue = stats[config.key as keyof typeof stats];
            const prevValue = previousStats[config.key];
            const change = calculateChange(currentValue, prevValue);

            return {
                ...config,
                change: change.text,
                positive: change.positive,
                neutral: change.neutral,
            };
        });
    }, [stats, previousStats]);

    const handleExport = () => {
        try {
            // Create CSV content
            const headers = ["Name", "Color", "Object Types", "Contacts", "Companies", "Deals", "Tickets", "Created At"];
            const csvRows = [
                headers.join(","),
                ...tags.map(tag => [
                    `"${tag.name.replace(/"/g, '""')}"`,
                    tag.color,
                    `"${(tag.objectTypes || []).join("; ")}"`,
                    tag.contactCount,
                    tag.companyCount,
                    tag.dealCount,
                    tag.ticketCount || 0,
                    tag.createdAt ? new Date(tag.createdAt).toISOString() : "",
                ].join(","))
            ];
            const csvContent = csvRows.join("\n");

            // Create and download the file
            const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", `tagbase-tags-${new Date().toISOString().split('T')[0]}.csv`);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast({
                title: "Export successful",
                description: `Exported ${tags.length} tags to CSV file.`,
            });
        } catch (error) {
            toast({
                title: "Export failed",
                description: "Failed to export tags. Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleCreateTag = async (name: string, color: string, objectTypes: string[]) => {
        setIsCreating(true);
        try {
            await createTag({
                name,
                color,
                objectTypes,
                contactCount: 0,
                companyCount: 0,
                dealCount: 0,
                ticketCount: 0,
            });
            // Close modal only after successful creation
            setIsModalOpen(false);
            toast({
                title: "Tag created",
                description: `"${name}" has been created successfully.`,
            });
        } catch (error: any) {
            const errorMessage = error?.message || '';

            // Parse error and show user-friendly message
            if (errorMessage.includes('Tag limit reached')) {
                toast({
                    title: "Tag Limit Reached",
                    description: "You've reached the 10 tag limit on the Free plan. Upgrade to create unlimited tags.",
                    variant: "destructive",
                });
            } else if (errorMessage.includes('does not support these object types')) {
                toast({
                    title: "Upgrade Required",
                    description: "Companies, Deals, and Tickets require a paid plan.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Failed to create tag",
                    description: "Something went wrong. Please try again.",
                    variant: "destructive",
                });
            }
        } finally {
            setIsCreating(false);
        }
    };

    const handleEditTag = async (name: string, color: string, objectTypes: string[]) => {
        if (editingTag) {
            try {
                await updateTag({
                    ...editingTag,
                    name,
                    color,
                    objectTypes,
                    // Preserve all counts when updating
                    contactCount: editingTag.contactCount,
                    companyCount: editingTag.companyCount,
                    dealCount: editingTag.dealCount,
                    ticketCount: editingTag.ticketCount,
                });
                setEditingTag(null);
                setIsModalOpen(false);
                toast({
                    title: "Tag updated",
                    description: `"${name}" has been updated successfully.`,
                });
            } catch (error: any) {
                toast({
                    title: "Failed to update tag",
                    description: error?.message || "Something went wrong. Please try again.",
                    variant: "destructive",
                });
            }
        }
    };

    const handleDeleteTag = async (tagId: string) => {
        const tag = tags.find(t => t.id === tagId);
        if (tag) {
            // Calculate total tagged objects
            const totalTagged = (tag.contactCount || 0) + (tag.companyCount || 0) + (tag.dealCount || 0) + (tag.ticketCount || 0);
            setTagToDelete({
                id: tagId,
                name: tag.name,
                totalTagged,
                contactCount: tag.contactCount || 0,
                companyCount: tag.companyCount || 0,
                dealCount: tag.dealCount || 0,
                ticketCount: tag.ticketCount || 0,
            });
            setIsDeleteDialogOpen(true);
        }
    };

    const confirmDeleteTag = async () => {
        if (tagToDelete) {
            setIsDeleting(true);
            try {
                await deleteTag(tagToDelete.id);
                toast({
                    title: "Tag deleted",
                    description: `"${tagToDelete.name}" has been deleted and removed from all records.`,
                });
                setTagToDelete(null);
                // Close dialog after toast is shown
                setIsDeleteDialogOpen(false);
            } catch (error: any) {
                toast({
                    title: "Failed to delete tag",
                    description: error?.message || "Something went wrong. Please try again.",
                    variant: "destructive",
                });
                // Close dialog after error toast is shown
                setIsDeleteDialogOpen(false);
            } finally {
                setIsDeleting(false);
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingTag(null);
    };

    return (
        <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
            {/* Today's Stats Section */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-5 md:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 md:mb-8 gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-semibold text-foreground">
                            Tags Overview
                        </h2>
                        <p className="text-sm md:text-base text-muted-foreground mt-1">
                            Your HubSpot tagging summary
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="gap-2 rounded-xl border-border hover:bg-muted self-start"
                        onClick={handleExport}
                    >
                        <Download className="h-4 w-4" />
                        <span className="text-sm font-medium">Export</span>
                    </Button>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-5">
                    {statCardConfig.map((config) => {
                        const Icon = config.icon;
                        const value = stats[config.key as keyof typeof stats];
                        const isFilterable = config.key !== 'tags';
                        const isActive = isFilterable && objectTypeFilter.includes(config.key);

                        return (
                            <div
                                key={config.key}
                                onClick={() => isFilterable && toggleObjectTypeFilter(config.key)}
                                className={cn(
                                    "stat-card rounded-2xl p-5 min-h-[160px] flex flex-col transition-all",
                                    config.bgColor,
                                    config.darkBgColor,
                                    isFilterable && "cursor-pointer hover:scale-105 hover:shadow-lg",
                                    isActive && "ring-2 ring-offset-2",
                                    isActive && config.iconBg.replace('bg-', 'ring-')
                                )}
                            >
                                <div
                                    className={cn(
                                        "w-11 h-11 rounded-full flex items-center justify-center mb-4",
                                        config.iconBg,
                                        config.darkIconBg
                                    )}
                                >
                                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                                    {value}
                                </h3>
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    {config.title}
                                </p>
                                <div className="flex items-center gap-1 mt-auto">
                                    {config.neutral ? (
                                        <Minus className="w-3.5 h-3.5 text-muted-foreground" />
                                    ) : config.positive ? (
                                        <ArrowUpRight className={cn("w-3.5 h-3.5", config.changeColor)} />
                                    ) : (
                                        <ArrowDownRight className={cn("w-3.5 h-3.5", config.negativeColor || "text-red-500")} />
                                    )}
                                    <p className={cn(
                                        "text-xs font-medium",
                                        config.neutral ? "text-muted-foreground" : config.positive ? config.changeColor : (config.negativeColor || "text-red-500")
                                    )}>
                                        {config.change}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Connection Status Alert */}
            {!connectionStatus.isConnected && (
                <Alert className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertDescription className="text-amber-700 dark:text-amber-300">
                        Not connected to HubSpot. Click{" "}
                        <span className="font-medium">Settings</span> in the sidebar to connect your account.
                    </AlertDescription>
                </Alert>
            )}

            {/* Tags Management Card */}
            <Card className="rounded-2xl shadow-sm border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-semibold">Your Tags</CardTitle>
                        <CardDescription>
                            Manage your tag taxonomy. {filteredTags.length} tag{filteredTags.length !== 1 ? "s" : ""} found
                        </CardDescription>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="rounded-xl gap-2 shadow-lg shadow-primary/30">
                        <Plus className="h-4 w-4" />
                        New Tag
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search and Filters */}
                    <div className="space-y-3">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search tags..."
                                className="pl-11 rounded-xl"
                            />
                        </div>

                        {/* Active filters display */}
                        {objectTypeFilter.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                                {objectTypeFilters.filter(f => objectTypeFilter.includes(f.value)).map(({ value, label, color }) => (
                                    <Badge
                                        key={value}
                                        variant="default"
                                        className="rounded-lg px-3 py-1"
                                    >
                                        <div className={cn("w-2 h-2 rounded-full mr-1.5", color)} />
                                        {label}
                                    </Badge>
                                ))}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setObjectTypeFilter([])}
                                    className="h-6 text-xs rounded-lg"
                                >
                                    Clear all
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Tag List */}
                    <TagList
                        tags={filteredTags}
                        onEdit={(tag) => {
                            setEditingTag(tag);
                            setIsModalOpen(true);
                        }}
                        onDelete={handleDeleteTag}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSort={toggleSort}
                    />
                </CardContent>
            </Card>

            {/* Modal */}
            <TagFormModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onSubmit={editingTag ? handleEditTag : handleCreateTag}
                tag={editingTag}
                isLoading={isCreating}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Tag?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                            <div className="space-y-3">
                                <p>
                                    Are you sure you want to delete "{tagToDelete?.name}"? This action cannot be undone.
                                </p>

                                {tagToDelete?.totalTagged && tagToDelete.totalTagged > 0 ? (
                                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                                        <p className="text-amber-700 dark:text-amber-300 font-medium text-sm mb-2">
                                            ⚠️ This tag is applied to {tagToDelete.totalTagged} record{tagToDelete.totalTagged !== 1 ? 's' : ''}:
                                        </p>
                                        <ul className="text-xs text-amber-600 dark:text-amber-400 space-y-1">
                                            {tagToDelete.contactCount ? <li>• {tagToDelete.contactCount} Contact{tagToDelete.contactCount !== 1 ? 's' : ''}</li> : null}
                                            {tagToDelete.companyCount ? <li>• {tagToDelete.companyCount} Compan{tagToDelete.companyCount !== 1 ? 'ies' : 'y'}</li> : null}
                                            {tagToDelete.dealCount ? <li>• {tagToDelete.dealCount} Deal{tagToDelete.dealCount !== 1 ? 's' : ''}</li> : null}
                                            {tagToDelete.ticketCount ? <li>• {tagToDelete.ticketCount} Ticket{tagToDelete.ticketCount !== 1 ? 's' : ''}</li> : null}
                                        </ul>
                                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                                            Deleting will remove this tag from all these records.
                                        </p>
                                    </div>
                                ) : null}
                            </div>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setTagToDelete(null)} className="rounded-xl" disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteTag} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl" disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : tagToDelete?.totalTagged && tagToDelete.totalTagged > 0 ? 'Delete Anyway' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TagsPage;
