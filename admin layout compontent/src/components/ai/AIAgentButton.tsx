import { useState } from "react";
import { AIAgentChat } from "./AIAgentChat";
import { cn } from "@/lib/utils";
import { MessageCircle, X } from "lucide-react";

export function AIAgentButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Chat Window */}
            <AIAgentChat isOpen={isOpen} onClose={() => setIsOpen(false)} />

            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "fixed bottom-6 right-6 z-50",
                    "w-14 h-14 rounded-full",
                    "shadow-lg shadow-primary/30",
                    "transition-all duration-300 ease-out",
                    "hover:scale-110 hover:shadow-xl hover:shadow-primary/40",
                    "active:scale-95",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "group overflow-hidden",
                    isOpen && "rotate-0"
                )}
                aria-label={isOpen ? "Close chat" : "Open chat with Taggie"}
            >
                {/* Background with gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-orange-500 rounded-full" />

                {/* Animated ring effect */}
                <div className={cn(
                    "absolute inset-0 rounded-full",
                    "animate-ping bg-primary/30",
                    isOpen && "animate-none opacity-0"
                )} />

                {/* Icon container */}
                <div className="relative w-full h-full flex items-center justify-center">
                    {isOpen ? (
                        <X className="w-6 h-6 text-white transition-transform duration-300" />
                    ) : (
                        <div className="relative">
                            <img
                                src="/Taggie_avatar.png"
                                alt="Taggie"
                                className="w-10 h-10 rounded-full object-cover border-2 border-white/50"
                            />
                            <MessageCircle className="absolute -bottom-1 -right-1 w-4 h-4 text-white bg-orange-500 rounded-full p-0.5" />
                        </div>
                    )}
                </div>

                {/* Tooltip */}
                <span className={cn(
                    "absolute right-16 top-1/2 -translate-y-1/2",
                    "bg-foreground text-background text-sm font-medium",
                    "px-3 py-1.5 rounded-lg whitespace-nowrap",
                    "opacity-0 translate-x-2 pointer-events-none",
                    "transition-all duration-200",
                    "group-hover:opacity-100 group-hover:translate-x-0",
                    isOpen && "!opacity-0"
                )}>
                    Chat with Taggie
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-foreground" />
                </span>
            </button>
        </>
    );
}