import { useState, useEffect, useRef } from "react";
import { X, Check, Palette, AlertCircle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tag } from "@/types/tag";
import { tagColors } from "@/data/tagColors";
import { cn } from "@/lib/utils";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TagFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, color: string, objectTypes: string[]) => void;
  tag?: Tag | null;
  isLoading?: boolean;
}

export function TagFormModal({ isOpen, onClose, onSubmit, tag, isLoading = false }: TagFormModalProps) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(tagColors[0]);
  const [objectTypes, setObjectTypes] = useState<string[]>([]);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get plan features to check which object types are allowed
  const { plan, allowedObjectTypes, canAccessObjectType } = usePlanFeatures();
  const isPaidPlan = plan === 'basic' || plan === 'pro';

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
      // Use the tag's objectTypes, or empty array if not set
      setObjectTypes(tag.objectTypes || []);
    } else {
      setName("");
      setColor(tagColors[0]);
      setObjectTypes([]);
    }
  }, [tag, isOpen]);

  // Check if an object type has active tags
  const getObjectTypeCount = (type: string): number => {
    if (!tag) return 0;
    switch (type) {
      case 'contacts': return tag.contactCount || 0;
      case 'companies': return tag.companyCount || 0;
      case 'deals': return tag.dealCount || 0;
      case 'tickets': return tag.ticketCount || 0;
      default: return 0;
    }
  };

  // Check if an object type is locked due to plan restrictions
  const isObjectTypeLocked = (type: string): boolean => {
    return !canAccessObjectType(type);
  };

  const toggleObjectType = (type: string) => {
    // Check plan restrictions first
    if (isObjectTypeLocked(type)) {
      toast({
        title: "Upgrade Required",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} is only available on Basic and Pro plans.`,
        variant: "destructive",
      });
      return;
    }

    // If trying to uncheck, verify no active tags exist
    if (objectTypes.includes(type) && getObjectTypeCount(type) > 0) {
      // Don't allow unchecking - user needs to untag first
      return;
    }

    setObjectTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && objectTypes.length > 0) {
      // Final check: ensure no locked object types are selected
      const lockedTypes = objectTypes.filter(t => isObjectTypeLocked(t));
      if (lockedTypes.length > 0) {
        toast({
          title: "Upgrade Required",
          description: `Your plan doesn't support: ${lockedTypes.join(', ')}. Please upgrade or remove these object types.`,
          variant: "destructive",
        });
        return;
      }

      onSubmit(name.trim(), color, objectTypes);
      // Don't close here - let parent handle closing after successful API call
      // Don't reset form here either - parent will close modal which resets via useEffect
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 w-screen h-screen bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md mx-4 bg-card rounded-xl shadow-2xl border border-border animate-scale-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">
            {tag ? "Edit Tag" : "Create New Tag"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tagName">Tag Name</Label>
            <Input
              id="tagName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter tag name..."
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {tagColors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110",
                    color === c && "ring-2 ring-offset-2 ring-foreground/50"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {color === c && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
              {/* Custom Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => colorInputRef.current?.click()}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-110 border-2 border-dashed",
                    !tagColors.includes(color) && "ring-2 ring-offset-2 ring-foreground/50"
                  )}
                  style={{
                    backgroundColor: !tagColors.includes(color) ? color : "transparent",
                    borderColor: tagColors.includes(color) ? "currentColor" : color
                  }}
                >
                  {!tagColors.includes(color) ? (
                    <Check className="w-4 h-4 text-white" />
                  ) : (
                    <Palette className="w-4 h-4" />
                  )}
                </button>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="absolute inset-0 w-8 h-8 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Applies To</Label>
            <p className="text-xs text-muted-foreground mb-2">
              Select at least one CRM object type for this tag
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "contacts", label: "Contacts" },
                { value: "companies", label: "Companies" },
                { value: "deals", label: "Deals" },
                { value: "tickets", label: "Tickets" }
              ].map(({ value, label }) => {
                const count = getObjectTypeCount(value);
                const hasActiveTags = count > 0;
                const isChecked = objectTypes.includes(value);
                const isActiveTagLocked = isChecked && hasActiveTags;
                const isPlanLocked = isObjectTypeLocked(value);

                const buttonContent = (
                  <button
                    type="button"
                    onClick={() => toggleObjectType(value)}
                    disabled={isActiveTagLocked}
                    className={cn(
                      "w-full p-3 border-2 rounded-lg text-sm font-medium transition-all relative",
                      isChecked && !isPlanLocked
                        ? "border-primary bg-primary/5 text-primary"
                        : isPlanLocked
                          ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed opacity-60"
                          : "border-border hover:border-primary/50 text-muted-foreground hover:text-foreground",
                      isActiveTagLocked && "opacity-75 cursor-not-allowed"
                    )}
                    title={
                      isPlanLocked
                        ? `Upgrade to use ${label}`
                        : isActiveTagLocked
                          ? `Cannot uncheck: ${count} ${label.toLowerCase()} tagged`
                          : undefined
                    }
                  >
                    {isPlanLocked ? (
                      <Lock className="w-4 h-4 mr-2 inline text-amber-500" />
                    ) : (
                      <Check className={cn(
                        "w-4 h-4 mr-2 inline",
                        isChecked ? "opacity-100" : "opacity-0"
                      )} />
                    )}
                    {label}
                    {isPlanLocked && (
                      <span className="ml-1 text-xs text-amber-500">(Pro)</span>
                    )}
                    {isActiveTagLocked && (
                      <span className="ml-1 text-xs">({count})</span>
                    )}
                  </button>
                );

                // Wrap locked items with tooltip
                if (isPlanLocked) {
                  return (
                    <TooltipProvider key={value}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div>{buttonContent}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-sm">
                            Upgrade to Basic or Pro to use {label}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  );
                }

                return (
                  <div key={value} className="relative">
                    {buttonContent}
                  </div>
                );
              })}
            </div>



            {tag && objectTypes.some(type => getObjectTypeCount(type) > 0) && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg mt-2">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Object types with active tags cannot be unchecked. Remove all tags from those objects first.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-3 bg-muted/50 rounded-lg">
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium"
                style={{ backgroundColor: `${color}20`, color }}
              >
                {name || "Tag Name"}
              </span>
              {objectTypes.length > 0 && (
                <div className="text-xs text-muted-foreground mt-2">
                  For: {objectTypes.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(", ")}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || objectTypes.length === 0 || isLoading}>
              {isLoading ? "Saving..." : tag ? "Save Changes" : "Create Tag"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
