import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    Settings,
    Lock,
    Loader2,
    CheckCircle2,
    Eye,
    EyeOff,
    User,
    Users,
    UserPlus,
    Trash2,
    Shield,
    ShieldCheck,
    ToggleLeft,
    ToggleRight,
    Circle,
    Camera,
    Edit3,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Id } from "../../../convex/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

export default function AdminSettings() {
    const { admin, sessionToken, changePassword } = useAdmin();
    const { toast } = useToast();

    // Profile editing state
    const [isEditingName, setIsEditingName] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [isSavingName, setIsSavingName] = useState(false);
    const [isUploadingPicture, setIsUploadingPicture] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Password change state
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isChanging, setIsChanging] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Create account modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAdminName, setNewAdminName] = useState("");
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [newAdminPassword, setNewAdminPassword] = useState("");
    const [newAdminRole, setNewAdminRole] = useState("admin");
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    // Delete confirmation state
    const [deleteAdminId, setDeleteAdminId] = useState<Id<"adminUsers"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Queries and mutations
    const allAdmins = useQuery(
        api.adminAuth.getAllAdmins,
        sessionToken ? { sessionToken } : "skip"
    );
    const createAdminMutation = useMutation(api.adminAuth.createAdminUser);
    const deleteAdminMutation = useMutation(api.adminAuth.deleteAdminUser);
    const toggleStatusMutation = useMutation(api.adminAuth.toggleAdminStatus);
    const updateNameMutation = useMutation(api.adminAuth.updateProfileName);
    const updatePictureMutation = useMutation(api.adminAuth.updateProfilePicture);
    const generateUploadUrlMutation = useMutation(api.files.generateUploadUrl);

    const isSuperAdmin = admin?.role === "super_admin";

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError("");
        setPasswordSuccess(false);

        if (!currentPassword) {
            setPasswordError("Current password is required");
            return;
        }
        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match");
            return;
        }

        setIsChanging(true);
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            toast({
                title: "Password changed",
                description: "Your password has been updated successfully.",
            });
        } catch (err: any) {
            setPasswordError(err.message || "Failed to change password");
        } finally {
            setIsChanging(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!sessionToken) return;

        setCreateError("");
        setIsCreating(true);

        try {
            await createAdminMutation({
                sessionToken,
                email: newAdminEmail,
                password: newAdminPassword,
                name: newAdminName,
                role: newAdminRole,
            });
            toast({
                title: "Admin created",
                description: `${newAdminName} has been added as ${newAdminRole === "super_admin" ? "a Super Admin" : "an Admin"}.`,
            });
            setShowCreateModal(false);
            setNewAdminName("");
            setNewAdminEmail("");
            setNewAdminPassword("");
            setNewAdminRole("admin");
        } catch (err: any) {
            setCreateError(err.message || "Failed to create admin");
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteAdmin = async () => {
        if (!deleteAdminId || !sessionToken) return;

        setIsDeleting(true);
        try {
            await deleteAdminMutation({ sessionToken, adminId: deleteAdminId });
            toast({
                title: "Admin deleted",
                description: "The admin account has been removed.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to delete admin",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
            setDeleteAdminId(null);
        }
    };

    const handleToggleStatus = async (adminId: Id<"adminUsers">) => {
        if (!sessionToken) return;

        try {
            await toggleStatusMutation({ sessionToken, adminId });
            toast({
                title: "Status updated",
                description: "Admin account status has been changed.",
            });
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update status",
                variant: "destructive",
            });
        }
    };

    const handleEditName = () => {
        setEditedName(admin?.name || "");
        setIsEditingName(true);
    };

    const handleSaveName = async () => {
        if (!sessionToken || !editedName.trim()) return;

        setIsSavingName(true);
        try {
            await updateNameMutation({ sessionToken, name: editedName.trim() });
            toast({
                title: "Name updated",
                description: "Your name has been updated successfully.",
            });
            setIsEditingName(false);
            // Reload the page to refresh admin context
            window.location.reload();
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to update name",
                variant: "destructive",
            });
        } finally {
            setIsSavingName(false);
        }
    };

    const handleProfilePictureUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !sessionToken) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            toast({
                title: "Invalid file",
                description: "Please upload an image file",
                variant: "destructive",
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Please upload an image smaller than 5MB",
                variant: "destructive",
            });
            return;
        }

        setIsUploadingPicture(true);

        try {
            // Create a canvas to crop the image to 1:1 aspect ratio
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target?.result as string;
            };

            img.onload = async () => {
                // Create a square crop
                const size = Math.min(img.width, img.height);
                const canvas = document.createElement("canvas");
                canvas.width = 400; // Output size
                canvas.height = 400;
                const ctx = canvas.getContext("2d");

                if (ctx) {
                    // Calculate crop position (center crop)
                    const startX = (img.width - size) / 2;
                    const startY = (img.height - size) / 2;

                    // Draw cropped and resized image
                    ctx.drawImage(
                        img,
                        startX,
                        startY,
                        size,
                        size,
                        0,
                        0,
                        400,
                        400
                    );

                    // Convert canvas to blob
                    canvas.toBlob(async (blob) => {
                        if (!blob) {
                            toast({
                                title: "Error",
                                description: "Failed to process image",
                                variant: "destructive",
                            });
                            setIsUploadingPicture(false);
                            return;
                        }

                        try {
                            // Get upload URL
                            const uploadUrl = await generateUploadUrlMutation({ sessionToken });

                            // Upload the cropped image
                            const result = await fetch(uploadUrl, {
                                method: "POST",
                                headers: { "Content-Type": blob.type },
                                body: blob,
                            });

                            const { storageId } = await result.json();

                            // Update profile picture
                            await updatePictureMutation({ sessionToken, storageId });

                            toast({
                                title: "Profile picture updated",
                                description: "Your profile picture has been updated successfully.",
                            });

                            // Reload to refresh admin context
                            window.location.reload();
                        } catch (err: any) {
                            toast({
                                title: "Error",
                                description: err.message || "Failed to upload picture",
                                variant: "destructive",
                            });
                        } finally {
                            setIsUploadingPicture(false);
                        }
                    }, "image/jpeg", 0.9);
                }
            };

            reader.readAsDataURL(file);
        } catch (err: any) {
            toast({
                title: "Error",
                description: err.message || "Failed to process image",
                variant: "destructive",
            });
            setIsUploadingPicture(false);
        }
    };

    return (
        <div className="p-6 md:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
                        <Settings className="h-8 w-8 text-primary" />
                        Settings
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your account and admin users
                    </p>
                </div>
            </div>

            <Tabs defaultValue="account" className="w-full">
                <TabsList className="mb-6">
                    <TabsTrigger value="account" className="gap-2 px-4 py-2">
                        <User className="h-4 w-4" />
                        <span className="hidden sm:inline">Account</span>
                    </TabsTrigger>
                    <TabsTrigger value="password" className="gap-2 px-4 py-2">
                        <Lock className="h-4 w-4" />
                        <span className="hidden sm:inline">Password</span>
                    </TabsTrigger>
                    {isSuperAdmin && (
                        <TabsTrigger value="users" className="gap-2 px-4 py-2">
                            <Users className="h-4 w-4" />
                            <span className="hidden sm:inline">Users</span>
                        </TabsTrigger>
                    )}
                </TabsList>

                {/* Account Info Tab */}
                <TabsContent value="account">
                    <Card className="rounded-2xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-primary" />
                                Account Information
                            </CardTitle>
                            <CardDescription>Your admin account details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Profile Picture Section */}
                            <div className="flex flex-col items-center gap-4 pb-6 border-b">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border-4 border-white dark:border-card shadow-lg">
                                        {admin?.profilePictureUrl ? (
                                            <img 
                                                src={admin.profilePictureUrl} 
                                                alt={admin.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-4xl font-bold text-primary">
                                                {admin?.name.charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <label 
                                        htmlFor="profile-picture-upload"
                                        className="absolute bottom-0 right-0 bg-primary text-white p-2.5 rounded-full cursor-pointer hover:bg-primary/90 transition-all shadow-lg group-hover:scale-110"
                                    >
                                        {isUploadingPicture ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            <Camera className="h-5 w-5" />
                                        )}
                                    </label>
                                    <input
                                        id="profile-picture-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfilePictureUpload}
                                        className="hidden"
                                        disabled={isUploadingPicture}
                                    />
                                </div>
                                <p className="text-sm text-muted-foreground text-center max-w-md">
                                    Click the camera icon to upload a new profile picture. <br />
                                    Images will be automatically cropped to 1:1 ratio.
                                </p>
                            </div>

                            {/* Account Details */}
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-muted-foreground text-sm">Full Name</Label>
                                        {!isEditingName && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleEditName}
                                                className="h-7 px-2 text-xs"
                                            >
                                                <Edit3 className="h-3 w-3 mr-1" />
                                                Edit
                                            </Button>
                                        )}
                                    </div>
                                    {isEditingName ? (
                                        <div className="flex gap-2 mt-2">
                                            <Input
                                                value={editedName}
                                                onChange={(e) => setEditedName(e.target.value)}
                                                className="h-9"
                                                disabled={isSavingName}
                                                autoFocus
                                            />
                                            <Button
                                                size="sm"
                                                onClick={handleSaveName}
                                                disabled={isSavingName || !editedName.trim()}
                                                className="h-9"
                                            >
                                                {isSavingName ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    "Save"
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => setIsEditingName(false)}
                                                disabled={isSavingName}
                                                className="h-9"
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    ) : (
                                        <p className="font-semibold text-lg">{admin?.name}</p>
                                    )}
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50">
                                    <Label className="text-muted-foreground text-sm">Email Address</Label>
                                    <p className="font-semibold text-lg">{admin?.email}</p>
                                </div>
                                <div className="space-y-2 p-4 rounded-xl bg-muted/50">
                                    <Label className="text-muted-foreground text-sm">Role</Label>
                                    <div className="flex items-center gap-2 mt-1">
                                        {admin?.role === "super_admin" ? (
                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 text-sm px-3 py-1">
                                                <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
                                                Super Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="text-sm px-3 py-1">
                                                <Shield className="h-3.5 w-3.5 mr-1.5" />
                                                Admin
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Change Password Tab */}
                <TabsContent value="password">
                    <Card className="rounded-2xl max-w-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Lock className="h-5 w-5 text-primary" />
                                Change Password
                            </CardTitle>
                            <CardDescription>Update your account password</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleChangePassword} className="space-y-4">
                                {passwordError && (
                                    <Alert variant="destructive" className="rounded-xl">
                                        <AlertDescription>{passwordError}</AlertDescription>
                                    </Alert>
                                )}

                                {passwordSuccess && (
                                    <Alert className="rounded-xl border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/50">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                        <AlertDescription className="text-emerald-700 dark:text-emerald-300">
                                            Password changed successfully!
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">Current Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="currentPassword"
                                            type={showCurrentPassword ? "text" : "password"}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="h-11 rounded-xl pr-10"
                                            disabled={isChanging}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showNewPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="h-11 rounded-xl pr-10"
                                            disabled={isChanging}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="h-11 rounded-xl"
                                        disabled={isChanging}
                                    />
                                </div>

                                <Button type="submit" className="w-full h-11 rounded-xl" disabled={isChanging}>
                                    {isChanging ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="mr-2 h-4 w-4" />
                                            Update Password
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Users Management Tab (Super Admin Only) */}
                {isSuperAdmin && (
                    <TabsContent value="users" className="space-y-6">
                        {/* Header with Create Button */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-xl font-semibold">Admin Users</h2>
                                <p className="text-sm text-muted-foreground">Manage all administrator accounts</p>
                            </div>
                            <Button onClick={() => setShowCreateModal(true)} className="gap-2 w-full sm:w-auto">
                                <UserPlus className="h-4 w-4" />
                                Create Admin
                            </Button>
                        </div>

                        {/* Admin Users Table */}
                        <Card className="rounded-2xl overflow-hidden">
                            {!allAdmins ? (
                                <div className="flex items-center justify-center py-16">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : allAdmins.length === 0 ? (
                                <div className="text-center py-16">
                                    <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-muted-foreground">No admin users found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted/50">
                                                <TableHead className="font-semibold">User</TableHead>
                                                <TableHead className="font-semibold">Email</TableHead>
                                                <TableHead className="font-semibold">Role</TableHead>
                                                <TableHead className="font-semibold">Status</TableHead>
                                                <TableHead className="font-semibold">Last Login</TableHead>
                                                <TableHead className="font-semibold text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allAdmins.map((adminUser) => (
                                                <TableRow key={adminUser.id} className="hover:bg-muted/30">
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                                {adminUser.profilePictureUrl ? (
                                                                    <img 
                                                                        src={adminUser.profilePictureUrl} 
                                                                        alt={adminUser.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <span className="text-sm font-semibold text-primary">
                                                                        {adminUser.name.charAt(0).toUpperCase()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-medium truncate">{adminUser.name}</p>
                                                                {adminUser.isOnline && (
                                                                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                                                                        <Circle className="h-2 w-2 fill-emerald-500" />
                                                                        Online
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {adminUser.email}
                                                    </TableCell>
                                                    <TableCell>
                                                        {adminUser.role === "super_admin" ? (
                                                            <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                                                                <ShieldCheck className="h-3 w-3 mr-1" />
                                                                Super Admin
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                <Shield className="h-3 w-3 mr-1" />
                                                                Admin
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge
                                                            className={
                                                                adminUser.isActive
                                                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                                                    : "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                                                            }
                                                        >
                                                            {adminUser.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground text-sm">
                                                        {adminUser.lastLoginAt
                                                            ? formatDistanceToNow(new Date(adminUser.lastLoginAt), { addSuffix: true })
                                                            : "Never"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-1">
                                                            {adminUser.id !== admin?.id ? (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => handleToggleStatus(adminUser.id)}
                                                                        title={adminUser.isActive ? "Deactivate" : "Activate"}
                                                                        className="h-8 px-2"
                                                                    >
                                                                        {adminUser.isActive ? (
                                                                            <ToggleRight className="h-4 w-4 text-emerald-600" />
                                                                        ) : (
                                                                            <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                                                                        )}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => setDeleteAdminId(adminUser.id)}
                                                                        className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <Badge variant="outline" className="text-xs">You</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                )}
            </Tabs>

            {/* Create Admin Modal */}
            <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <UserPlus className="h-5 w-5 text-primary" />
                            Create Admin Account
                        </DialogTitle>
                        <DialogDescription>
                            Add a new admin user to the blog system
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateAdmin}>
                        <div className="space-y-4 py-4">
                            {createError && (
                                <Alert variant="destructive" className="rounded-xl">
                                    <AlertDescription>{createError}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="newName">Full Name</Label>
                                <Input
                                    id="newName"
                                    placeholder="John Doe"
                                    value={newAdminName}
                                    onChange={(e) => setNewAdminName(e.target.value)}
                                    required
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newEmail">Email</Label>
                                <Input
                                    id="newEmail"
                                    type="email"
                                    placeholder="admin@example.com"
                                    value={newAdminEmail}
                                    onChange={(e) => setNewAdminEmail(e.target.value)}
                                    required
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="newPassword">Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="Min. 8 characters"
                                    value={newAdminPassword}
                                    onChange={(e) => setNewAdminPassword(e.target.value)}
                                    required
                                    className="rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Select value={newAdminRole} onValueChange={setNewAdminRole}>
                                    <SelectTrigger className="rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">
                                            <div className="flex items-center gap-2">
                                                <Shield className="h-4 w-4" />
                                                Admin
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="super_admin">
                                            <div className="flex items-center gap-2">
                                                <ShieldCheck className="h-4 w-4" />
                                                Super Admin
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Super Admins can manage other admin accounts
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isCreating}>
                                {isCreating ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Admin"
                                )}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteAdminId} onOpenChange={() => setDeleteAdminId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Admin Account</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this admin account? This action cannot be undone.
                            The user will immediately lose access to the admin panel.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteAdmin}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete Account"
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
