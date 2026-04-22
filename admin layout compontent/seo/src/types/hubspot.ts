// Extended types for HubSpot integration
import { Tag, CRMRecord, ObjectType } from './tag';

// HubSpot Contact from API
export interface HubSpotContact {
  id: string;
  properties: {
    email?: string;
    firstname?: string;
    lastname?: string;
    phone?: string;
    company?: string;
    lifecyclestage?: string;
    tagbase_tags_select?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// HubSpot Company from API
export interface HubSpotCompany {
  id: string;
  properties: {
    name?: string;
    domain?: string;
    industry?: string;
    phone?: string;
    city?: string;
    country?: string;
    tagbase_tags_select?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// HubSpot Deal from API
export interface HubSpotDeal {
  id: string;
  properties: {
    dealname?: string;
    amount?: string;
    dealstage?: string;
    pipeline?: string;
    closedate?: string;
    tagbase_tags_select?: string;
    [key: string]: string | undefined;
  };
  createdAt: string;
  updatedAt: string;
  archived: boolean;
}

// HubSpot Property definition
export interface HubSpotProperty {
  name: string;
  label: string;
  type: string;
  fieldType: string;
  groupName: string;
  description?: string;
  options?: Array<{
    label: string;
    value: string;
    displayOrder: number;
    hidden: boolean;
  }>;
}

// HubSpot Property Group
export interface HubSpotPropertyGroup {
  name: string;
  label: string;
  displayOrder: number;
}

// API Response types
export interface HubSpotPaginatedResponse<T> {
  results: T[];
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

export interface HubSpotBatchResponse<T> {
  status: 'COMPLETE' | 'PENDING';
  results: T[];
  startedAt: string;
  completedAt: string;
}

export interface HubSpotError {
  status: string;
  message: string;
  correlationId: string;
  category: string;
  errors?: Array<{
    message: string;
    in: string;
    code: string;
    subCategory: string;
    context: Record<string, string[]>;
  }>;
}

// TagBase specific storage format for HubSpot property
export interface TagBaseStorageFormat {
  tags: Array<{
    id: string;
    label: string;
    color: string;
    category?: string;
  }>;
  lastUpdated: string;
}

// Connection status
export interface HubSpotConnectionStatus {
  isConnected: boolean;
  portalId?: string;
  portalName?: string;
  domain?: string; // Primary domain for the HubSpot account
  lastChecked?: Date;
  error?: string;
  scopes?: string[];
}

// Sync status for tags
export interface TagSyncStatus {
  lastSyncedAt?: Date;
  syncInProgress: boolean;
  itemsSynced: number;
  errors: string[];
}

// Convert HubSpot contact to CRM record
export function hubspotContactToCRMRecord(contact: HubSpotContact, allTags: Tag[]): CRMRecord {
  const tags = parseTagsFromProperty(contact.properties.tagbase_tags_select, allTags);
  return {
    id: contact.id,
    name: [contact.properties.firstname, contact.properties.lastname]
      .filter(Boolean)
      .join(' ') || contact.properties.email || 'Unknown',
    type: 'contact' as ObjectType,
    email: contact.properties.email,
    phone: contact.properties.phone,
    company: contact.properties.company,
    tags,
  };
}

// Convert HubSpot company to CRM record
export function hubspotCompanyToCRMRecord(company: HubSpotCompany, allTags: Tag[]): CRMRecord {
  const tags = parseTagsFromProperty(company.properties.tagbase_tags_select, allTags);
  return {
    id: company.id,
    name: company.properties.name || 'Unknown',
    type: 'company' as ObjectType,
    industry: company.properties.industry,
    tags,
  };
}

// Convert HubSpot deal to CRM record
export function hubspotDealToCRMRecord(deal: HubSpotDeal, allTags: Tag[]): CRMRecord {
  const tags = parseTagsFromProperty(deal.properties.tagbase_tags_select, allTags);
  return {
    id: deal.id,
    name: deal.properties.dealname || 'Unknown',
    type: 'deal' as ObjectType,
    value: deal.properties.amount ? parseFloat(deal.properties.amount) : undefined,
    stage: deal.properties.dealstage,
    tags,
  };
}

// Convert HubSpot ticket to CRM record
export function hubspotTicketToCRMRecord(ticket: HubSpotDeal, allTags: Tag[]): CRMRecord {
  const tags = parseTagsFromProperty(ticket.properties.tagbase_tags_select, allTags);
  return {
    id: ticket.id,
    name: ticket.properties.subject || 'Unknown Ticket',
    type: 'ticket' as ObjectType,
    stage: ticket.properties.hs_pipeline_stage,
    tags,
  };
}

// Parse tags from HubSpot property value (multi-checkbox format)
export function parseTagsFromProperty(propertyValue: string | undefined, allTags: Tag[]): Tag[] {
  if (!propertyValue) return [];

  // Multi-checkbox returns semicolon-separated tag IDs
  const tagIds = propertyValue.split(';').filter(Boolean);
  return tagIds
    .map(id => allTags.find(tag => tag.id === id))
    .filter((tag): tag is Tag => tag !== undefined);
}

// Serialize tags to HubSpot property value (multi-checkbox format)
export function serializeTagsToProperty(tags: Tag[]): string {
  // Multi-checkbox expects semicolon-separated tag IDs
  return tags.map(t => t.id).join(';');
}
