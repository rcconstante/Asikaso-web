import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Ticket,
    Plus,
    Loader2,
    Copy,
    Trash2,
    Edit3,
    ToggleLeft,
    ToggleRight,
    Sparkles,
    Clock,
    Users,
    Gift,
    Calendar,
    RefreshCw,
    Download,
    CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import { format, formatDistanceToNow } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function AdminRedeemCodes() {
    const { sessionToken } = useAdmin();
    const { toast } = useToast();

    // Queries
    const redeemCodes = useQuery(
        api.redeemCodes.getAllRedeemCodes,
        sessionToken ? { sessionToken } : "skip"
    );
    const stats = useQuery(
        api.redeemCodes.getRedemptionStats,
        sessionToken ? { sessionToken } : "skip"
    );

    // Mutations
    const createCodeMutation = useMutation(api.redeemCodes.createRedeemCode);
    const generateBulkMutation = useMutation(api.redeemCodes.generateBulkCodes);
    const updateCodeMutation = useMutation(api.redeemCodes.updateRedeemCode);
    const deleteCodeMutation = useMutation(api.redeemCodes.deleteRedeemCode);
    const toggleStatusMutation = useMutation(api.redeemCodes.toggleRedeemCodeStatus);

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showBulkModal, setShowBulkModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingCode, setEditingCode] = useState<any>(null);
    const [deleteCodeId, setDeleteCodeId] = useState<Id<"redeemCodes"> | null>(null);

    // Form states - Create
    const [newCode, setNewCode] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPlan, setNewPlan] = useState("pro");
    const [newDurationDays, setNewDurationDays] = useState("");
    const [newMaxUses, setNewMaxUses] = useState("");
    const [newExpiresAt, setNewExpiresAt] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    // Form states - Bulk
    const [bulkCount, setBulkCount] = useState("10");
    const [bulkPlan, setBulkPlan] = useState("pro");
    const [bulkDurationDays, setBulkDurationDays] = useState("");
    const [bulkMaxUses, setBulkMaxUses] = useState("1");
    const [bulkExpiresAt, setBulkExpiresAt] = useState("");
    const [bulkPrefix, setBulkPrefix] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

    // Other states
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCreateCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionToken) return;

        setIsCreating(true);
        try {
            const result = await createCodeMutation({
                sessionToken,
                code: newCode || undefined,
                description: newDescription || undefined,
                plan: newPlan,
                durationDays: newDurationDays ? parseInt(newDurationDays) : undefined,
                maxUses: newMaxUses ? parseInt(newMaxUses) : undefined,
                expiresAt: newExpiresAt ? new Date(newExpiresAt).getTime() : undefined,
            });

            toast({
                title: "Code created",
                description: (
                    <div className="flex items-center gap-2">
                        <span>Code:</span>
                        <code className="bg-muted px-2 py-1 rounded font-mono">{result.code}</code>
                    </div>
                ),
            });

            // Reset form
            setNewCode("");
            setNewDescription("");
            setNewPlan("pro");
            setNewDurationDays("");
            setNewMaxUses("");
            setNewExpiresAt("");
            setShowCreateModal(false);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to create code",
                variant: "destructive",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const handleBulkGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionToken) return;

        setIsGenerating(true);
        try {
            const result = await generateBulkMutation({
                sessionToken,
                count: parseInt(bulkCount),
                plan: bulkPlan,
                durationDays: bulkDurationDays ? parseInt(bulkDurationDays) : undefined,
                maxUses: bulkMaxUses ? parseInt(bulkMaxUses) : undefined,
                expiresAt: bulkExpiresAt ? new Date(bulkExpiresAt).getTime() : undefined,
                prefix: bulkPrefix || undefined,
            });

            setGeneratedCodes(result.codes);
            toast({
                title: "Codes generated",
                description: `Successfully generated ${result.codes.length} codes`,
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to generate codes",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEditCode = (code: any) => {
        setEditingCode({
            ...code,
            expiresAtDate: code.expiresAt
                ? format(new Date(code.expiresAt), "yyyy-MM-dd'T'HH:mm")
                : "",
        });
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!sessionToken || !editingCode) return;

        setIsSaving(true);
        try {
            await updateCodeMutation({
                sessionToken,
                codeId: editingCode._id,
                code: editingCode.code,
                description: editingCode.description,
                plan: editingCode.plan,
                durationDays: editingCode.durationDays || undefined,
                maxUses: editingCode.maxUses || undefined,
                expiresAt: editingCode.expiresAtDate
                    ? new Date(editingCode.expiresAtDate).getTime()
                    : undefined,
                isActive: editingCode.isActive,
            });

            toast({
                title: "Code updated",
                description: "The redeem code has been updated successfully.",
            });
            setShowEditModal(false);
            setEditingCode(null);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update code",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteCode = async () => {
        if (!sessionToken || !deleteCodeId) return;

        setIsDeleting(true);
        try {
            await deleteCodeMutation({ sessionToken, codeId: deleteCodeId });
            toast({
                title: "Code deleted",
                description: "The redeem code has been deleted.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete code",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteCodeId(null);
        }
    };

    const handleToggleStatus = async (codeId: Id<"redeemCodes">) => {
        if (!sessionToken) return;

        try {
            await toggleStatusMutation({ sessionToken, codeId });
            toast({
                title: "Status updated",
                description: "Code status has been toggled.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to toggle status",
                variant: "destructive",
            });
        }
    };

    const copyToClipboard = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
        toast({
            title: "Copied!",
            description: "Code copied to clipboard",
        });
    };

    const exportCodes = () => {
        const codes = generatedCodes.length > 0 ? generatedCodes : redeemCodes?.map((c) => c.code) || [];
        const text = codes.join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `redeem-codes-${format(new Date(), "yyyy-MM-dd")}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const getStatusBadge = (code: any) => {
        const now = Date.now();

        if (!code.isActive) {
            return <Badge variant="secondary" className="bg-gray-100 text-gray-600">Inactive</Badge>;
        }

        if (code.expiresAt && code.expiresAt < now) {
            return <Badge variant="destructive">Expired</Badge>;
        }

        if (code.maxUses && code.currentUses >= code.maxUses) {
            return <Badge variant="secondary" className="bg-orange-100 text-orange-600">Maxed Out</Badge>;
        }

        return <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>;
    };

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Ticket className="h-8 w-8 text-primary" />
                        Redeem Codes
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Create and manage promotional upgrade codes
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowBulkModal(true)}
                        className="gap-2"
                    >
                        <Sparkles className="h-4 w-4" />
                        Bulk Generate
                    </Button>
                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Code
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid gap-4 md:grid-cols-4">
                    <Card className="rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Ticket className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Codes</p>
                                    <p className="text-2xl font-bold">{stats.totalCodes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Codes</p>
                                    <p className="text-2xl font-bold">{stats.activeCodes}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                                    <Gift className="h-6 w-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Redemptions</p>
                                    <p className="text-2xl font-bold">{stats.totalRedemptions}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-amber-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Last 24 Hours</p>
                                    <p className="text-2xl font-bold">{stats.redemptionsLast24Hours}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Codes Table */}
            <Card className="rounded-2xl overflow-hidden">
                <CardHeader>
                    <CardTitle>All Redeem Codes</CardTitle>
                    <CardDescription>
                        Manage your promotional and upgrade codes
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!redeemCodes ? (
                        <div className="flex items-center justify-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : redeemCodes.length === 0 ? (
                        <div className="text-center py-16">
                            <Ticket className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No redeem codes created yet</p>
                            <Button
                                onClick={() => setShowCreateModal(true)}
                                className="mt-4 gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Create Your First Code
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50">
                                        <TableHead className="font-semibold">Code</TableHead>
                                        <TableHead className="font-semibold">Plan</TableHead>
                                        <TableHead className="font-semibold">Status</TableHead>
                                        <TableHead className="font-semibold">Uses</TableHead>
                                        <TableHead className="font-semibold">Duration</TableHead>
                                        <TableHead className="font-semibold">Expires</TableHead>
                                        <TableHead className="font-semibold text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {redeemCodes.map((code) => (
                                        <TableRow key={code._id} className="hover:bg-muted/30">
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <code className="bg-muted px-2 py-1 rounded font-mono text-sm">
                                                        {code.code}
                                                    </code>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-7 w-7 p-0"
                                                        onClick={() => copyToClipboard(code.code)}
                                                    >
                                                        {copiedCode === code.code ? (
                                                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                                        ) : (
                                                            <Copy className="h-3.5 w-3.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                                {code.description && (
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {code.description}
                                                    </p>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    className={
                                                        code.plan === "pro"
                                                            ? "bg-purple-100 text-purple-700"
                                                            : "bg-blue-100 text-blue-700"
                                                    }
                                                >
                                                    {code.plan.charAt(0).toUpperCase() + code.plan.slice(1)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{getStatusBadge(code)}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5 text-muted-foreground" />
                                                    <span>{code.currentUses}</span>
                                                    {code.maxUses && (
                                                        <span className="text-muted-foreground">
                                                            / {code.maxUses}
                                                        </span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {code.durationDays ? (
                                                    <span>{code.durationDays} days</span>
                                                ) : (
                                                    <span className="text-muted-foreground">Permanent</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {code.expiresAt ? (
                                                    <div className="text-sm">
                                                        <p>{format(new Date(code.expiresAt), "MMM d, yyyy")}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(code.expiresAt), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground">Never</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleToggleStatus(code._id)}
                                                        title={code.isActive ? "Deactivate" : "Activate"}
                                                        className="h-8 px-2"
                                                    >
                                                        {code.isActive ? (
                                                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                                                        ) : (
                                                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditCode(code)}
                                                        className="h-8 px-2"
                                                    >
                                                        <Edit3 className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setDeleteCodeId(code._id)}
                                                        className="h-8 px-2 text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Create Code Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-5 w-5 text-primary" />
                            Create Redeem Code
                        </DialogTitle>
                        <DialogDescription>
                            Create a new promotional code for plan upgrades
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateCode}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Code (Optional)</Label>
                                <Input
                                    id="code"
                                    placeholder="Leave empty to auto-generate"
                                    value={newCode}
                                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                                    className="rounded-xl font-mono"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Custom code or leave empty for random generation
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (Optional)</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Internal notes about this code..."
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="rounded-xl resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="plan">Upgrade Plan</Label>
                                <Select value={newPlan} onValueChange={setNewPlan}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="duration">Duration (Days)</Label>
                                    <Input
                                        id="duration"
                                        type="number"
                                        placeholder="Permanent"
                                        value={newDurationDays}
                                        onChange={(e) => setNewDurationDays(e.target.value)}
                                        className="rounded-xl"
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="maxUses">Max Uses</Label>
                                    <Input
                                        id="maxUses"
                                        type="number"
                                        placeholder="Unlimited"
                                        value={newMaxUses}
                                        onChange={(e) => setNewMaxUses(e.target.value)}
                                        className="rounded-xl"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expiresAt">Code Expires On</Label>
                                <Input
                                    id="expiresAt"
                                    type="datetime-local"
                                    value={newExpiresAt}
                                    onChange={(e) => setNewExpiresAt(e.target.value)}
                                    className="rounded-xl"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowCreateModal(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Code"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Bulk Generate Modal */}
            <Dialog open={showBulkModal} onOpenChange={(open) => {
                setShowBulkModal(open);
                if (!open) setGeneratedCodes([]);
            }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Bulk Generate Codes
                        </DialogTitle>
                        <DialogDescription>
                            Generate multiple promotional codes at once
                        </DialogDescription>
                    </DialogHeader>

                    {generatedCodes.length > 0 ? (
                        <div className="space-y-4 py-4">
                            <div className="flex items-center justify-between">
                                <p className="font-medium">
                                    Generated {generatedCodes.length} codes
                                </p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={exportCodes}
                                    className="gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Export
                                </Button>
                            </div>
                            <div className="max-h-60 overflow-y-auto border rounded-xl p-3 bg-muted/50 space-y-1">
                                {generatedCodes.map((code, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-1 px-2 hover:bg-muted rounded"
                                    >
                                        <code className="font-mono text-sm">{code}</code>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 w-7 p-0"
                                            onClick={() => copyToClipboard(code)}
                                        >
                                            {copiedCode === code ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                            ) : (
                                                <Copy className="h-3.5 w-3.5" />
                                            )}
                                        </Button>
                                    </div>
                                ))}
                            </div>
                            <DialogFooter>
                                <Button onClick={() => {
                                    setGeneratedCodes([]);
                                    setShowBulkModal(false);
                                }}>
                                    Done
                                </Button>
                            </DialogFooter>
                        </div>
                    ) : (
                        <form onSubmit={handleBulkGenerate}>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bulkCount">Number of Codes</Label>
                                        <Input
                                            id="bulkCount"
                                            type="number"
                                            value={bulkCount}
                                            onChange={(e) => setBulkCount(e.target.value)}
                                            className="rounded-xl"
                                            min="1"
                                            max="100"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bulkPlan">Plan</Label>
                                        <Select value={bulkPlan} onValueChange={setBulkPlan}>
                                            <SelectTrigger className="rounded-xl">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="basic">Basic</SelectItem>
                                                <SelectItem value="pro">Pro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bulkPrefix">Code Prefix (Optional)</Label>
                                    <Input
                                        id="bulkPrefix"
                                        placeholder="e.g., PROMO, LAUNCH"
                                        value={bulkPrefix}
                                        onChange={(e) => setBulkPrefix(e.target.value.toUpperCase())}
                                        className="rounded-xl font-mono"
                                        maxLength={8}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="bulkDuration">Duration (Days)</Label>
                                        <Input
                                            id="bulkDuration"
                                            type="number"
                                            placeholder="Permanent"
                                            value={bulkDurationDays}
                                            onChange={(e) => setBulkDurationDays(e.target.value)}
                                            className="rounded-xl"
                                            min="1"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="bulkMaxUses">Max Uses Each</Label>
                                        <Input
                                            id="bulkMaxUses"
                                            type="number"
                                            placeholder="1"
                                            value={bulkMaxUses}
                                            onChange={(e) => setBulkMaxUses(e.target.value)}
                                            className="rounded-xl"
                                            min="1"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="bulkExpiresAt">Codes Expire On</Label>
                                    <Input
                                        id="bulkExpiresAt"
                                        type="datetime-local"
                                        value={bulkExpiresAt}
                                        onChange={(e) => setBulkExpiresAt(e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowBulkModal(false)}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isGenerating}>
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            Generate Codes
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Code Modal */}
            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-primary" />
                            Edit Redeem Code
                        </DialogTitle>
                    </DialogHeader>
                    {editingCode && (
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label>Code</Label>
                                <Input
                                    value={editingCode.code}
                                    onChange={(e) =>
                                        setEditingCode({ ...editingCode, code: e.target.value.toUpperCase() })
                                    }
                                    className="rounded-xl font-mono"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                    value={editingCode.description || ""}
                                    onChange={(e) =>
                                        setEditingCode({ ...editingCode, description: e.target.value })
                                    }
                                    className="rounded-xl resize-none"
                                    rows={2}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Plan</Label>
                                <Select
                                    value={editingCode.plan}
                                    onValueChange={(v) => setEditingCode({ ...editingCode, plan: v })}
                                >
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="basic">Basic</SelectItem>
                                        <SelectItem value="pro">Pro</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Duration (Days)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Permanent"
                                        value={editingCode.durationDays || ""}
                                        onChange={(e) =>
                                            setEditingCode({
                                                ...editingCode,
                                                durationDays: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                        className="rounded-xl"
                                        min="1"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Uses</Label>
                                    <Input
                                        type="number"
                                        placeholder="Unlimited"
                                        value={editingCode.maxUses || ""}
                                        onChange={(e) =>
                                            setEditingCode({
                                                ...editingCode,
                                                maxUses: e.target.value ? parseInt(e.target.value) : null,
                                            })
                                        }
                                        className="rounded-xl"
                                        min="1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Expires On</Label>
                                <Input
                                    type="datetime-local"
                                    value={editingCode.expiresAtDate || ""}
                                    onChange={(e) =>
                                        setEditingCode({ ...editingCode, expiresAtDate: e.target.value })
                                    }
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50">
                                <div>
                                    <Label>Active Status</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Inactive codes cannot be redeemed
                                    </p>
                                </div>
                                <Switch
                                    checked={editingCode.isActive}
                                    onCheckedChange={(checked) =>
                                        setEditingCode({ ...editingCode, isActive: checked })
                                    }
                                />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowEditModal(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!deleteCodeId} onOpenChange={() => setDeleteCodeId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Redeem Code</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this redeem code? This action cannot be
                            undone. Users who have already redeemed this code will keep their upgrade.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCode}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Code"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
