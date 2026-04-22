// HubSpot Connection Status Badge Component

import { Badge } from "@/components/ui/badge";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { Link2, Link2Off, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConnectionStatusBadgeProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function ConnectionStatusBadge({ 
  className, 
  showLabel = true,
  size = "md" 
}: ConnectionStatusBadgeProps) {
  const { connectionStatus, isConnecting, useDemoMode } = useHubSpot();

  const sizeClasses = {
    sm: "h-5 text-[10px]",
    md: "h-6 text-xs",
    lg: "h-7 text-sm",
  };

  const iconSize = {
    sm: "h-3 w-3",
    md: "h-3.5 w-3.5",
    lg: "h-4 w-4",
  };

  if (isConnecting) {
    return (
      <Badge variant="secondary" className={cn(sizeClasses[size], className)}>
        <Loader2 className={cn(iconSize[size], "mr-1 animate-spin")} />
        {showLabel && "Connecting..."}
      </Badge>
    );
  }

  if (useDemoMode) {
    return (
      <Badge variant="outline" className={cn(sizeClasses[size], "border-amber-500/50 text-amber-600 dark:text-amber-400", className)}>
        <Sparkles className={cn(iconSize[size], "mr-1")} />
        {showLabel && "Demo Mode"}
      </Badge>
    );
  }

  if (connectionStatus.isConnected) {
    return (
      <Badge variant="outline" className={cn(sizeClasses[size], "border-green-500/50 text-green-600 dark:text-green-400", className)}>
        <Link2 className={cn(iconSize[size], "mr-1")} />
        {showLabel && (connectionStatus.domain || "Connected")}
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className={cn(sizeClasses[size], className)}>
      <Link2Off className={cn(iconSize[size], "mr-1")} />
      {showLabel && "Not Connected"}
    </Badge>
  );
}
