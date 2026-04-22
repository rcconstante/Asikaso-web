import { cn } from "@/lib/utils";
import { Message } from "./types";
import { User } from "lucide-react";

interface AIAgentMessageProps {
    message: Message;
}

export function AIAgentMessage({ message }: AIAgentMessageProps) {
    const isAI = message.sender === 'ai';

    // Format timestamp
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // Parse markdown-like formatting
    const formatContent = (content: string) => {
        // Split by lines and process
        return content.split('\n').map((line, i) => {
            // Bold text
            line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            // Bullet points (handle both • and -)
            if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
                const bulletContent = line.slice(2);
                return (
                    <li key={i} className="ml-4 list-disc" dangerouslySetInnerHTML={{ __html: bulletContent }} />
                );
            }
            // Numbered lists
            const numberedMatch = line.match(/^(\d+)\. (.*)$/);
            if (numberedMatch) {
                return (
                    <li key={i} className="ml-4 list-decimal" dangerouslySetInnerHTML={{ __html: numberedMatch[2] }} />
                );
            }
            // Regular line
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} dangerouslySetInnerHTML={{ __html: line }} />;
        });
    };

    return (
        <div
            className={cn(
                "flex gap-3 animate-fade-in",
                isAI ? "justify-start" : "justify-end"
            )}
        >
            {isAI && (
                <img
                    src="/Taggie_avatar.png"
                    alt="Taggie"
                    className="flex-shrink-0 w-8 h-8 rounded-full object-cover shadow-lg"
                />
            )}

            <div
                className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-3 shadow-sm",
                    isAI
                        ? "bg-muted/80 text-foreground rounded-tl-md"
                        : "bg-primary text-primary-foreground rounded-tr-md"
                )}
            >
                <div className={cn(
                    "text-sm leading-relaxed space-y-1",
                    isAI ? "text-foreground" : "text-primary-foreground"
                )}>
                    {formatContent(message.content)}
                </div>

                {message.imageUrl && (
                    <img
                        src={message.imageUrl}
                        alt="Attached"
                        className="mt-2 rounded-lg max-w-full h-auto"
                    />
                )}

                <p className={cn(
                    "text-[10px] mt-2 opacity-60",
                    isAI ? "text-muted-foreground" : "text-primary-foreground"
                )}>
                    {formatTime(message.timestamp)}
                </p>
            </div>

            {!isAI && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center shadow-lg">
                    <User className="w-4 h-4 text-white" />
                </div>
            )}
        </div>
    );
}
