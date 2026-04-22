// HubSpot Context Provider
// Provides HubSpot connection state and methods throughout the app

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { hubspotService } from '@/services/hubspotService';
import { hubspotPropertySyncService } from '@/services/hubspotPropertySync';
import { tagActionService } from '@/services/tagActionService';
import {
  getHubSpotConfig,
  saveHubSpotConfig,
  clearHubSpotConfig,
  clearStoredTokens,
  HubSpotConfig
} from '@/config/hubspot';
import {
  HubSpotConnectionStatus,
  TagSyncStatus,
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
  hubspotContactToCRMRecord,
  hubspotCompanyToCRMRecord,
  hubspotDealToCRMRecord,
  hubspotTicketToCRMRecord,
} from '@/types/hubspot';
import { Tag, CRMRecord, ObjectType } from '@/types/tag';
import { useUserSession } from '@/contexts/UserSessionContext';
import { hubspotLogger } from '@/lib/logger';

// Disconnection status interface
interface DisconnectionStatus {
  isDisconnected: boolean;
  reason?: 'app_uninstalled' | 'user_disconnect';
  disconnectedAt?: number;
  dataPreserved?: boolean;
}

// Linked portal info for multi-account support
interface LinkedPortal {
  portalId: string;
  domain?: string;
  portalName?: string;
}

interface HubSpotContextValue {
  // Connection
  connectionStatus: HubSpotConnectionStatus;
  isConnecting: boolean;
  connect: (accessToken: string) => Promise<boolean>;
  disconnect: () => void;
  testConnection: () => Promise<HubSpotConnectionStatus>;

  // Auth error state (token_expired, app_uninstalled, etc.)
  authError: string | null;

  // Reconnect modal (token expired - user still logged into website)
  showReconnectModal: boolean;
  setShowReconnectModal: (show: boolean) => void;
  reconnectReason: 'token_expired' | 'refresh_failed' | 'unauthorized' | null;

  // Multi-account support - linked portals for same email
  linkedPortals: LinkedPortal[];

  // Disconnection (app uninstalled from HubSpot)
  disconnectionStatus: DisconnectionStatus;
  showDisconnectionModal: boolean;
  setShowDisconnectionModal: (show: boolean) => void;
  dismissDisconnectionNotice: () => void;

  // Tags
  tags: Tag[];
  createTag: (tag: Omit<Tag, 'id' | 'createdAt'>) => Promise<Tag>;
  updateTag: (tag: Tag) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;

  // Records
  records: CRMRecord[];
  isLoadingRecords: boolean;
  fetchRecords: (objectTypes?: ObjectType[]) => Promise<void>;
  updateRecordTags: (recordId: string, objectType: ObjectType, tags: Tag[]) => Promise<void>;

  // Sync
  syncStatus: TagSyncStatus;
  setupHubSpotProperties: () => Promise<{ success: boolean; errors: string[] }>;

  // Config
  config: HubSpotConfig;
}

const HubSpotContext = createContext<HubSpotContextValue | undefined>(undefined);

interface HubSpotProviderProps {
  children: React.ReactNode;
  initialTags?: Tag[];
}

export function HubSpotProvider({ children, initialTags = [] }: HubSpotProviderProps) {
  // Get active portal from UserSessionContext - this is the source of truth for which portal to use
  const { activePortalId, userEmail } = useUserSession();

  // Connection state - Start as not connected, let Convex query determine the real state
  const [connectionStatus, setConnectionStatus] = useState<HubSpotConnectionStatus>(() => {
    // Check localStorage for cached status (for faster initial load only)
    const cachedStatus = localStorage.getItem('tagbase_connection_status');
    if (cachedStatus) {
      try {
        const parsed = JSON.parse(cachedStatus);
        return parsed;
      } catch (e) {
        hubspotLogger.error('Failed to parse cached connection status:', e);
      }
    }
    return {
      isConnected: false, // Start as disconnected, let Convex determine real state
    };
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Track if we've had an auth error (token expired/invalid)
  const [authError, setAuthError] = useState<string | null>(null);
  const [config, setConfig] = useState<HubSpotConfig>(getHubSpotConfig);

  // Reconnect modal state (for token expiration - separate from disconnection)
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const [reconnectReason, setReconnectReason] = useState<'token_expired' | 'refresh_failed' | 'unauthorized' | null>(null);

  // Disconnection modal state
  const [showDisconnectionModal, setShowDisconnectionModal] = useState(false);

  // Use activePortalId from session context, fallback to connectionStatus.portalId
  // This ensures we always load data for the correct portal
  const userId = activePortalId || connectionStatus.portalId || 'anonymous';

  // Track previous portal to detect switches
  const prevPortalRef = useRef<string | null>(null);

  // Query cached portal settings from Convex (contains correct domain set during OAuth)
  const cachedPortalSettings = useQuery(
    api.portalSettings.getPortalSettings,
    userId !== 'anonymous' ? { portalId: userId } : 'skip'
  );

  // Query all linked portals for the current user (for multi-account support)
  const userLinkedPortals = useQuery(
    api.users.getUserPortals,
    userEmail ? { email: userEmail } : 'skip'
  );

  // Query tokens from Convex database - this is the source of truth for auth
  const dbTokens = useQuery(
    api.hubspotTokens.getTokens,
    userId !== 'anonymous' ? { portalId: userId } : 'skip'
  );

  // Query disconnection status from Convex
  const portalDisconnectionStatus = useQuery(
    api.cleanup.getPortalDisconnectionStatus,
    userId !== 'anonymous' ? { portalId: userId } : 'skip'
  );

  // Check if user has been notified about disconnection
  const userNotificationStatus = useQuery(
    api.cleanup.hasUserBeenNotified,
    userId !== 'anonymous' && userEmail ? { portalId: userId, userEmail } : 'skip'
  );

  // Mutation to mark user as notified
  const markUserNotifiedMutation = useMutation(api.cleanup.markUserNotifiedOfDisconnection);

  // Compute disconnection status
  const disconnectionStatus: DisconnectionStatus = {
    isDisconnected: !!portalDisconnectionStatus,
    reason: portalDisconnectionStatus?.reason,
    disconnectedAt: portalDisconnectionStatus?.disconnectedAt,
    dataPreserved: portalDisconnectionStatus?.dataPreserved,
  };

  // NOTE: Server-side polling is now handled by Convex cron job (convex/crons.ts)
  // The cron runs every 1 minute and calls the Netlify function
  // Convex subscriptions automatically update the UI when disconnection is detected
  // No need for client-side polling - this reduces API calls significantly

  // Show disconnection modal when disconnection is detected and user hasn't been notified
  useEffect(() => {
    if (
      disconnectionStatus.isDisconnected &&
      userNotificationStatus &&
      !userNotificationStatus.notified &&
      userNotificationStatus.disconnected
    ) {
      setShowDisconnectionModal(true);
    }
  }, [disconnectionStatus.isDisconnected, userNotificationStatus]);

  // Function to dismiss disconnection notice
  const dismissDisconnectionNotice = useCallback(async () => {
    if (userId !== 'anonymous' && userEmail) {
      try {
        await markUserNotifiedMutation({ portalId: userId, userEmail });
      } catch (error) {
        hubspotLogger.error('Failed to mark user as notified:', error);
      }
    }
    setShowDisconnectionModal(false);
  }, [userId, userEmail, markUserNotifiedMutation]);

  // Convex queries - Load tags from database for the CURRENT portal
  const convexTags = useQuery(api.tags.getTags, { userId }) || [];

  // Convert Convex tags to Tag format
  const tags: Tag[] = convexTags.map(tag => ({
    id: tag._id,
    name: tag.name,
    color: tag.color,
    category: tag.category,
    objectTypes: tag.objectTypes,
    contactCount: tag.contactCount,
    companyCount: tag.companyCount,
    dealCount: tag.dealCount,
    ticketCount: tag.ticketCount || 0,
    createdAt: new Date(tag.createdAt),
  }));

  // Track previous tags count for auto-sync
  const prevTagsRef = useRef<number>(0);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Track if reconnect sync has been performed to avoid duplicate syncs
  const reconnectSyncDoneRef = useRef<boolean>(false);
  // Track previous connection status to detect reconnection
  const wasDisconnectedRef = useRef<boolean>(false);

  // Auto-sync tags on RECONNECT: When portal goes from disconnected -> connected
  // This ensures HubSpot properties are recreated after app reinstall
  useEffect(() => {
    // Track when disconnection is detected
    if (disconnectionStatus.isDisconnected) {
      wasDisconnectedRef.current = true;
      reconnectSyncDoneRef.current = false; // Reset sync flag when disconnected
    }

    // Trigger initial sync when reconnected (was disconnected, now connected)
    if (
      wasDisconnectedRef.current &&
      connectionStatus.isConnected &&
      !disconnectionStatus.isDisconnected &&
      !reconnectSyncDoneRef.current &&
      tags.length > 0
    ) {
      hubspotLogger.info('Portal reconnected - triggering initial sync of tags to HubSpot');
      reconnectSyncDoneRef.current = true;

      // Sync all tags to recreate HubSpot properties
      (async () => {
        try {
          const tagDefinitions = tags.map(tag => ({
            id: String(tag.id),
            name: tag.name,
            color: tag.color,
            category: tag.category,
            objectTypes: tag.objectTypes,
          }));

          await hubspotPropertySyncService.syncTagsToHubSpot(
            tagDefinitions,
            ['contacts', 'companies', 'deals', 'tickets']
          );
          hubspotLogger.info('Reconnect sync completed - tags synced to HubSpot');
          wasDisconnectedRef.current = false; // Reset after successful sync
        } catch (error) {
          hubspotLogger.error('Failed to sync tags on reconnect:', error);
          reconnectSyncDoneRef.current = false; // Allow retry on next connection change
        }
      })();
    }
  }, [connectionStatus.isConnected, disconnectionStatus.isDisconnected, tags]);

  // Auto-sync tags to HubSpot when they change
  useEffect(() => {
    // Only sync if connected, NOT disconnected, and tags have changed
    if (connectionStatus.isConnected && !disconnectionStatus.isDisconnected && tags.length !== prevTagsRef.current) {
      // Clear any pending sync
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }

      // Debounce sync to avoid too many API calls
      syncTimeoutRef.current = setTimeout(async () => {
        try {
          const tagDefinitions = tags.map(tag => ({
            id: String(tag.id),
            name: tag.name,
            color: tag.color,
            category: tag.category,
            objectTypes: tag.objectTypes,
          }));

          // Sync to ALL object types explicitly
          await hubspotPropertySyncService.syncTagsToHubSpot(
            tagDefinitions,
            ['contacts', 'companies', 'deals', 'tickets']
          );
          // Tags synced successfully
        } catch (error) {
          hubspotLogger.error('Failed to auto-sync tags to HubSpot:', error);
        }
      }, 1500);

      prevTagsRef.current = tags.length;
    }

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [tags, connectionStatus.isConnected, disconnectionStatus.isDisconnected]);

  // Convex mutations
  const createTagMutation = useMutation(api.tags.createTag);
  const updateTagMutation = useMutation(api.tags.updateTag);
  const deleteTagMutation = useMutation(api.tags.deleteTag);

  // Records state
  const [records, setRecords] = useState<CRMRecord[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Sync state
  const [syncStatus, setSyncStatus] = useState<TagSyncStatus>({
    syncInProgress: false,
    itemsSynced: 0,
    errors: [],
  });

  // Track the last time we successfully tested connection to avoid repeated tests
  const lastConnectionTestRef = useRef<number>(0);
  // Track if a connection test is pending to prevent duplicate calls
  const connectionTestPendingRef = useRef<boolean>(false);

  // Update connection status based on database tokens (Convex is source of truth)
  useEffect(() => {
    // Skip if still loading from database
    if (dbTokens === undefined) {
      return;
    }

    // If we have valid tokens in database, update connection status
    if (dbTokens && !dbTokens.isExpired && dbTokens.accessToken) {
      hubspotLogger.debug('Valid tokens found in database');

      // Update local storage cache for faster initial loads
      const storedTokens = {
        accessToken: dbTokens.accessToken,
        refreshToken: dbTokens.refreshToken,
        expiresAt: dbTokens.expiresAt,
        portalId: userId,
      };
      try {
        localStorage.setItem('hubspot_oauth_tokens', JSON.stringify(storedTokens));
        
        // IMPORTANT: Also update the service config so API calls work
        const newConfig = {
          accessToken: dbTokens.accessToken,
          refreshToken: dbTokens.refreshToken,
          expiresAt: dbTokens.expiresAt,
          portalId: userId,
        };
        saveHubSpotConfig(newConfig);
        setConfig(prev => ({ ...prev, ...newConfig }));
      } catch (e) {
        hubspotLogger.error('Failed to cache tokens:', e);
      }

      // Test connection if:
      // 1. Not already connected, AND
      // 2. Haven't tested in the last 5 seconds (to handle reconnection scenarios), AND
      // 3. No test is currently pending
      const now = Date.now();
      const shouldTestConnection = !connectionStatus.isConnected && 
        (now - lastConnectionTestRef.current > 5000) &&
        !connectionTestPendingRef.current;
      
      if (shouldTestConnection && !isConnecting) {
        hubspotLogger.debug('Testing connection...', { 
          isConnected: connectionStatus.isConnected, 
          timeSinceLastTest: now - lastConnectionTestRef.current 
        });
        lastConnectionTestRef.current = now;
        connectionTestPendingRef.current = true;
        testConnection().finally(() => {
          connectionTestPendingRef.current = false;
        });
      }
    } else if (dbTokens === null) {
      // No tokens in database for this portal
      hubspotLogger.debug('No tokens found in database for portal:', userId);
      setConnectionStatus({
        isConnected: false,
        lastChecked: new Date(),
      });
    } else if (dbTokens?.isExpired) {
      // Tokens exist but are expired - show reconnect modal but don't auto-logout
      // User stays logged into the website, just needs to reconnect HubSpot
      hubspotLogger.debug('Database tokens are expired, user should reconnect');
      setAuthError('token_expired');
      setReconnectReason('token_expired');
      setShowReconnectModal(true);
      setConnectionStatus(prev => ({
        ...prev,
        isConnected: false,
        error: 'Session expired. Please reconnect your HubSpot account.',
        lastChecked: new Date(),
      }));
    }
  }, [dbTokens, userId, connectionStatus.isConnected, isConnecting]);
  
  // When portal is marked as reconnected (disconnectionStatus changes from disconnected to connected),
  // ensure we re-verify the connection and update UI
  // NOTE: This effect is now rate-limited by connectionTestPendingRef to avoid duplicate calls
  useEffect(() => {
    // If we were showing disconnected but now portalDisconnectionStatus is null (reconnected),
    // and we have valid tokens, ensure connection status is updated
    if (
      !portalDisconnectionStatus && 
      dbTokens && 
      !dbTokens.isExpired && 
      dbTokens.accessToken &&
      !connectionStatus.isConnected &&
      !isConnecting &&
      !connectionTestPendingRef.current
    ) {
      const now = Date.now();
      if (now - lastConnectionTestRef.current > 5000) {
        hubspotLogger.debug('Portal reconnected detected, testing connection...');
        lastConnectionTestRef.current = now;
        connectionTestPendingRef.current = true;
        testConnection().finally(() => {
          connectionTestPendingRef.current = false;
        });
      }
    }
  }, [portalDisconnectionStatus, dbTokens, connectionStatus.isConnected, isConnecting]);

  // Handle portal switch - clear records and update connection when portal changes
  useEffect(() => {
    if (activePortalId && prevPortalRef.current !== activePortalId) {
      hubspotLogger.info(`Portal switched from ${prevPortalRef.current} to ${activePortalId}`);

      // Clear records from previous portal
      setRecords([]);
      setAuthError(null); // Clear any previous auth errors

      // Update connection status with new portal
      setConnectionStatus(prev => ({
        ...prev,
        portalId: activePortalId,
        isConnected: false, // Reset connection, let DB query re-establish
      }));

      prevPortalRef.current = activePortalId;
    }
  }, [activePortalId]);

  // Re-update connectionStatus when cachedPortalSettings loads from Convex
  // This fixes the issue where domain/name disappear on page reload
  useEffect(() => {
    if (cachedPortalSettings && connectionStatus.isConnected && connectionStatus.portalId) {
      // Update the connection status with the cached data
      setConnectionStatus(prev => ({
        ...prev,
        domain: cachedPortalSettings.domain || prev.domain,
        portalName: cachedPortalSettings.portalName || cachedPortalSettings.companyName || prev.portalName,
      }));
    }
  }, [cachedPortalSettings, connectionStatus.isConnected, connectionStatus.portalId]);

  // Save connection status to localStorage for faster initial load
  useEffect(() => {
    if (connectionStatus.isConnected && (connectionStatus.domain || connectionStatus.portalId)) {
      try {
        localStorage.setItem('tagbase_connection_status', JSON.stringify(connectionStatus));
      } catch (e) {
        hubspotLogger.error('Failed to cache connection status:', e);
      }
    }
  }, [connectionStatus]);

  // Test connection - always use cached domain/name from Convex (set during OAuth)
  const testConnection = useCallback(async (): Promise<HubSpotConnectionStatus> => {
    setIsConnecting(true);
    try {
      hubspotService.refreshConfig();
      const status = await hubspotService.testConnection();

      // Always use the cached domain/name from Convex if available
      // The correct domain was set during OAuth from the CMS Domains API
      if (status.isConnected && status.portalId) {
        if (cachedPortalSettings?.domain) {
          status.domain = cachedPortalSettings.domain;
        }
        if (cachedPortalSettings?.portalName) {
          status.portalName = cachedPortalSettings.portalName;
        }
        if (cachedPortalSettings?.companyName && !status.portalName) {
          status.portalName = cachedPortalSettings.companyName;
        }
        // Clear any auth errors on successful connection
        setAuthError(null);
        setReconnectReason(null);
        setShowReconnectModal(false);
      }

      setConnectionStatus(status);
      return status;
    } catch (error: any) {
      // Handle auth errors gracefully - don't auto-logout
      const authErrorType = error?.authErrorType;

      if (authErrorType === 'app_uninstalled') {
        hubspotLogger.info('App uninstalled detected, showing disconnection modal');
        setAuthError('app_uninstalled');
        setShowDisconnectionModal(true);
      } else if (authErrorType === 'token_expired') {
        hubspotLogger.info('Token expired, showing reconnect modal');
        setAuthError('token_expired');
        setReconnectReason('token_expired');
        setShowReconnectModal(true);
      }

      const status: HubSpotConnectionStatus = {
        isConnected: false,
        error: authErrorType === 'app_uninstalled'
          ? 'App was uninstalled from HubSpot. Please reinstall to continue.'
          : authErrorType === 'token_expired'
            ? 'Session expired. Please reconnect your HubSpot account.'
            : 'Failed to connect to HubSpot',
        lastChecked: new Date(),
      };
      setConnectionStatus(status);
      return status;
    } finally {
      setIsConnecting(false);
    }
  }, [cachedPortalSettings]);

  // Connect with access token
  const connect = useCallback(async (accessToken: string): Promise<boolean> => {
    setIsConnecting(true);
    try {
      // Save the new config
      const newConfig = { ...config, accessToken };
      saveHubSpotConfig(newConfig);
      setConfig(newConfig);

      // Refresh service config
      hubspotService.refreshConfig();

      // Test the connection
      const status = await hubspotService.testConnection();
      setConnectionStatus(status);

      if (status.isConnected) {
        // Setup properties on successful connection
        await setupHubSpotProperties();
      }

      return status.isConnected;
    } catch (error) {
      setConnectionStatus({
        isConnected: false,
        error: 'Failed to connect',
        lastChecked: new Date(),
      });
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [config]);

  // Disconnect
  const disconnect = useCallback(() => {
    // Disable the HubSpot service to prevent further API calls
    hubspotService.disable();
    
    // Clear all stored configuration
    clearHubSpotConfig();
    clearStoredTokens();
    setConfig(getHubSpotConfig());
    setConnectionStatus({ isConnected: false });
    setRecords([]);
    setAuthError(null);
    setReconnectReason(null);
    setShowReconnectModal(false);
    setShowDisconnectionModal(false);
    localStorage.removeItem('tagbase_connection_status');
  }, []);

  // Create tag - Save to Convex and immediately sync to HubSpot
  const createTag = useCallback(async (tagData: Omit<Tag, 'id' | 'createdAt'>): Promise<Tag> => {
    try {
      const tagId = await createTagMutation({
        ...tagData,
        userId,
      });

      // Return the new tag
      const newTag: Tag = {
        ...tagData,
        id: tagId,
        createdAt: new Date(),
      };

      // IMMEDIATELY sync to HubSpot to prevent "INVALID_OPTION" errors
      // Don't wait for the debounced auto-sync
      // Skip sync if portal is disconnected
      if (connectionStatus.isConnected && !disconnectionStatus.isDisconnected) {
        try {
          // Include existing tags plus the new one
          const allTags = [...tags, newTag];
          const tagDefinitions = allTags.map(tag => ({
            id: String(tag.id),
            name: tag.name,
            color: tag.color,
            category: tag.category,
            objectTypes: tag.objectTypes,
          }));

          // Sync to ALL object types explicitly
          await hubspotPropertySyncService.syncTagsToHubSpot(
            tagDefinitions,
            ['contacts', 'companies', 'deals', 'tickets']
          );
          // New tag synced to HubSpot
        } catch (syncError) {
          hubspotLogger.error('Failed to sync new tag to HubSpot:', syncError);
          // Don't throw - the tag was created successfully, just sync failed
        }
      }

      return newTag;
    } catch (error) {
      hubspotLogger.error('Failed to create tag:', error);
      throw error;
    }
  }, [createTagMutation, userId, connectionStatus.isConnected, disconnectionStatus.isDisconnected, tags]);

  // Update tag - Update in Convex and sync to HubSpot
  const updateTag = useCallback(async (tag: Tag) => {
    try {
      await updateTagMutation({
        id: tag.id as Id<"tags">,
        name: tag.name,
        color: tag.color,
        category: tag.category,
        objectTypes: tag.objectTypes,
        contactCount: tag.contactCount,
        companyCount: tag.companyCount,
        dealCount: tag.dealCount,
        ticketCount: tag.ticketCount,
      });

      // Sync to HubSpot to update the option label/details
      // Skip sync if portal is disconnected
      if (connectionStatus.isConnected && !disconnectionStatus.isDisconnected) {
        try {
          // Update the tag in the tags array and sync
          const updatedTags = tags.map(t => t.id === tag.id ? tag : t);
          const tagDefinitions = updatedTags.map(t => ({
            id: String(t.id),
            name: t.name,
            color: t.color,
            category: t.category,
            objectTypes: t.objectTypes,
          }));

          // Sync to ALL object types explicitly
          await hubspotPropertySyncService.syncTagsToHubSpot(
            tagDefinitions,
            ['contacts', 'companies', 'deals', 'tickets']
          );
          // Tag update synced
        } catch (syncError) {
          hubspotLogger.error('Failed to sync tag update to HubSpot:', syncError);
        }
      }
    } catch (error) {
      hubspotLogger.error('Failed to update tag:', error);
      throw error;
    }
  }, [updateTagMutation, connectionStatus.isConnected, disconnectionStatus.isDisconnected, tags]);

  // Delete tag - Delete from Convex and sync to HubSpot
  const deleteTag = useCallback(async (tagId: string) => {
    try {
      const tagToDelete = tags.find(t => t.id === tagId);
      hubspotLogger.debug('Deleting tag:', { tagId, tagName: tagToDelete?.name });

      // First, remove the tag from HubSpot properties AND clean up from all records
      // This must happen BEFORE deleting from Convex to ensure we have the tag info
      if (connectionStatus.isConnected && !disconnectionStatus.isDisconnected && tagToDelete) {
        try {
          hubspotLogger.debug('Calling removeTagFromHubSpot...');
          // Use removeTagFromHubSpot which properly cleans up from all records
          const result = await hubspotPropertySyncService.removeTagFromHubSpot(
            tagToDelete.name,
            String(tagId) // Pass the actual tag ID used in property values
          );
          hubspotLogger.debug('Remove tag result:', result);
          
          if (!result.success) {
            hubspotLogger.warn('Failed to remove tag from HubSpot, but continuing with local deletion');
          }
        } catch (syncError) {
          hubspotLogger.error('Failed to remove tag from HubSpot:', syncError);
          // Continue with deletion even if sync fails
        }
      }

      // Delete from Convex
      hubspotLogger.debug('Deleting tag from Convex...');
      await deleteTagMutation({ id: tagId as Id<"tags"> });

      // Also remove from local records state
      setRecords(prev => prev.map(r => ({
        ...r,
        tags: r.tags.filter(t => t.id !== tagId),
      })));
      
      hubspotLogger.info('Tag deleted successfully');
    } catch (error) {
      hubspotLogger.error('Failed to delete tag:', error);
      throw error;
    }
  }, [deleteTagMutation, tags, connectionStatus.isConnected, disconnectionStatus.isDisconnected]);

  // Fetch records from HubSpot
  const fetchRecords = useCallback(async (objectTypes?: ObjectType[]) => {
    if (!connectionStatus.isConnected) {
      return;
    }

    const types = objectTypes || ['contact', 'company', 'deal', 'ticket'];
    setIsLoadingRecords(true);

    try {
      const allRecords: CRMRecord[] = [];

      if (types.includes('contact')) {
        const contacts = await hubspotService.getContacts();
        allRecords.push(...contacts.results.map(c => hubspotContactToCRMRecord(c, tags)));
      }

      if (types.includes('company')) {
        const companies = await hubspotService.getCompanies();
        allRecords.push(...companies.results.map(c => hubspotCompanyToCRMRecord(c, tags)));
      }

      if (types.includes('deal')) {
        const deals = await hubspotService.getDeals();
        allRecords.push(...deals.results.map(d => hubspotDealToCRMRecord(d, tags)));
      }

      if (types.includes('ticket')) {
        const tickets = await hubspotService.getTickets();
        allRecords.push(...tickets.results.map(t => hubspotTicketToCRMRecord(t, tags)));
      }

      setRecords(allRecords);
    } catch (error) {
      hubspotLogger.error('Failed to fetch records:', error);
    } finally {
      setIsLoadingRecords(false);
    }
  }, [connectionStatus.isConnected, tags]);

  // Update record tags
  const updateRecordTags = useCallback(async (
    recordId: string,
    objectType: ObjectType,
    newTags: Tag[]
  ) => {
    // Store previous tags for potential rollback
    const previousRecord = records.find(r => r.id === recordId);
    const previousTags = previousRecord?.tags || [];

    // Update local state first for optimistic UI
    setRecords(prev => prev.map(r =>
      r.id === recordId ? { ...r, tags: newTags } : r
    ));

    // If connected, update HubSpot using the tag action service
    if (connectionStatus.isConnected) {
      try {
        // Convert object type to API format
        const apiObjectType = objectType === 'contact' ? 'contacts'
          : objectType === 'company' ? 'companies'
            : objectType === 'ticket' ? 'tickets'
              : 'deals';

        // Build tag metadata map for history logging
        const tagMetadata = new Map<string, { id: string; color: string }>();
        for (const tag of [...previousTags, ...newTags]) {
          tagMetadata.set(tag.name, {
            id: tag.id.toString(),
            color: tag.color
          });
        }

        // Use the tag action service to set tags
        const tagNames = newTags.map(t => t.name);
        const result = await tagActionService.setTags(
          apiObjectType,
          recordId,
          tagNames,
          tagMetadata
        );

        if (!result.success) {
          throw new Error(result.message || 'Failed to update tags');
        }

        // Tags updated successfully
      } catch (error) {
        hubspotLogger.error('Failed to update tags in HubSpot:', error);
        // Revert local change on error
        setRecords(prev => prev.map(r =>
          r.id === recordId ? { ...r, tags: previousTags } : r
        ));
        throw error;
      }
    }
  }, [connectionStatus.isConnected, records]);

  // Setup HubSpot properties
  const setupHubSpotProperties = useCallback(async () => {
    if (!connectionStatus.isConnected && !isConnecting) {
      return { success: false, errors: ['Not connected to HubSpot'] };
    }

    setSyncStatus(prev => ({ ...prev, syncInProgress: true, errors: [] }));

    try {
      const result = await hubspotService.setupTagBaseProperties();
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastSyncedAt: new Date(),
        errors: result.errors,
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncStatus(prev => ({
        ...prev,
        syncInProgress: false,
        errors: [errorMessage],
      }));
      return { success: false, errors: [errorMessage] };
    }
  }, [connectionStatus.isConnected, isConnecting]);

  // Convert linked portal data to LinkedPortal format
  const linkedPortals: LinkedPortal[] = (userLinkedPortals || []).map(portal => ({
    portalId: portal?.portalId || '',
    domain: portal?.domain || undefined,
    portalName: portal?.portalName || portal?.companyName || undefined,
  })).filter(p => p.portalId);

  const value: HubSpotContextValue = {
    connectionStatus,
    isConnecting,
    connect,
    disconnect,
    testConnection,
    authError,
    showReconnectModal,
    setShowReconnectModal,
    reconnectReason,
    linkedPortals,
    disconnectionStatus,
    showDisconnectionModal,
    setShowDisconnectionModal,
    dismissDisconnectionNotice,
    tags,
    createTag,
    updateTag,
    deleteTag,
    records,
    isLoadingRecords,
    fetchRecords,
    updateRecordTags,
    syncStatus,
    setupHubSpotProperties,
    config,
  };

  return (
    <HubSpotContext.Provider value={value}>
      {children}
    </HubSpotContext.Provider>
  );
}

export function useHubSpot() {
  const context = useContext(HubSpotContext);
  if (context === undefined) {
    throw new Error('useHubSpot must be used within a HubSpotProvider');
  }
  return context;
}

export default HubSpotContext;

