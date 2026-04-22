import { Check } from "lucide-react";
import { Tag, ObjectType } from "@/types/tag";
import { cn } from "@/lib/utils";

interface TagBoardProps {
  tags: Tag[];
  selectedTags: string[];
  onTagToggle: (tagId: string) => void;
  selectedObjectTypes: ObjectType[];
  onObjectTypeToggle: (type: ObjectType) => void;
}

const objectTypes: { type: ObjectType; label: string; color: string }[] = [
  { type: "contact", label: "Contacts", color: "bg-blue-500" },
  { type: "company", label: "Companies", color: "bg-purple-500" },
  { type: "deal", label: "Deals", color: "bg-green-500" },
  { type: "ticket", label: "Tickets", color: "bg-orange-500" },
];

export function TagBoard({
  tags,
  selectedTags,
  onTagToggle,
  selectedObjectTypes,
  onObjectTypeToggle,
}: TagBoardProps) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium mb-3">Object Types</h3>
        <div className="flex flex-wrap gap-2">
          {objectTypes.map(({ type, label, color }) => {
            const isSelected = selectedObjectTypes.includes(type);
            return (
              <button
                key={type}
                onClick={() => onObjectTypeToggle(type)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  "border border-border hover:border-foreground/30",
                  isSelected && "border-foreground/50 bg-accent"
                )}
              >
                <span className="flex items-center gap-2">
                  <span className={cn("w-2.5 h-2.5 rounded-full", color)} />
                  {label}
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-medium mb-3">Filter by Tags</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {tags.map((tag) => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                onClick={() => onTagToggle(tag.id)}
                className={cn(
                  "p-3 rounded-lg text-left transition-all",
                  "border border-border hover:border-foreground/30",
                  isSelected && "ring-2 ring-offset-2 ring-primary/50"
                )}
                style={{
                  backgroundColor: isSelected ? `${tag.color}15` : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5"
                    style={{ backgroundColor: tag.color }}
                  />
                  {isSelected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
                </div>
                <p className="font-medium text-sm mt-2 truncate">{tag.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {tag.contactCount + tag.companyCount + tag.dealCount + (tag.ticketCount || 0)} records
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
