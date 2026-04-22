export interface Tag {
  id: string;
  name: string;
  color: string;
  category?: string;
  objectTypes?: string[]; // Which CRM objects this tag applies to: 'contacts', 'companies', 'deals', 'tickets'
  contactCount: number;
  companyCount: number;
  dealCount: number;
  ticketCount: number;
  createdAt: Date;
}

export type ObjectType = "contact" | "company" | "deal" | "ticket";

export interface CRMRecord {
  id: string;
  name: string;
  type: ObjectType;
  email?: string;
  phone?: string;
  company?: string;
  value?: number;
  stage?: string;
  industry?: string;
  tags: Tag[];
}

export interface Touchpoint {
  id: string;
  type: "email" | "call" | "meeting" | "campaign" | "pageview" | "event";
  title: string;
  description: string;
  timestamp: Date;
  tags: Tag[];
}

export interface TagStorageFormat {
  tags: Array<{ label: string; color: string }>;
}
