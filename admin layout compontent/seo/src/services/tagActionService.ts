// Tag Action Service
// Handles adding/removing tags to HubSpot records via serverless functions
// Works with Private Apps (access token) or OAuth apps

import { getHubSpotConfig, getStoredTokens } from '@/config/hubspot';

interface TagActionResult {
  success: boolean;
  message: string;
  currentTags?: string[];
  error?: string;
}

interface TagActionRequest {
  action: 'add' | 'remove';
  objectType: 'contacts' | 'companies' | 'deals' | 'tickets';
  objectId: string;
  tagName: string;
}

/**
 * Service for managing tag assignments on HubSpot records
 */
class TagActionService {
  private baseUrl = '/.netlify/functions/hubspot-tag-action';
  private logUrl = '/.netlify/functions/convex-log-tag-action';
  
  /**
   * Get the current access token (from OAuth or Private App)
   */
  private getAccessToken(): string | null {
    // First check OAuth tokens
    const oauthTokens = getStoredTokens();
    if (oauthTokens?.accessToken) {
      return oauthTokens.accessToken;
    }
    
    // Fall back to Private App token
    const config = getHubSpotConfig();
    return config.accessToken || null;
  }
  
  /**
   * Get the portal ID (user ID) for logging
   */
  private getPortalId(): string | null {
    const oauthTokens = getStoredTokens();
    return oauthTokens?.portalId || null;
  }
  
  /**
   * Log tag action to history for journey tracking
   */
  private async logTagAction(
    objectId: string,
    objectType: string,
    tagId: string,
    tagName: string,
    tagColor: string,
    action: 'added' | 'removed'
  ): Promise<void> {
    const portalId = this.getPortalId();
    if (!portalId) {
      console.warn('Cannot log tag action: no portal ID available');
      return;
    }
    
    try {
      await fetch(this.logUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objectId,
          objectType,
          tagId,
          tagName,
          tagColor,
          action,
          userId: portalId,
        }),
      });
    } catch (error) {
      console.error('Failed to log tag action:', error);
      // Don't throw - logging is optional
    }
  }
  
  /**
   * Add a tag to a HubSpot record
   */
  async addTag(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectId: string,
    tagName: string,
    tagId?: string,
    tagColor?: string
  ): Promise<TagActionResult> {
    return this.executeTagAction(
      {
        action: 'add',
        objectType,
        objectId,
        tagName,
      },
      tagId || tagName, // Use tagName as fallback ID
      tagColor
    );
  }
  
  /**
   * Remove a tag from a HubSpot record
   */
  async removeTag(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectId: string,
    tagName: string,
    tagId?: string,
    tagColor?: string
  ): Promise<TagActionResult> {
    return this.executeTagAction(
      {
        action: 'remove',
        objectType,
        objectId,
        tagName,
      },
      tagId || tagName, // Use tagName as fallback ID
      tagColor
    );
  }
  
  /**
   * Set multiple tags on a record (replaces existing)
   * Automatically logs tag changes to history for journey tracking
   */
  async setTags(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectId: string,
    tagNames: string[],
    tagMetadata?: Map<string, { id: string; color: string }>
  ): Promise<TagActionResult> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return {
        success: false,
        message: 'Not connected to HubSpot',
        error: 'NO_ACCESS_TOKEN',
      };
    }
    
    try {
      // Get current tags first
      const currentTags = await this.getTags(objectType, objectId);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'set',
          objectType,
          objectId,
          tagNames,
          accessToken,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to set tags',
          error: data.error,
        };
      }
      
      // Log tag changes to history
      const currentTagSet = new Set(currentTags);
      const newTagSet = new Set(tagNames);
      
      // Log removed tags
      for (const tag of currentTags) {
        if (!newTagSet.has(tag)) {
          const metadata = tagMetadata?.get(tag);
          await this.logTagAction(
            objectId,
            objectType,
            metadata?.id || tag,
            tag,
            metadata?.color || '#6b7280',
            'removed'
          );
        }
      }
      
      // Log added tags
      for (const tag of tagNames) {
        if (!currentTagSet.has(tag)) {
          const metadata = tagMetadata?.get(tag);
          await this.logTagAction(
            objectId,
            objectType,
            metadata?.id || tag,
            tag,
            metadata?.color || '#6b7280',
            'added'
          );
        }
      }
      
      return {
        success: true,
        message: data.message || 'Tags updated successfully',
        currentTags: data.tags,
      };
    } catch (error) {
      console.error('Failed to set tags:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        error: 'NETWORK_ERROR',
      };
    }
  }
  
  /**
   * Get current tags for a record
   */
  async getTags(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectId: string
  ): Promise<string[]> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      console.error('No access token available');
      return [];
    }
    
    try {
      const response = await fetch(
        `${this.baseUrl}?objectType=${objectType}&objectId=${objectId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        return [];
      }
      
      const data = await response.json();
      return data.tags || [];
    } catch (error) {
      console.error('Failed to get tags:', error);
      return [];
    }
  }
  
  /**
   * Execute a tag action (add or remove)
   */
  private async executeTagAction(
    request: TagActionRequest,
    tagId?: string,
    tagColor?: string
  ): Promise<TagActionResult> {
    const accessToken = this.getAccessToken();
    
    if (!accessToken) {
      return {
        success: false,
        message: 'Not connected to HubSpot',
        error: 'NO_ACCESS_TOKEN',
      };
    }
    
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          accessToken,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: data.error || 'Failed to update tags',
          error: data.error,
        };
      }
      
      // Log to history for journey tracking
      if (tagId) {
        await this.logTagAction(
          request.objectId,
          request.objectType,
          tagId,
          request.tagName,
          tagColor || '#6b7280',
          request.action === 'add' ? 'added' : 'removed'
        );
      }
      
      return {
        success: true,
        message: data.message || `Tag ${request.action === 'add' ? 'added' : 'removed'} successfully`,
        currentTags: data.tags,
      };
    } catch (error) {
      console.error('Failed to execute tag action:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
        error: 'NETWORK_ERROR',
      };
    }
  }
  
  /**
   * Bulk add a tag to multiple records
   */
  async bulkAddTag(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectIds: string[],
    tagName: string
  ): Promise<{ success: boolean; results: TagActionResult[] }> {
    const results = await Promise.allSettled(
      objectIds.map(id => this.addTag(objectType, id, tagName))
    );
    
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        message: `Failed to add tag to ${objectIds[index]}`,
        error: 'PROMISE_REJECTED',
      };
    });
    
    const allSuccess = processedResults.every(r => r.success);
    
    return {
      success: allSuccess,
      results: processedResults,
    };
  }
  
  /**
   * Bulk remove a tag from multiple records
   */
  async bulkRemoveTag(
    objectType: 'contacts' | 'companies' | 'deals' | 'tickets',
    objectIds: string[],
    tagName: string
  ): Promise<{ success: boolean; results: TagActionResult[] }> {
    const results = await Promise.allSettled(
      objectIds.map(id => this.removeTag(objectType, id, tagName))
    );
    
    const processedResults = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      }
      return {
        success: false,
        message: `Failed to remove tag from ${objectIds[index]}`,
        error: 'PROMISE_REJECTED',
      };
    });
    
    const allSuccess = processedResults.every(r => r.success);
    
    return {
      success: allSuccess,
      results: processedResults,
    };
  }
}

// Export singleton instance
export const tagActionService = new TagActionService();
export default tagActionService;
