import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TagPillProps {
  name: string;
  color?: string;
  onRemove?: () => void;
  className?: string;
  size?: "sm" | "md";
}

export function TagPill({ name, color, onRemove, className, size = "md" }: TagPillProps) {
  const bgColor = color ? `${color}20` : undefined;
  const textColor = color || undefined;
  const hoverColor = color ? `${color}30` : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium transition-colors",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        !color && "bg-tag text-tag-text",
        onRemove && (size === "sm" ? "pr-1" : "pr-1.5"),
        className
      )}
      style={color ? { backgroundColor: bgColor, color: textColor } : undefined}
    >
      {name}
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn(
            "rounded-full transition-colors",
            size === "sm" ? "p-0.5" : "p-0.5"
          )}
          style={color ? { backgroundColor: hoverColor } : undefined}
          aria-label={`Remove ${name} tag`}
        >
          <X className={size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5"} />
        </button>
      )}
    </span>
  );
}
