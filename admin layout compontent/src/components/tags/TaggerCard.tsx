import { User, Building2, Briefcase, Ticket } from "lucide-react";
import { TagInput } from "./TagInput";
import { TagPill } from "./TagPill";
import { Tag, CRMRecord, ObjectType } from "@/types/tag";
import { cn } from "@/lib/utils";

interface TaggerCardProps {
  record: CRMRecord;
  availableTags: Tag[];
  onTagsChange: (recordId: string, tags: Tag[]) => void;
  onCreateTag: (name: string, color: string) => void;
  compact?: boolean;
}

const iconMap: Record<ObjectType, typeof User> = {
  contact: User,
  company: Building2,
  deal: Briefcase,
  ticket: Ticket,
};

const colorMap: Record<ObjectType, string> = {
  contact: "bg-blue-500/10 text-blue-600",
  company: "bg-purple-500/10 text-purple-600",
  deal: "bg-green-500/10 text-green-600",
  ticket: "bg-orange-500/10 text-orange-600",
};

export function TaggerCard({
  record,
  availableTags,
  onTagsChange,
  onCreateTag,
  compact = false,
}: TaggerCardProps) {
  const Icon = iconMap[record.type];

  // Filter tags to show only those that apply to this record type
  const objectTypeMapping: Record<ObjectType, string> = {
    contact: "contacts",
    company: "companies",
    deal: "deals",
    ticket: "tickets"
  };

  const filteredAvailableTags = availableTags.filter((tag) => {
    // If tag has no objectTypes defined, show it for all types (backward compatibility)
    if (!tag.objectTypes || tag.objectTypes.length === 0) return true;
    
    // Check if tag applies to this record type
    return tag.objectTypes.includes(objectTypeMapping[record.type]);
  });

  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", colorMap[record.type])}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{record.name}</h4>
            <p className="text-xs text-muted-foreground capitalize">{record.type}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {record.tags.length === 0 ? (
            <span className="text-xs text-muted-foreground">No tags</span>
          ) : (
            record.tags.map((tag) => (
              <TagPill
                key={tag.id}
                name={tag.name}
                color={tag.color}
                size="sm"
                onRemove={() => onTagsChange(record.id, record.tags.filter((t) => t.id !== tag.id))}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-4">
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", colorMap[record.type])}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-lg truncate">{record.name}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="capitalize">{record.type}</span>
            {record.email && <span>• {record.email}</span>}
            {record.value && <span>• ${record.value.toLocaleString()}</span>}
            {record.industry && <span>• {record.industry}</span>}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <TagInput
          availableTags={filteredAvailableTags}
          selectedTags={record.tags}
          onTagsChange={(tags) => onTagsChange(record.id, tags)}
          onCreateTag={onCreateTag}
          placeholder={`Add tags to this ${record.type}...`}
        />
      </div>

      {(record.company || record.stage || record.phone) && (
        <div className="pt-4 border-t border-border grid grid-cols-2 gap-4 text-sm">
          {record.company && (
            <div>
              <span className="text-muted-foreground">Company</span>
              <p className="font-medium">{record.company}</p>
            </div>
          )}
          {record.phone && (
            <div>
              <span className="text-muted-foreground">Phone</span>
              <p className="font-medium">{record.phone}</p>
            </div>
          )}
          {record.stage && (
            <div>
              <span className="text-muted-foreground">Stage</span>
              <p className="font-medium">{record.stage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
