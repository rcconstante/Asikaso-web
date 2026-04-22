import { useState, useRef, useEffect } from "react";
import { Plus } from "lucide-react";
import { TagPill } from "./TagPill";
import { Tag } from "@/types/tag";
import { cn } from "@/lib/utils";
import { tagColors } from "@/data/tagColors";

interface TagInputProps {
  availableTags: Tag[];
  selectedTags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onCreateTag?: (name: string, color: string) => void;
  placeholder?: string;
  showColors?: boolean;
}

export function TagInput({
  availableTags,
  selectedTags,
  onTagsChange,
  onCreateTag,
  placeholder = "Add tag...",
  showColors = true,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredTags = availableTags.filter(
    (tag) =>
      tag &&
      tag.name &&
      !selectedTags.find((st) => st.id === tag.id) &&
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  const showCreateOption =
    inputValue.trim() &&
    !availableTags.find(
      (tag) => tag && tag.name && tag.name.toLowerCase() === inputValue.toLowerCase()
    ) &&
    onCreateTag;

  useEffect(() => {
    setHighlightedIndex(0);
  }, [inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (tag: Tag) => {
    onTagsChange([...selectedTags, tag]);
    setInputValue("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleRemove = (tagId: string) => {
    onTagsChange(selectedTags.filter((t) => t.id !== tagId));
  };

  const handleCreate = () => {
    if (onCreateTag && inputValue.trim()) {
      const randomColor = tagColors[Math.floor(Math.random() * tagColors.length)];
      onCreateTag(inputValue.trim(), randomColor);
      setInputValue("");
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalOptions = filteredTags.length + (showCreateOption ? 1 : 0);

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptions);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filteredTags.length) {
        handleSelect(filteredTags[highlightedIndex]);
      } else if (showCreateOption) {
        handleCreate();
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Backspace" && !inputValue && selectedTags.length > 0) {
      handleRemove(selectedTags[selectedTags.length - 1].id);
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "flex flex-wrap gap-2 p-2 min-h-[42px] rounded-lg border border-input bg-background",
          "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
          "transition-all duration-150"
        )}
      >
        {selectedTags.map((tag) => (
          <TagPill
            key={tag.id}
            name={tag.name}
            color={showColors ? tag.color : undefined}
            onRemove={() => handleRemove(tag.id)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[120px] bg-transparent outline-none text-sm placeholder:text-muted-foreground"
        />
      </div>

      {isOpen && (filteredTags.length > 0 || showCreateOption) && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 py-1 bg-popover border border-border rounded-lg shadow-lg animate-scale-in max-h-64 overflow-y-auto"
        >
          {filteredTags.map((tag, index) => (
            <button
              key={tag.id}
              onClick={() => handleSelect(tag)}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2",
                "hover:bg-accent",
                highlightedIndex === index && "bg-accent"
              )}
            >
              {showColors && (
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: tag.color }}
                />
              )}
              <span className="font-medium">{tag.name}</span>
              <span className="ml-auto text-muted-foreground text-xs">
                {(tag.contactCount || 0) + (tag.companyCount || 0) + (tag.dealCount || 0) + (tag.ticketCount || 0)} records
              </span>
            </button>
          ))}

          {showCreateOption && (
            <button
              onClick={handleCreate}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors flex items-center gap-2",
                "hover:bg-accent text-primary",
                highlightedIndex === filteredTags.length && "bg-accent"
              )}
            >
              <Plus className="w-4 h-4" />
              Create "{inputValue}"
            </button>
          )}
        </div>
      )}
    </div>
  );
}
