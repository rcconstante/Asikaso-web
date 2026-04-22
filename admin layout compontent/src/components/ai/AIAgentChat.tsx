import { useState, useRef, useEffect, useCallback } from "react";
import { X, Sparkles, Minimize2, Trash2, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { AIAgentMessage } from "./AIAgentMessage";
import { AIAgentInput } from "./AIAgentInput";
import { AIAgentQuickActions } from "./AIAgentQuickActions";
import { Message, SankeyContextData, FREE_ACTION_IDS } from "./types";
import { toast } from "sonner";

interface AIAgentChatProps {
    isOpen: boolean;
    onClose: () => void;
}

// Function to get Sankey context from the page
function getSankeyContext(): SankeyContextData | null {
    try {
        // Try to get Sankey data from the global window object
        // This will be set by the SankeyPage when data is loaded
        const sankeyData = (window as unknown as { __TAGBASE_SANKEY_DATA__?: SankeyContextData }).__TAGBASE_SANKEY_DATA__;
        return sankeyData || null;
    } catch {
        return null;
    }
}

// Function to auto-export Sankey diagram as base64 image
async function exportSankeyAsBase64(): Promise<string | null> {
    try {
        // Find the Sankey SVG element
        const svgElement = document.querySelector('[data-sankey-diagram]') as SVGSVGElement;
        if (!svgElement) {
            // Try finding by class or other selectors
            const fallbackSvg = document.querySelector('.sankey-diagram svg') as SVGSVGElement;
            if (!fallbackSvg) return null;
        }
        
        const targetSvg = svgElement || document.querySelector('.sankey-diagram svg');
        if (!targetSvg) return null;

        // Clone the SVG
        const svgClone = targetSvg.cloneNode(true) as SVGSVGElement;
        
        // Add background
        const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bgRect.setAttribute('width', '100%');
        bgRect.setAttribute('height', '100%');
        bgRect.setAttribute('fill', '#0f172a');
        svgClone.insertBefore(bgRect, svgClone.firstChild);

        // Convert to data URL
        const svgData = new XMLSerializer().serializeToString(svgClone);
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const svgUrl = URL.createObjectURL(svgBlob);

        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx!.drawImage(img, 0, 0);
                const dataUrl = canvas.toDataURL('image/png');
                URL.revokeObjectURL(svgUrl);
                resolve(dataUrl);
            };

            img.onerror = () => {
                URL.revokeObjectURL(svgUrl);
                resolve(null);
            };

            img.src = svgUrl;
        });
    } catch (error) {
        console.error('Error exporting Sankey:', error);
        return null;
    }
}

// Format Sankey context for AI
function formatSankeyContextForAI(data: SankeyContextData): string {
    const lines = [
        `**Statistics:**`,
        `- Total Records: ${data.totalRecords}`,
        `- Average Journey Duration: ${data.avgJourneyDurationMonths} months`,
        `- Total Transitions: ${data.transitionsCount}`,
        ``,
        `**Nodes (Tags/Stages):**`,
    ];

    data.nodes.forEach(node => {
        lines.push(`- ${node.name}: ${node.recordCount || 'N/A'} records`);
    });

    lines.push('', '**Top Transitions:**');
    
    // Show top 10 transitions by count
    const topTransitions = [...data.transitions]
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    topTransitions.forEach(t => {
        const duration = t.avgDurationDays ? ` (avg ${t.avgDurationDays.toFixed(1)} days)` : '';
        const rate = t.conversionRate ? ` - ${t.conversionRate}% conversion` : '';
        lines.push(`- ${t.source} -> ${t.target}: ${t.count} records${duration}${rate}`);
    });

    return lines.join('\n');
}

export function AIAgentChat({ isOpen, onClose }: AIAgentChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const [showQuickActions, setShowQuickActions] = useState(true);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    
    // Resizable state
    const [size, setSize] = useState({ width: 400, height: 600 });
    const [isResizing, setIsResizing] = useState(false);
    const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number } | null>(null);

    // Auto-scroll to bottom
    const scrollToBottom = useCallback(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, []);

    // Add welcome message on first open
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMessage: Message = {
                id: "welcome",
                content: `**Hi there! I'm Taggie!**

I'm your TagBase AI assistant, here to help with customer journey analysis, tag management, and HubSpot integration.

**How can I help you today?**

- Analyze your Sankey diagram data
- Explain TagBase features
- Help with tag organization
- Answer questions about your customer journeys

**Tip:** Predefined questions below are FREE and don't use credits!`,
                sender: "ai",
                timestamp: new Date(),
            };
            setMessages([welcomeMessage]);
        }
    }, [isOpen, messages.length]);

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, streamingContent, scrollToBottom]);

    // Handle resize
    const handleResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        resizeRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            startWidth: size.width,
            startHeight: size.height,
        };
    }, [size]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !resizeRef.current) return;
            
            const deltaX = resizeRef.current.startX - e.clientX;
            const deltaY = resizeRef.current.startY - e.clientY;
            
            setSize({
                width: Math.max(320, Math.min(800, resizeRef.current.startWidth + deltaX)),
                height: Math.max(400, Math.min(900, resizeRef.current.startHeight + deltaY)),
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            resizeRef.current = null;
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    // Call the AI API
    const callAI = async (
        userMessage: string,
        actionId?: string,
        imageData?: string
    ): Promise<string> => {
        try {
            // Get Sankey context
            const sankeyData = getSankeyContext();
            const sankeyContext = sankeyData ? formatSankeyContextForAI(sankeyData) : null;

            // Prepare conversation history (exclude welcome message)
            const conversationHistory = messages
                .filter(m => m.id !== 'welcome')
                .map(m => ({
                    sender: m.sender,
                    content: m.content,
                }));

            const response = await fetch('/.netlify/functions/ai-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': localStorage.getItem('tagbase_user_email') || 'anonymous',
                },
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory,
                    sankeyContext,
                    actionId,
                    imageData,
                }),
            });

            if (response.status === 429) {
                const data = await response.json();
                throw new Error(data.message || 'Rate limit exceeded. Please wait a moment.');
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to get AI response');
            }

            const data = await response.json();
            
            // Show credit usage info (only for non-free questions)
            if (!data.isFreeQuestion && data.creditsUsed > 0) {
                // Could show a subtle indicator here
            }

            return data.response;
        } catch (error) {
            console.error('AI API Error:', error);
            throw error;
        }
    };

    // Simulate streaming effect for better UX
    const streamResponse = useCallback((fullText: string, messageId: string) => {
        setIsStreaming(true);
        setStreamingContent("");

        const words = fullText.split(' ');
        let currentIndex = 0;
        let currentText = "";

        const streamNextChunk = () => {
            if (currentIndex < words.length) {
                const wordsToAdd = Math.min(2, words.length - currentIndex);
                for (let i = 0; i < wordsToAdd; i++) {
                    currentText += (currentText ? ' ' : '') + words[currentIndex];
                    currentIndex++;
                }
                setStreamingContent(currentText);
                setTimeout(streamNextChunk, 20 + Math.random() * 30);
            } else {
                setIsStreaming(false);
                setStreamingContent("");
                setMessages(prev => [...prev, {
                    id: messageId,
                    content: fullText,
                    sender: "ai",
                    timestamp: new Date(),
                }]);
            }
        };

        setTimeout(streamNextChunk, 50);
    }, []);

    const handleSendMessage = async (content: string, actionId?: string, imageData?: string) => {
        // Add user message
        const userMessage: Message = {
            id: `user-${Date.now()}`,
            content,
            sender: "user",
            timestamp: new Date(),
            imageUrl: imageData,
        };
        setMessages((prev) => [...prev, userMessage]);
        setShowQuickActions(false);
        setIsTyping(true);

        try {
            // Check if this is a journey-related question and we should include diagram
            const isJourneyQuestion = actionId === 'journey' || 
                content.toLowerCase().includes('sankey') ||
                content.toLowerCase().includes('diagram') ||
                content.toLowerCase().includes('journey');

            let diagramImage = imageData;
            if (isJourneyQuestion && !imageData) {
                // Auto-export Sankey diagram if asking about journeys
                diagramImage = await exportSankeyAsBase64() || undefined;
            }

            const response = await callAI(content, actionId, diagramImage);
            setIsTyping(false);
            streamResponse(response, `ai-${Date.now()}`);
        } catch (error) {
            setIsTyping(false);
            const errorMessage = error instanceof Error ? error.message : 'An error occurred';
            toast.error(errorMessage);
            
            // Add error message to chat
            setMessages(prev => [...prev, {
                id: `error-${Date.now()}`,
                content: `${errorMessage}\n\nPlease try again or select a predefined question below.`,
                sender: "ai",
                timestamp: new Date(),
            }]);
            setShowQuickActions(true);
        }
    };

    const handleQuickAction = (query: string, actionId: string) => {
        handleSendMessage(query, actionId);
    };

    const handleClearConversation = () => {
        setMessages([]);
        setShowQuickActions(true);
        toast.success('Conversation cleared');
    };

    if (!isOpen) return null;

    return (
        <div
            className={cn(
                "fixed bottom-24 right-6 z-50",
                "bg-background/95 backdrop-blur-xl",
                "rounded-2xl shadow-2xl border border-border/50",
                "flex flex-col overflow-hidden",
                "animate-in slide-in-from-bottom-5 fade-in duration-300",
                isResizing && "select-none"
            )}
            style={{
                width: `${size.width}px`,
                height: `${size.height}px`,
                maxHeight: '85vh',
                maxWidth: 'calc(100vw - 48px)',
            }}
        >
            {/* Resize Handle - Top Left Corner */}
            <div
                className="absolute top-0 left-0 w-6 h-6 cursor-nw-resize z-10 flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
                onMouseDown={handleResizeStart}
            >
                <GripVertical className="w-3 h-3 text-muted-foreground rotate-45" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary/10 via-orange-500/5 to-transparent border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <img
                            src="/Taggie_avatar.png"
                            alt="Taggie"
                            className="w-10 h-10 rounded-full object-cover shadow-lg"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                    </div>
                    <div>
                        <h3 className="font-semibold text-sm flex items-center gap-1.5">
                            Taggie
                            <Sparkles className="w-3.5 h-3.5 text-primary" />
                        </h3>
                        <p className="text-xs text-muted-foreground">
                            AI Agent - Powered by OpenAI
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    {messages.length > 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
                            onClick={handleClearConversation}
                            title="Clear conversation"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={onClose}
                    >
                        <Minimize2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full hover:bg-muted"
                        onClick={onClose}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message) => (
                        <AIAgentMessage key={message.id} message={message} />
                    ))}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-3 animate-fade-in">
                            <img
                                src="/Taggie_avatar.png"
                                alt="Taggie"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="bg-muted/80 rounded-2xl rounded-tl-md px-4 py-3">
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                    <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Streaming message */}
                    {isStreaming && streamingContent && (
                        <div className="flex items-start gap-3 animate-fade-in">
                            <img
                                src="/Taggie_avatar.png"
                                alt="Taggie"
                                className="flex-shrink-0 w-8 h-8 rounded-full object-cover shadow-lg"
                            />
                            <div className="max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 bg-muted/80 text-foreground shadow-sm">
                                <div className="text-sm leading-relaxed space-y-1">
                                    <StreamingText content={streamingContent} />
                                </div>
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                                    <span className="text-[10px] text-muted-foreground">Generating...</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Quick Actions - Show only after welcome message */}
            {showQuickActions && messages.length > 0 && !isTyping && !isStreaming && (
                <AIAgentQuickActions onSelect={handleQuickAction} />
            )}

            {/* Input Area */}
            <AIAgentInput 
                onSend={handleSendMessage} 
                disabled={isTyping || isStreaming} 
            />
        </div>
    );
}

// Component to render streaming text with cursor animation
function StreamingText({ content }: { content: string }) {
    const formatContent = (text: string) => {
        return text.split('\n').map((line, i) => {
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            if (line.startsWith('- ') || line.startsWith('* ')) {
                const bulletContent = line.slice(2);
                return (
                    <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bulletContent }} />
                );
            }
            const numberedMatch = line.match(/^(\d+)\. (.*)$/);
            if (numberedMatch) {
                return (
                    <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
                );
            }
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    return (
        <>
            {formatContent(content)}
            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
        </>
    );
}
