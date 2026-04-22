import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    profilePictureUrl?: string;
}

interface AdminContextType {
    admin: AdminUser | null;
    sessionToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ADMIN_SESSION_KEY = 'tagbase_admin_session';

export function AdminProvider({ children }: { children: ReactNode }) {
    const [sessionToken, setSessionToken] = useState<string | null>(() => {
        return localStorage.getItem(ADMIN_SESSION_KEY);
    });
    const [isLoading, setIsLoading] = useState(true);

    // Convex mutations
    const loginMutation = useMutation(api.adminAuth.login);
    const logoutMutation = useMutation(api.adminAuth.logout);
    const changePasswordMutation = useMutation(api.adminAuth.changePassword);
    const updateActivityMutation = useMutation(api.adminAuth.updateSessionActivity);

    // Validate session
    const validatedAdmin = useQuery(
        api.adminAuth.validateSession,
        sessionToken ? { sessionToken } : 'skip'
    );

    // Update loading state when validation completes
    useEffect(() => {
        if (sessionToken === null || validatedAdmin !== undefined) {
            setIsLoading(false);
        }
    }, [sessionToken, validatedAdmin]);

    // Clear invalid session
    useEffect(() => {
        if (sessionToken && validatedAdmin === null) {
            localStorage.removeItem(ADMIN_SESSION_KEY);
            setSessionToken(null);
        }
    }, [sessionToken, validatedAdmin]);

    // Keep session active
    useEffect(() => {
        if (sessionToken && validatedAdmin) {
            const interval = setInterval(() => {
                updateActivityMutation({ sessionToken });
            }, 5 * 60 * 1000); // Every 5 minutes

            return () => clearInterval(interval);
        }
    }, [sessionToken, validatedAdmin, updateActivityMutation]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const result = await loginMutation({ email, password });
            localStorage.setItem(ADMIN_SESSION_KEY, result.sessionToken);
            setSessionToken(result.sessionToken);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        if (sessionToken) {
            try {
                await logoutMutation({ sessionToken });
            } catch (e) {
                console.error('Logout error:', e);
            }
        }
        localStorage.removeItem(ADMIN_SESSION_KEY);
        setSessionToken(null);
    };

    const changePassword = async (currentPassword: string, newPassword: string) => {
        if (!sessionToken) throw new Error('Not authenticated');
        await changePasswordMutation({ sessionToken, currentPassword, newPassword });
    };

    const admin: AdminUser | null = validatedAdmin ? {
        id: validatedAdmin.id,
        email: validatedAdmin.email,
        name: validatedAdmin.name,
        role: validatedAdmin.role,
        profilePictureUrl: validatedAdmin.profilePictureUrl,
    } : null;

    return (
        <AdminContext.Provider
            value={{
                admin,
                sessionToken,
                isLoading,
                isAuthenticated: !!admin,
                login,
                logout,
                changePassword,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
