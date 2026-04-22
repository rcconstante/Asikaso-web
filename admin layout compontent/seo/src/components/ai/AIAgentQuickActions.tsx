import { Button } from "@/components/ui/button";
import { QUICK_ACTIONS } from "./types";

interface AIAgentQuickActionsProps {
    onSelect: (query: string, actionId: string) => void;
}

export function AIAgentQuickActions({ onSelect }: AIAgentQuickActionsProps) {
    return (
        <div className="flex flex-wrap gap-2 p-4 border-t border-border/50">
            {QUICK_ACTIONS.map((action) => (
                <Button
                    key={action.id}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-2 px-3 rounded-full bg-background hover:bg-muted hover:border-primary/50 transition-all duration-200 whitespace-normal text-left"
                    onClick={() => onSelect(action.query, action.id)}
                >
                    {action.label}
                </Button>
            ))}
        </div>
    );
}
