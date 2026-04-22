import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "@/contexts/AdminContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Loader2, Eye, EyeOff } from "lucide-react";
import { ADMIN_PATH } from "@/lib/adminConfig";

export default function AdminLogin() {
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated } = useAdmin();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Redirect if already authenticated
    if (isAuthenticated && !isLoading) {
        navigate(ADMIN_PATH);
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsSubmitting(true);

        try {
            await login(email, password);
            navigate(ADMIN_PATH);
        } catch (err: any) {
            // Parse error message and show user-friendly version
            const errorMessage = err.message || "";

            if (errorMessage.toLowerCase().includes("invalid email") ||
                errorMessage.toLowerCase().includes("user not found") ||
                errorMessage.toLowerCase().includes("admin not found")) {
                setError("Email not found. Please check your email address.");
            } else if (errorMessage.toLowerCase().includes("invalid password") ||
                errorMessage.toLowerCase().includes("incorrect password") ||
                errorMessage.toLowerCase().includes("wrong password")) {
                setError("Wrong password. Please try again.");
            } else if (errorMessage.toLowerCase().includes("account") &&
                errorMessage.toLowerCase().includes("disabled")) {
                setError("Account is disabled. Contact administrator.");
            } else if (errorMessage.toLowerCase().includes("too many")) {
                setError("Too many login attempts. Try again later.");
            } else {
                // Generic error - hide technical details
                setError("Invalid email or password. Please try again.");
            }
            console.error("Admin login error:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute -bottom-1/2 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
            </div>

            <Card className="w-full max-w-md relative z-10 shadow-2xl border-border/50">
                <CardHeader className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/30">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
                        <CardDescription className="mt-2">
                            Sign in to access the blog admin panel
                        </CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <Alert variant="destructive" className="rounded-xl">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="admin@tagbase.co"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isSubmitting}
                                className="h-11 rounded-xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isSubmitting}
                                    className="h-11 rounded-xl pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-11 rounded-xl font-medium"
                            disabled={isSubmitting || isLoading}
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <a
                            href="/"
                            className="text-sm text-muted-foreground hover:text-primary transition-colors"
                        >
                            ← Back to main site
                        </a>
                    </div>
                </CardContent>
            </Card>
        </main>
    );
}
