// Hook for syncing tags to HubSpot properties
// Automatically syncs when tags are created, updated, or deleted

import { useEffect, useCallback, useState } from 'react';
import { hubspotPropertySyncService, TagDefinition, SyncResult, SyncStatus } from '@/services/hubspotPropertySync';
import { useHubSpot } from '@/contexts/HubSpotContext';
import { Tag } from '@/types/tag';

interface UseTagSyncOptions {
  autoSync?: boolean;
  onSyncComplete?: (result: SyncResult) => void;
  onSyncError?: (error: string) => void;
}

interface UseTagSyncReturn {
  syncStatus: SyncStatus | null;
  syncInProgress: boolean;
  lastSyncResult: SyncResult | null;
  syncTags: () => Promise<SyncResult>;
  getSyncStatus: () => Promise<void>;
}

export function useTagSync(options: UseTagSyncOptions = {}): UseTagSyncReturn {
  const { autoSync = true, onSyncComplete, onSyncError } = options;
  const { tags, connectionStatus } = useHubSpot();
  const isConnected = connectionStatus.isConnected;
  
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<SyncResult | null>(null);

  // Get sync status from HubSpot
  const getSyncStatus = useCallback(async () => {
    if (!isConnected) return;
    
    const status = await hubspotPropertySyncService.getSyncStatus();
    if (status) {
      setSyncStatus(status);
    }
  }, [isConnected]);

  // Sync all tags to HubSpot
  const syncTags = useCallback(async (): Promise<SyncResult> => {
    if (!isConnected || tags.length === 0) {
      return {
        success: false,
        results: {},
        errors: ['Not connected or no tags to sync'],
      };
    }

    setSyncInProgress(true);

    try {
      const tagDefinitions: TagDefinition[] = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        category: tag.category,
      }));

      const result = await hubspotPropertySyncService.syncTagsToHubSpot(tagDefinitions);
      
      setLastSyncResult(result);
      
      if (result.success) {
        onSyncComplete?.(result);
        // Refresh sync status after successful sync
        await getSyncStatus();
      } else if (result.errors?.length) {
        onSyncError?.(result.errors.join(', '));
      }

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const result: SyncResult = {
        success: false,
        results: {},
        errors: [errorMessage],
      };
      setLastSyncResult(result);
      onSyncError?.(errorMessage);
      return result;
    } finally {
      setSyncInProgress(false);
    }
  }, [isConnected, tags, onSyncComplete, onSyncError, getSyncStatus]);

  // Auto-sync when tags change
  useEffect(() => {
    if (autoSync && isConnected && tags.length > 0) {
      // Debounce sync to avoid too many API calls
      const timeout = setTimeout(() => {
        syncTags();
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [autoSync, isConnected, tags, syncTags]);

  // Get initial sync status
  useEffect(() => {
    if (isConnected) {
      getSyncStatus();
    }
  }, [isConnected, getSyncStatus]);

  return {
    syncStatus,
    syncInProgress,
    lastSyncResult,
    syncTags,
    getSyncStatus,
  };
}

// Hook for individual tag operations with HubSpot sync
export function useTagWithSync() {
  const { createTag, updateTag, deleteTag, tags, connectionStatus } = useHubSpot();
  const [syncing, setSyncing] = useState(false);

  const createTagWithSync = useCallback(async (
    name: string,
    color: string,
    category?: string
  ): Promise<Tag | null> => {
    const newTag = await createTag({ 
      name, 
      color, 
      category,
      contactCount: 0,
      companyCount: 0,
      dealCount: 0
    });
    
    if (newTag && connectionStatus?.isConnected) {
      setSyncing(true);
      try {
        // Add the new tag to HubSpot property options
        const allTags = [...tags, newTag];
        await hubspotPropertySyncService.syncTagsToHubSpot(
          allTags.map(t => ({ 
            id: typeof t.id === 'string' ? t.id : String(t.id), 
            name: t.name, 
            color: t.color, 
            category: t.category 
          }))
        );
      } catch (error) {
        console.error('Failed to sync new tag to HubSpot:', error);
      } finally {
        setSyncing(false);
      }
    }

    return newTag;
  }, [createTag, tags, connectionStatus]);

  const deleteTagWithSync = useCallback(async (tagId: string): Promise<void> => {
    const tagToDelete = tags.find(t => t.id === tagId);
    
    await deleteTag(tagId);
    
    if (tagToDelete && connectionStatus?.isConnected) {
      setSyncing(true);
      try {
        // Remove the tag from HubSpot property options
        await hubspotPropertySyncService.removeTagFromHubSpot(tagToDelete.name);
      } catch (error) {
        console.error('Failed to remove tag from HubSpot:', error);
      } finally {
        setSyncing(false);
      }
    }
  }, [deleteTag, tags, connectionStatus]);

  return {
    createTagWithSync,
    updateTag, // Update doesn't need special sync - just syncs on next full sync
    deleteTagWithSync,
    syncing,
  };
}

export default useTagSync;
