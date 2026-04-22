// HubSpot API Service Layer
// Handles all communication with HubSpot CRM API via serverless proxy

import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  getHubSpotConfig,
  TAG_PROPERTY_NAME,
  TAG_PROPERTY_GROUP,
  RATE_LIMIT_CONFIG,
  refreshAccessToken,
  shouldRefreshToken,
  getStoredTokens
} from '@/config/hubspot';
import { Tag } from '@/types/tag';
import {
  HubSpotContact,
  HubSpotCompany,
  HubSpotDeal,
  HubSpotProperty,
  HubSpotPropertyGroup,
  HubSpotPaginatedResponse,
  HubSpotConnectionStatus,
  HubSpotError,
  serializeTagsToProperty,
} from '@/types/hubspot';
import { hubspotLogger } from '@/lib/logger';

// Use proxy for all HubSpot API calls to avoid CORS issues
const API_PROXY_BASE = '/api/hubspot';

class HubSpotService {
  private api: AxiosInstance;
  private requestQueue: Promise<unknown> = Promise.resolve();
  private lastRequestTime: number = 0;
  private isDisabled: boolean = false;

  constructor() {
    // All requests go through our Netlify proxy
    this.api = axios.create({
      baseURL: API_PROXY_BASE,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth and token refresh
    this.api.interceptors.request.use(async (requestConfig) => {
      // Guard: Skip requests when service is disabled (user logged out)
      if (this.isDisabled) {
        const error = new Error('HubSpot service is disabled - user logged out');
        (error as any).isDisabled = true;
        throw error;
      }

      // Check if token needs refresh before making request
      if (shouldRefreshToken()) {
        await refreshAccessToken();
      }

      const currentConfig = getHubSpotConfig();
      if (currentConfig.accessToken) {
        requestConfig.headers.Authorization = `Bearer ${currentConfig.accessToken}`;
      } else {
        // No access token - don't make the request
        const error = new Error('No access token available');
        (error as any).noToken = true;
        throw error;
      }
      return requestConfig;
    });

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<HubSpotError>) => {
        const originalRequest = error.config;

        // Only handle 401 errors
        if (error.response?.status !== 401 || !originalRequest) {
          hubspotLogger.error('HubSpot API Error:', error.response?.data);
          throw error;
        }

        const errorData = error.response.data;

        // INVALID_AUTHENTICATION = App uninstalled (token revoked)
        // Don't auto-logout - just log and throw the error
        // The UI will handle showing the disconnection modal
        if (errorData?.category === 'INVALID_AUTHENTICATION') {
          hubspotLogger.info('App uninstalled - token invalid. User should reconnect.');
          
          // Mark the error type for the UI to handle
          (error as any).authErrorType = 'app_uninstalled';
          throw error;
        }

        // EXPIRED_AUTHENTICATION = Token expired, try refresh
        if (errorData?.category === 'EXPIRED_AUTHENTICATION') {
          // Only retry once
          if (!originalRequest.headers['X-Retry']) {
            const newTokens = await refreshAccessToken();
            if (newTokens) {
              originalRequest.headers['X-Retry'] = 'true';
              originalRequest.headers.Authorization = `Bearer ${newTokens.access_token}`;
              return this.api.request(originalRequest);
            }
          }

          // Refresh failed - don't auto-logout, just throw
          hubspotLogger.info('Token refresh failed. User should reconnect.');
          (error as any).authErrorType = 'token_expired';
          throw error;
        }

        hubspotLogger.error('HubSpot API Error:', error.response?.data);
        throw error;
      }
    );
  }

  // Rate-limited request wrapper
  private async rateLimitedRequest<T>(
    request: () => Promise<T>
  ): Promise<T> {
    // Guard: Skip requests when service is disabled
    if (this.isDisabled) {
      throw new Error('HubSpot service is disabled');
    }

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minDelay = 1000 / RATE_LIMIT_CONFIG.maxRequestsPerSecond;

    if (timeSinceLastRequest < minDelay) {
      await new Promise((resolve) =>
        setTimeout(resolve, minDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    return request();
  }

  // Disable the service (called on logout)
  disable(): void {
    this.isDisabled = true;
    hubspotLogger.debug('Service disabled');
  }

  // Enable the service (called on connect)
  enable(): void {
    this.isDisabled = false;
    hubspotLogger.debug('Service enabled');
  }

  // Check if service is enabled
  isEnabled(): boolean {
    return !this.isDisabled;
  }

  // Update API configuration
  refreshConfig(): void {
    // Config is handled by the proxy
    // Re-enable service when config is refreshed (implies reconnection)
    this.isDisabled = false;
  }

  // ==================== CONNECTION & AUTH ====================

  // Test connection and get account info
  async testConnection(): Promise<HubSpotConnectionStatus> {
    try {
      const response = await this.rateLimitedRequest(() =>
        this.api.get('/account-info/v3/details')
      );

      // Note: We intentionally do NOT set domain here.
      // The correct business domain is fetched during OAuth (from CMS Domains API)
      // and stored in Convex. Using uiDomain (like "app-na2.hubspot.com") is wrong.
      // The domain will be populated from Convex cache in HubSpotContext.
      return {
        isConnected: true,
        portalId: response.data.portalId?.toString(),
        portalName: response.data.companyName || undefined, // Use company name, not uiDomain
        // domain is intentionally not set - will come from Convex cache
        lastChecked: new Date(),
      };
    } catch (error) {
      const axiosError = error as AxiosError<HubSpotError>;
      return {
        isConnected: false,
        error: axiosError.response?.data?.message || 'Connection failed',
        lastChecked: new Date(),
      };
    }
  }

  // Get access token info (scopes, etc.)
  async getAccessTokenInfo(): Promise<{ scopes: string[]; hubId: number } | null> {
    try {
      const response = await this.rateLimitedRequest(() =>
        this.api.get('/oauth/v1/access-tokens/' + getHubSpotConfig().accessToken)
      );
      return {
        scopes: response.data.scopes || [],
        hubId: response.data.hub_id,
      };
    } catch {
      return null;
    }
  }

  // ==================== CONTACTS ====================

  // Get all contacts with pagination
  async getContacts(
    limit: number = 100,
    after?: string,
    properties: string[] = ['email', 'firstname', 'lastname', 'phone', 'company', TAG_PROPERTY_NAME]
  ): Promise<HubSpotPaginatedResponse<HubSpotContact>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: properties.join(','),
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/contacts?${params.toString()}`)
    );

    return response.data;
  }

  // Get a single contact by ID
  async getContact(
    contactId: string,
    properties: string[] = ['email', 'firstname', 'lastname', 'phone', 'company', TAG_PROPERTY_NAME]
  ): Promise<HubSpotContact> {
    const params = new URLSearchParams({
      properties: properties.join(','),
    });

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/contacts/${contactId}?${params.toString()}`)
    );

    return response.data;
  }

  // Update contact tags
  async updateContactTags(contactId: string, tags: Tag[]): Promise<HubSpotContact> {
    const response = await this.rateLimitedRequest(() =>
      this.api.patch(`/crm/v3/objects/contacts/${contactId}`, {
        properties: {
          [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
        },
      })
    );

    return response.data;
  }

  // Search contacts
  async searchContacts(
    query: string,
    properties: string[] = ['email', 'firstname', 'lastname', 'phone', 'company', TAG_PROPERTY_NAME]
  ): Promise<HubSpotContact[]> {
    const response = await this.rateLimitedRequest(() =>
      this.api.post('/crm/v3/objects/contacts/search', {
        query,
        limit: 100,
        properties,
      })
    );

    return response.data.results;
  }

  // ==================== COMPANIES ====================

  // Get all companies with pagination
  async getCompanies(
    limit: number = 100,
    after?: string,
    properties: string[] = ['name', 'domain', 'industry', 'phone', TAG_PROPERTY_NAME]
  ): Promise<HubSpotPaginatedResponse<HubSpotCompany>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: properties.join(','),
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/companies?${params.toString()}`)
    );

    return response.data;
  }

  // Get a single company by ID
  async getCompany(
    companyId: string,
    properties: string[] = ['name', 'domain', 'industry', 'phone', TAG_PROPERTY_NAME]
  ): Promise<HubSpotCompany> {
    const params = new URLSearchParams({
      properties: properties.join(','),
    });

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/companies/${companyId}?${params.toString()}`)
    );

    return response.data;
  }

  // Update company tags
  async updateCompanyTags(companyId: string, tags: Tag[]): Promise<HubSpotCompany> {
    const response = await this.rateLimitedRequest(() =>
      this.api.patch(`/crm/v3/objects/companies/${companyId}`, {
        properties: {
          [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
        },
      })
    );

    return response.data;
  }

  // ==================== DEALS ====================

  // Get all deals with pagination
  async getDeals(
    limit: number = 100,
    after?: string,
    properties: string[] = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', TAG_PROPERTY_NAME]
  ): Promise<HubSpotPaginatedResponse<HubSpotDeal>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: properties.join(','),
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/deals?${params.toString()}`)
    );

    return response.data;
  }

  // Get a single deal by ID
  async getDeal(
    dealId: string,
    properties: string[] = ['dealname', 'amount', 'dealstage', 'pipeline', 'closedate', TAG_PROPERTY_NAME]
  ): Promise<HubSpotDeal> {
    const params = new URLSearchParams({
      properties: properties.join(','),
    });

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/deals/${dealId}?${params.toString()}`)
    );

    return response.data;
  }

  // Update deal tags
  async updateDealTags(dealId: string, tags: Tag[]): Promise<HubSpotDeal> {
    const response = await this.rateLimitedRequest(() =>
      this.api.patch(`/crm/v3/objects/deals/${dealId}`, {
        properties: {
          [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
        },
      })
    );

    return response.data;
  }

  // ==================== PROPERTIES MANAGEMENT ====================

  // Get property groups for an object type
  async getPropertyGroups(objectType: 'contacts' | 'companies' | 'deals'): Promise<HubSpotPropertyGroup[]> {
    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/properties/${objectType}/groups`)
    );

    return response.data.results;
  }

  // Create TagBase property group
  async createTagPropertyGroup(objectType: 'contacts' | 'companies' | 'deals'): Promise<HubSpotPropertyGroup> {
    try {
      const response = await this.rateLimitedRequest(() =>
        this.api.post(`/crm/v3/properties/${objectType}/groups`, {
          name: TAG_PROPERTY_GROUP,
          label: 'TagBase Integration',
          displayOrder: 99,
        })
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<HubSpotError>;
      // If group already exists, that's fine
      if (axiosError.response?.status === 409) {
        return { name: TAG_PROPERTY_GROUP, label: 'TagBase Integration', displayOrder: 99 };
      }
      throw error;
    }
  }

  // Get properties for an object type
  async getProperties(objectType: 'contacts' | 'companies' | 'deals'): Promise<HubSpotProperty[]> {
    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/properties/${objectType}`)
    );

    return response.data.results;
  }

  // Create TagBase tags property
  async createTagProperty(objectType: 'contacts' | 'companies' | 'deals'): Promise<HubSpotProperty> {
    try {
      const response = await this.rateLimitedRequest(() =>
        this.api.post(`/crm/v3/properties/${objectType}`, {
          name: TAG_PROPERTY_NAME,
          label: 'TagBase Tags',
          type: 'string',
          fieldType: 'textarea',
          groupName: TAG_PROPERTY_GROUP,
          description: 'Tags managed by TagBase integration. Do not edit manually.',
        })
      );
      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError<HubSpotError>;
      // If property already exists, that's fine
      if (axiosError.response?.status === 409) {
        return {
          name: TAG_PROPERTY_NAME,
          label: 'TagBase Tags',
          type: 'string',
          fieldType: 'textarea',
          groupName: TAG_PROPERTY_GROUP,
        };
      }
      throw error;
    }
  }

  // Check if TagBase property exists
  async checkTagPropertyExists(objectType: 'contacts' | 'companies' | 'deals'): Promise<boolean> {
    const properties = await this.getProperties(objectType);
    return properties.some(p => p.name === TAG_PROPERTY_NAME);
  }

  // Setup TagBase properties for all object types
  async setupTagBaseProperties(): Promise<{ success: boolean; errors: string[] }> {
    const errors: string[] = [];
    const objectTypes: Array<'contacts' | 'companies' | 'deals'> = ['contacts', 'companies', 'deals'];

    for (const objectType of objectTypes) {
      try {
        // Create property group first
        await this.createTagPropertyGroup(objectType);

        // Then create property
        await this.createTagProperty(objectType);
      } catch (error) {
        const axiosError = error as AxiosError<HubSpotError>;
        errors.push(`Failed to setup ${objectType}: ${axiosError.response?.data?.message || 'Unknown error'}`);
      }
    }

    return {
      success: errors.length === 0,
      errors,
    };
  }

  // ==================== BATCH OPERATIONS ====================

  // Batch update contacts with tags
  async batchUpdateContactTags(updates: Array<{ id: string; tags: Tag[] }>): Promise<void> {
    const inputs = updates.map(({ id, tags }) => ({
      id,
      properties: {
        [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
      },
    }));

    // HubSpot batch limit is 100
    const batches = [];
    for (let i = 0; i < inputs.length; i += 100) {
      batches.push(inputs.slice(i, i + 100));
    }

    for (const batch of batches) {
      await this.rateLimitedRequest(() =>
        this.api.post('/crm/v3/objects/contacts/batch/update', { inputs: batch })
      );
    }
  }

  // Batch update companies with tags
  async batchUpdateCompanyTags(updates: Array<{ id: string; tags: Tag[] }>): Promise<void> {
    const inputs = updates.map(({ id, tags }) => ({
      id,
      properties: {
        [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
      },
    }));

    const batches = [];
    for (let i = 0; i < inputs.length; i += 100) {
      batches.push(inputs.slice(i, i + 100));
    }

    for (const batch of batches) {
      await this.rateLimitedRequest(() =>
        this.api.post('/crm/v3/objects/companies/batch/update', { inputs: batch })
      );
    }
  }

  // ==================== TICKETS ====================

  // Get all tickets with pagination
  async getTickets(
    limit: number = 100,
    after?: string,
    properties: string[] = ['subject', 'content', 'hs_pipeline_stage', 'hs_ticket_priority', 'createdate', TAG_PROPERTY_NAME]
  ): Promise<HubSpotPaginatedResponse<HubSpotDeal>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      properties: properties.join(','),
    });

    if (after) {
      params.append('after', after);
    }

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/tickets?${params.toString()}`)
    );

    return response.data;
  }

  // Get a single ticket by ID
  async getTicket(
    ticketId: string,
    properties: string[] = ['subject', 'content', 'hs_pipeline_stage', 'hs_ticket_priority', 'createdate', TAG_PROPERTY_NAME]
  ): Promise<HubSpotDeal> {
    const params = new URLSearchParams({
      properties: properties.join(','),
    });

    const response = await this.rateLimitedRequest(() =>
      this.api.get(`/crm/v3/objects/tickets/${ticketId}?${params.toString()}`)
    );

    return response.data;
  }

  // Update ticket tags
  async updateTicketTags(ticketId: string, tags: Tag[]): Promise<HubSpotDeal> {
    const response = await this.rateLimitedRequest(() =>
      this.api.patch(`/crm/v3/objects/tickets/${ticketId}`, {
        properties: {
          [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
        },
      })
    );

    return response.data;
  }

  // Batch update tickets with tags
  async batchUpdateTicketTags(updates: Array<{ id: string; tags: Tag[] }>): Promise<void> {
    const inputs = updates.map(({ id, tags }) => ({
      id,
      properties: {
        [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
      },
    }));

    const batches = [];
    for (let i = 0; i < inputs.length; i += 100) {
      batches.push(inputs.slice(i, i + 100));
    }

    for (const batch of batches) {
      await this.rateLimitedRequest(() =>
        this.api.post('/crm/v3/objects/tickets/batch/update', { inputs: batch })
      );
    }
  }

  // Batch update deals with tags
  async batchUpdateDealTags(updates: Array<{ id: string; tags: Tag[] }>): Promise<void> {
    const inputs = updates.map(({ id, tags }) => ({
      id,
      properties: {
        [TAG_PROPERTY_NAME]: serializeTagsToProperty(tags),
      },
    }));

    const batches = [];
    for (let i = 0; i < inputs.length; i += 100) {
      batches.push(inputs.slice(i, i + 100));
    }

    for (const batch of batches) {
      await this.rateLimitedRequest(() =>
        this.api.post('/crm/v3/objects/deals/batch/update', { inputs: batch })
      );
    }
  }
}

// Export singleton instance
export const hubspotService = new HubSpotService();
export default hubspotService;
