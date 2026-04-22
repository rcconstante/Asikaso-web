// HubSpot Property Sync Service
// Handles synchronization of tags to HubSpot multi-checkbox properties

import { getStoredTokens } from '@/config/hubspot';
import { syncLogger } from '@/lib/logger';

const SYNC_API_BASE = '/api/hubspot-property-sync';
const TAG_ACTION_API = '/api/hubspot-tag-action';
const CRM_CARD_API = '/api/hubspot-crm-card';

export interface TagDefinition {
  id: string;
  name: string;
  color: string;
  category?: string;
  objectTypes?: string[];
}

export interface SyncStatus {
  [objectType: string]: {
    exists: boolean;
    optionsCount: number;
    options: string[];
  };
}

export interface SyncResult {
  success: boolean;
  results: {
    [objectType: string]: {
      success: boolean;
      optionsCount?: number;
      error?: string;
    };
  };
  errors?: string[];
}

class HubSpotPropertySyncService {
  private getAccessToken(): string | null {
    const tokens = getStoredTokens();
    return tokens?.accessToken || null;
  }

  /**
   * Get sync status for all object types
   */
  async getSyncStatus(): Promise<SyncStatus | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      syncLogger.error('No access token available');
      return null;
    }

    try {
      const response = await fetch(`${SYNC_API_BASE}?accessToken=${encodeURIComponent(accessToken)}`);
      if (!response.ok) {
        throw new Error('Failed to get sync status');
      }
      const data = await response.json();
      return data.status;
    } catch (error) {
      syncLogger.error('Failed to get sync status:', error);
      return null;
    }
  }

  /**
   * Sync all tags to HubSpot properties
   */
  async syncTagsToHubSpot(
    tags: TagDefinition[],
    objectTypes?: string[]
  ): Promise<SyncResult> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      return {
        success: false,
        results: {},
        errors: ['No access token available. Please connect to HubSpot.'],
      };
    }

    try {
      const response = await fetch(SYNC_API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          tags,
          objectTypes,
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      syncLogger.error('Failed to sync tags:', error);
      return {
        success: false,
        results: {},
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  /**
   * Clean up all orphaned tag IDs from HubSpot records
   * This removes property values that are no longer valid options
   */
  async cleanupOrphanedTags(): Promise<{ success: boolean; results?: any }> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      syncLogger.error('No access token for cleanupOrphanedTags');
      return { success: false };
    }

    try {
      syncLogger.debug('Starting orphaned tag cleanup...');
      
      const response = await fetch(SYNC_API_BASE, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
        }),
      });

      const data = await response.json();
      syncLogger.debug('Cleanup response:', data);
      
      return { success: response.ok, results: data };
    } catch (error) {
      syncLogger.error('Failed to cleanup orphaned tags:', error);
      return { success: false };
    }
  }

  /**
   * Remove a tag from HubSpot properties and clean up from all records
   */
  async removeTagFromHubSpot(tagName: string, tagId?: string): Promise<{ success: boolean; results?: any }> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      syncLogger.error('No access token for removeTagFromHubSpot');
      return { success: false };
    }

    try {
      syncLogger.debug('Removing tag from HubSpot:', { tagName, tagId });
      
      const response = await fetch(SYNC_API_BASE, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken,
          tagName,
          tagId, // Pass the actual tag ID used in property values
          cleanupRecords: true, // Also remove from all records that have this tag
        }),
      });

      const data = await response.json();
      syncLogger.debug('Remove tag response:', data);
      
      return { success: response.ok, results: data };
    } catch (error) {
      syncLogger.error('Failed to remove tag:', error);
      return { success: false };
    }
  }

  /**
   * Add tag to an object (for workflow actions)
   */
  async addTagToObject(
    objectType: string,
    objectId: string,
    tagName: string
  ): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(TAG_ACTION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          objectType,
          objectId,
          tagName,
          accessToken,
        }),
      });

      return response.ok;
    } catch (error) {
      syncLogger.error('Failed to add tag:', error);
      return false;
    }
  }

  /**
   * Remove tag from an object (for workflow actions)
   */
  async removeTagFromObject(
    objectType: string,
    objectId: string,
    tagName: string
  ): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(TAG_ACTION_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          objectType,
          objectId,
          tagName,
          accessToken,
        }),
      });

      return response.ok;
    } catch (error) {
      syncLogger.error('Failed to remove tag from object:', error);
      return false;
    }
  }

  /**
   * Get tags for an object (via CRM card API)
   */
  async getObjectTags(objectType: string, objectId: string): Promise<string[]> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return [];

    try {
      const params = new URLSearchParams({
        objectType,
        objectId,
        accessToken,
      });

      const response = await fetch(`${CRM_CARD_API}?${params}`);
      if (!response.ok) return [];

      const data = await response.json();
      // Extract tags from CRM card response
      const tagsSection = data.results?.[0]?.sections?.find(
        (s: { id: string }) => s.id === 'current-tags'
      );
      if (tagsSection?.rows) {
        return tagsSection.rows
          .filter((r: { type: string }) => r.type === 'BADGE')
          .map((r: { text: string }) => r.text);
      }
      return [];
    } catch (error) {
      syncLogger.error('Failed to get object tags:', error);
      return [];
    }
  }

  /**
   * Update all tags for an object
   */
  async updateObjectTags(
    objectType: string,
    objectId: string,
    tags: string[]
  ): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return false;

    try {
      const response = await fetch(CRM_CARD_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectType,
          objectId,
          tags,
          accessToken,
        }),
      });

      return response.ok;
    } catch (error) {
      syncLogger.error('Failed to update object tags:', error);
      return false;
    }
  }

  /**
   * Ensure a tag is synced to HubSpot property options before using it
   * This prevents "INVALID_OPTION" errors when adding tags to records
   */
  async ensureTagsSynced(tags: TagDefinition[]): Promise<boolean> {
    const accessToken = this.getAccessToken();
    if (!accessToken) {
      syncLogger.error('No access token available for sync');
      return false;
    }

    try {
      const result = await this.syncTagsToHubSpot(tags);
      return result.success;
    } catch (error) {
      syncLogger.error('Failed to ensure tags synced:', error);
      return false;
    }
  }
}

export const hubspotPropertySyncService = new HubSpotPropertySyncService();
export default hubspotPropertySyncService;
