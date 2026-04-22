/**
 * Notification Helper
 * Provides centralized toast notifications for the app
 */

import { toast } from '@/hooks/use-toast';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface NotifyOptions {
    title: string;
    description?: string;
    type?: NotificationType;
    duration?: number;
}

/**
 * Show a notification toast
 */
export function notify({ title, description, type = 'info', duration }: NotifyOptions) {
    toast({
        title,
        description,
        variant: type === 'error' ? 'destructive' : 'default',
        duration: duration || (type === 'error' ? 5000 : 3000),
    });
}

/**
 * Pre-built notifications for common scenarios
 */
export const notifications = {
    // Connection
    connected: () => notify({
        title: 'Connected to HubSpot',
        description: 'Your HubSpot account is now connected.',
        type: 'success',
    }),

    disconnected: () => notify({
        title: 'Disconnected from HubSpot',
        description: 'Your HubSpot connection has been removed.',
        type: 'info',
    }),

    connectionError: () => notify({
        title: 'Connection Error',
        description: 'Failed to connect to HubSpot. Please try again.',
        type: 'error',
    }),

    tokenExpired: () => notify({
        title: 'Session Expired',
        description: 'Please reconnect to HubSpot to continue.',
        type: 'warning',
    }),

    // Tags
    tagCreated: (name: string) => notify({
        title: 'Tag Created',
        description: `"${name}" has been created successfully.`,
        type: 'success',
    }),

    tagUpdated: (name: string) => notify({
        title: 'Tag Updated',
        description: `"${name}" has been updated.`,
        type: 'success',
    }),

    tagDeleted: (name: string) => notify({
        title: 'Tag Deleted',
        description: `"${name}" has been removed.`,
        type: 'success',
    }),

    tagLimitReached: () => notify({
        title: 'Tag Limit Reached',
        description: 'Upgrade to Basic or Pro for unlimited tags.',
        type: 'error',
    }),

    tagSyncError: () => notify({
        title: 'Sync Warning',
        description: 'Tag was saved but HubSpot sync failed. Will retry later.',
        type: 'warning',
    }),

    // Records
    recordTagged: (tagName: string) => notify({
        title: 'Tag Applied',
        description: `"${tagName}" has been applied to the record.`,
        type: 'success',
    }),

    recordUntagged: (tagName: string) => notify({
        title: 'Tag Removed',
        description: `"${tagName}" has been removed from the record.`,
        type: 'success',
    }),

    bulkTagSuccess: (count: number) => notify({
        title: 'Bulk Tag Applied',
        description: `Tag applied to ${count} record${count !== 1 ? 's' : ''}.`,
        type: 'success',
    }),

    // Plan/Upgrade
    upgradeRequired: (feature: string) => notify({
        title: 'Upgrade Required',
        description: `${feature} requires a paid plan.`,
        type: 'warning',
    }),

    trialStarted: () => notify({
        title: 'Trial Started! 🎉',
        description: 'Enjoy 3 days of Pro features.',
        type: 'success',
    }),

    trialEnding: (days: number) => notify({
        title: 'Trial Ending Soon',
        description: `Your trial ends in ${days} day${days !== 1 ? 's' : ''}.`,
        type: 'warning',
    }),

    // General
    saved: () => notify({
        title: 'Saved',
        description: 'Your changes have been saved.',
        type: 'success',
    }),

    error: (message?: string) => notify({
        title: 'Error',
        description: message || 'Something went wrong. Please try again.',
        type: 'error',
    }),

    loading: (message?: string) => notify({
        title: 'Loading',
        description: message || 'Please wait...',
        type: 'info',
    }),
};

export default notifications;
