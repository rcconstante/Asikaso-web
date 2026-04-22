// AI Agent Types

export interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    imageUrl?: string;
}

export interface QuickAction {
    id: string;
    label: string;
    query: string;
}

export interface ChatState {
    isOpen: boolean;
    messages: Message[];
    isTyping: boolean;
}

// Sankey context data structure for AI
export interface SankeyContextData {
    totalRecords: number;
    avgJourneyDurationMonths: number;
    transitionsCount: number;
    nodes: {
        name: string;
        recordCount?: number;
        color?: string;
    }[];
    transitions: {
        source: string;
        target: string;
        count: number;
        avgDurationDays?: number;
        conversionRate?: number;
    }[];
}

// Free action IDs that don't consume credits
export const FREE_ACTION_IDS = ['journey', 'advice', 'feedback', 'pricing', 'other'];

// Predefined quick actions matching the reference design
export const QUICK_ACTIONS: QuickAction[] = [
    {
        id: 'journey',
        label: 'Question relates to an operation (journey)',
        query: 'Tell me about my customer journey and touchpoints',
    },
    {
        id: 'advice',
        label: 'Advice about how to do something',
        query: 'How can I accomplish something in TagBase?',
    },
    {
        id: 'feedback',
        label: 'Feedback and suggestions',
        query: 'I have feedback or suggestions',
    },
    {
        id: 'pricing',
        label: 'Pricing, billing, invoices',
        query: 'I have questions about pricing or billing',
    },
    {
        id: 'other',
        label: 'Something else',
        query: 'I have a different question',
    },
];
