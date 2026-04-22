import { Pencil, Trash2, ArrowUpDown, Users, Building2, Handshake, Ticket } from "lucide-react";
import { Tag } from "@/types/tag";
import { Button } from "@/components/ui/button";
import { TagPill } from "./TagPill";
import { cn } from "@/lib/utils";

interface TagListProps {
  tags: Tag[];
  onEdit: (tag: Tag) => void;
  onDelete: (tagId: string) => void;
  sortBy?: "name" | "contacts" | "companies" | "deals" | "tickets";
  sortOrder?: "asc" | "desc";
  onSort?: (field: "name" | "contacts" | "companies" | "deals" | "tickets") => void;
}

const objectTypeConfig = {
  contacts: { color: "bg-green-500", icon: Users },
  companies: { color: "bg-orange-500", icon: Building2 },
  deals: { color: "bg-blue-500", icon: Handshake },
  tickets: { color: "bg-red-500", icon: Ticket },
};

export function TagList({ tags, onEdit, onDelete, sortBy, sortOrder, onSort }: TagListProps) {
  if (tags.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No tags created yet.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Create your first tag to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th 
              className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
              onClick={() => onSort?.("name")}
            >
              <div className="flex items-center gap-1">
                Tag Name
                <div className="w-3 h-3">
                  {sortBy === "name" && (
                    <ArrowUpDown className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </div>
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              Applies To
            </th>
            <th 
              className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
              onClick={() => onSort?.("contacts")}
            >
              <div className="flex items-center gap-1">
                Contacts
                <div className="w-3 h-3">
                  {sortBy === "contacts" && (
                    <ArrowUpDown className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </div>
            </th>
            <th 
              className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
              onClick={() => onSort?.("companies")}
            >
              <div className="flex items-center gap-1">
                Companies
                <div className="w-3 h-3">
                  {sortBy === "companies" && (
                    <ArrowUpDown className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </div>
            </th>
            <th 
              className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
              onClick={() => onSort?.("deals")}
            >
              <div className="flex items-center gap-1">
                Deals
                <div className="w-3 h-3">
                  {sortBy === "deals" && (
                    <ArrowUpDown className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </div>
            </th>
            <th 
              className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer select-none transition-colors"
              onClick={() => onSort?.("tickets")}
            >
              <div className="flex items-center gap-1">
                Tickets
                <div className="w-3 h-3">
                  {sortBy === "tickets" && (
                    <ArrowUpDown className={cn("h-3 w-3", sortOrder === "desc" && "rotate-180")} />
                  )}
                </div>
              </div>
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tags.map((tag, index) => {
            const tagObjectTypes = tag.objectTypes || ["contacts", "companies", "deals", "tickets"];
            return (
              <tr
                key={tag.id}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <td className="px-4 py-3">
                  <TagPill name={tag.name} color={tag.color} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {(Object.keys(objectTypeConfig) as Array<keyof typeof objectTypeConfig>).map((type) => {
                      const isActive = tagObjectTypes.includes(type);
                      const config = objectTypeConfig[type];
                      const IconComponent = config.icon;
                      return (
                        <div
                          key={type}
                          className={cn(
                            "w-7 h-7 rounded flex items-center justify-center text-white",
                            isActive ? config.color : "bg-muted text-muted-foreground"
                          )}
                          title={type.charAt(0).toUpperCase() + type.slice(1)}
                        >
                          <IconComponent className="w-4 h-4" strokeWidth={2.5} />
                        </div>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {tag.contactCount}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {tag.companyCount}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {tag.dealCount}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {tag.ticketCount || 0}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(tag)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(tag.id)}
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
