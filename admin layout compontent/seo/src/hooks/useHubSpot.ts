// Custom hooks for HubSpot integration

import { useCallback, useState } from 'react';
import { useHubSpot } from '@/contexts/HubSpotContext';
import { hubspotService } from '@/services/hubspotService';
import { Tag, ObjectType, CRMRecord } from '@/types/tag';
import { HubSpotContact, HubSpotCompany, HubSpotDeal } from '@/types/hubspot';

// Hook for bulk tagging operations
export function useBulkTagging() {
  const { connectionStatus, tags } = useHubSpot();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [errors, setErrors] = useState<string[]>([]);

  const bulkAddTag = useCallback(async (
    recordIds: string[],
    objectType: ObjectType,
    tagToAdd: Tag
  ) => {
    if (!connectionStatus.isConnected) {
      return { success: false, errors: ['Not connected to HubSpot'] };
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: recordIds.length });
    setErrors([]);

    const errorList: string[] = [];
    
    try {
      const updates = recordIds.map(id => ({
        id,
        tags: [tagToAdd], // Note: In real scenario, we'd merge with existing tags
      }));

      switch (objectType) {
        case 'contact':
          await hubspotService.batchUpdateContactTags(updates);
          break;
        case 'company':
          await hubspotService.batchUpdateCompanyTags(updates);
          break;
        case 'deal':
          await hubspotService.batchUpdateDealTags(updates);
          break;
      }
      
      setProgress({ current: recordIds.length, total: recordIds.length });
    } catch (error) {
      errorList.push(error instanceof Error ? error.message : 'Unknown error');
    }

    setIsProcessing(false);
    setErrors(errorList);
    
    return {
      success: errorList.length === 0,
      errors: errorList,
    };
  }, [connectionStatus.isConnected]);

  const bulkRemoveTag = useCallback(async (
    recordIds: string[],
    objectType: ObjectType,
    tagToRemove: Tag
  ) => {
    if (!connectionStatus.isConnected) {
      return { success: false, errors: ['Not connected to HubSpot'] };
    }

    setIsProcessing(true);
    setProgress({ current: 0, total: recordIds.length });
    setErrors([]);

    const errorList: string[] = [];
    
    try {
      const updates = recordIds.map(id => ({
        id,
        tags: [],
      }));

      switch (objectType) {
        case 'contact':
          await hubspotService.batchUpdateContactTags(updates);
          break;
        case 'company':
          await hubspotService.batchUpdateCompanyTags(updates);
          break;
        case 'deal':
          await hubspotService.batchUpdateDealTags(updates);
          break;
      }
      
      setProgress({ current: recordIds.length, total: recordIds.length });
    } catch (error) {
      errorList.push(error instanceof Error ? error.message : 'Unknown error');
    }

    setIsProcessing(false);
    setErrors(errorList);
    
    return {
      success: errorList.length === 0,
      errors: errorList,
    };
  }, [connectionStatus.isConnected]);

  return {
    isProcessing,
    progress,
    errors,
    bulkAddTag,
    bulkRemoveTag,
  };
}

// Hook for searching HubSpot records
export function useHubSpotSearch() {
  const { connectionStatus, tags } = useHubSpot();
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CRMRecord[]>([]);

  const searchContacts = useCallback(async (query: string) => {
    if (!connectionStatus.isConnected) {
      return [];
    }

    setIsSearching(true);
    
    try {
      const contacts = await hubspotService.searchContacts(query);
      const records = contacts.map(c => ({
        id: c.id,
        name: [c.properties.firstname, c.properties.lastname].filter(Boolean).join(' ') || c.properties.email || 'Unknown',
        type: 'contact' as ObjectType,
        email: c.properties.email,
        phone: c.properties.phone,
        company: c.properties.company,
        tags: [],
      }));
      setResults(records);
      return records;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [connectionStatus.isConnected, tags]);

  return {
    isSearching,
    results,
    searchContacts,
  };
}

// Hook for tag analytics
export function useTagAnalytics() {
  const { tags, records } = useHubSpot();

  const getTagUsage = useCallback(() => {
    const usage: Record<string, { contacts: number; companies: number; deals: number; total: number }> = {};
    
    tags.forEach(tag => {
      usage[tag.id] = { contacts: 0, companies: 0, deals: 0, total: 0 };
    });

    records.forEach(record => {
      record.tags.forEach(tag => {
        if (usage[tag.id]) {
          usage[tag.id].total++;
          switch (record.type) {
            case 'contact':
              usage[tag.id].contacts++;
              break;
            case 'company':
              usage[tag.id].companies++;
              break;
            case 'deal':
              usage[tag.id].deals++;
              break;
          }
        }
      });
    });

    return usage;
  }, [tags, records]);

  const getMostUsedTags = useCallback((limit = 5) => {
    const usage = getTagUsage();
    return tags
      .map(tag => ({ ...tag, usageCount: usage[tag.id]?.total || 0 }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }, [tags, getTagUsage]);

  const getUnusedTags = useCallback(() => {
    const usage = getTagUsage();
    return tags.filter(tag => (usage[tag.id]?.total || 0) === 0);
  }, [tags, getTagUsage]);

  return {
    getTagUsage,
    getMostUsedTags,
    getUnusedTags,
  };
}

// Hook for HubSpot connection management
export function useHubSpotConnection() {
  const { connectionStatus, isConnecting, connect, disconnect, testConnection } = useHubSpot();

  // Refresh connection status (useful after OAuth flow)
  const refreshConnection = useCallback(async () => {
    await testConnection();
  }, [testConnection]);

  return {
    isConnected: connectionStatus.isConnected,
    isConnecting,
    portalId: connectionStatus.portalId,
    portalName: connectionStatus.portalName,
    domain: connectionStatus.domain,
    error: connectionStatus.error,
    lastChecked: connectionStatus.lastChecked,
    connect,
    disconnect,
    testConnection,
    refreshConnection,
  };
}
