import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarIcon, Filter, X, ChevronDown, Tags, GitBranch, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  SankeyFilters,
  TimeframeOption,
  ObjectTypeFilter,
  JourneyMode,
  DEFAULT_SANKEY_FILTERS,
} from "@/types/sankey";

interface Tag {
  _id: string;
  name: string;
  color: string;
}

interface SankeyControlsProps {
  filters: SankeyFilters;
  onFiltersChange: (filters: SankeyFilters) => void;
  availableTags: Tag[];
  isLoading?: boolean;
  isDemo?: boolean;
  onToggleDemo?: () => void;
}

export function SankeyControls({
  filters,
  onFiltersChange,
  availableTags,
  isLoading,
  isDemo,
  onToggleDemo,
}: SankeyControlsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [tagTimeframeStart, setTagTimeframeStart] = useState<Date>();
  const [tagTimeframeEnd, setTagTimeframeEnd] = useState<Date>();
  const [customStartDate, setCustomStartDate] = useState<Date>();
  const [customEndDate, setCustomEndDate] = useState<Date>();

  const updateFilter = <K extends keyof SankeyFilters>(
    key: K,
    value: SankeyFilters[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleIncludeTag = (tagName: string) => {
    const current = filters.includeOnlyTags;
    if (current.includes(tagName)) {
      updateFilter(
        "includeOnlyTags",
        current.filter((t) => t !== tagName)
      );
    } else {
      updateFilter("includeOnlyTags", [...current, tagName]);
    }
  };

  const resetFilters = () => {
    onFiltersChange(DEFAULT_SANKEY_FILTERS);
    setTagTimeframeStart(undefined);
    setTagTimeframeEnd(undefined);
    setCustomStartDate(undefined);
    setCustomEndDate(undefined);
  };

  const hasActiveFilters =
    filters.journeyMode !== "tags" ||
    filters.conversionTag ||
    filters.includeOnlyTags.length > 0 ||
    filters.timeframe !== "12months" ||
    filters.objectType !== "contacts" ||
    filters.minTransitions !== 1;

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      {/* Journey Mode Toggle */}
      <div className="flex items-center justify-center gap-2 pb-2 border-b">
        <Button
          variant={filters.journeyMode === "tags" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("journeyMode", "tags")}
          className="gap-2"
          disabled={isLoading}
        >
          <Tags className="h-4 w-4" />
          Tag Journey
        </Button>
        <Button
          variant={filters.journeyMode === "stages" ? "default" : "outline"}
          size="sm"
          onClick={() => updateFilter("journeyMode", "stages")}
          className="gap-2"
          disabled={isLoading}
        >
          <GitBranch className="h-4 w-4" />
          Stage Journey
        </Button>

        {/* View Demo Button - only shown in Stage Journey mode */}
        {filters.journeyMode === "stages" && onToggleDemo && (
          <Button
            variant={isDemo ? "secondary" : "outline"}
            size="sm"
            onClick={onToggleDemo}
            className="gap-2 ml-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300 dark:border-purple-700"
          >
            <Sparkles className="h-4 w-4 text-purple-500" />
            {isDemo ? "Exit Demo" : "View Demo"}
          </Button>
        )}
      </div>

      {/* Mode Description */}
      <div className="text-xs text-muted-foreground text-center">
        {filters.journeyMode === "tags" ? (
          <span>Track how records flow through your <strong>custom tags</strong> over time</span>
        ) : (
          <span>Track how records progress through <strong>HubSpot pipeline stages</strong> (Deal/Ticket stages, Lifecycle)</span>
        )}
      </div>

      {/* Primary Filters Row */}
      <div className="flex flex-wrap items-end gap-4">
        {/* Timeframe */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Timeframe</Label>
          <Select
            value={filters.timeframe}
            onValueChange={(value: TimeframeOption) =>
              updateFilter("timeframe", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="14days">Last 14 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="3months">Last 3 months</SelectItem>
              <SelectItem value="6months">Last 6 months</SelectItem>
              <SelectItem value="12months">Last 12 months</SelectItem>
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Date Range Picker - Only shown when "custom" is selected */}
        {filters.timeframe === "custom" && (
          <div className="flex items-end gap-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">From</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !customStartDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customStartDate
                      ? format(customStartDate, "MMM d, yyyy")
                      : "Start"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customStartDate}
                    onSelect={(date) => {
                      setCustomStartDate(date);
                      if (date && customEndDate) {
                        updateFilter("customDateRange", {
                          startDate: date,
                          endDate: customEndDate,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">To</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[130px] justify-start text-left font-normal",
                      !customEndDate && "text-muted-foreground"
                    )}
                    disabled={isLoading}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {customEndDate
                      ? format(customEndDate, "MMM d, yyyy")
                      : "End"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={customEndDate}
                    onSelect={(date) => {
                      setCustomEndDate(date);
                      if (customStartDate && date) {
                        updateFilter("customDateRange", {
                          startDate: customStartDate,
                          endDate: date,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        {/* Object Type - different options for stages mode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Record Type</Label>
          <Select
            value={filters.objectType}
            onValueChange={(value: ObjectTypeFilter) =>
              updateFilter("objectType", value)
            }
            disabled={isLoading}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {filters.journeyMode === "stages" ? (
                <>
                  <SelectItem value="contacts">Contacts (Lifecycle)</SelectItem>
                  <SelectItem value="deals">Deals (Pipeline)</SelectItem>
                  <SelectItem value="tickets">Tickets (Pipeline)</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="contacts">Contacts</SelectItem>
                  <SelectItem value="companies">Companies</SelectItem>
                  <SelectItem value="deals">Deals</SelectItem>
                  <SelectItem value="tickets">Tickets</SelectItem>
                  <SelectItem value="all">All Types</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Conversion Tag - only for tags mode */}
        {filters.journeyMode === "tags" && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">Conversion Tag (End Goal)</Label>
            <Select
              value={filters.conversionTag || "none"}
              onValueChange={(value) =>
                updateFilter("conversionTag", value === "none" ? null : value)
              }
              disabled={isLoading}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select conversion tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Show all paths</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag._id} value={tag.name}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Minimum Threshold */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Min. Records: {filters.minTransitions}
          </Label>
          <div className="w-[120px] px-2">
            <Slider
              value={[filters.minTransitions]}
              onValueChange={([value]) => updateFilter("minTransitions", value)}
              min={1}
              max={10}
              step={1}
              disabled={isLoading}
            />
          </div>
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Advanced
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showAdvanced && "rotate-180"
            )}
          />
        </Button>

        {/* Reset Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="gap-2 text-muted-foreground"
          >
            <X className="h-4 w-4" />
            Reset
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="space-y-4 border-t pt-4">
          {/* Include Only Tags */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Only Include Tags (filter by specific tags)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                  disabled={isLoading}
                >
                  {filters.includeOnlyTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {filters.includeOnlyTags.slice(0, 3).map((tagName) => {
                        const tag = availableTags.find((t) => t.name === tagName);
                        return (
                          <Badge
                            key={tagName}
                            variant="secondary"
                            className="text-xs"
                            style={{
                              backgroundColor: tag?.color || "#6b7280",
                              color: "white",
                            }}
                          >
                            {tagName}
                          </Badge>
                        );
                      })}
                      {filters.includeOnlyTags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{filters.includeOnlyTags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      All tags included
                    </span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-2">
                    {availableTags.map((tag) => (
                      <div
                        key={tag._id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={tag._id}
                          checked={filters.includeOnlyTags.includes(tag.name)}
                          onCheckedChange={() => toggleIncludeTag(tag.name)}
                        />
                        <label
                          htmlFor={tag._id}
                          className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                          />
                          {tag.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>

          {/* Records with Tag X in Timeframe Y */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Only records tagged with specific tag in timeframe
            </Label>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={filters.tagInTimeframe?.tagName || "none"}
                onValueChange={(value) => {
                  if (value === "none") {
                    updateFilter("tagInTimeframe", undefined);
                  } else {
                    updateFilter("tagInTimeframe", {
                      tagName: value,
                      startDate: tagTimeframeStart || new Date(),
                      endDate: tagTimeframeEnd || new Date(),
                    });
                  }
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No filter</SelectItem>
                  {availableTags.map((tag) => (
                    <SelectItem key={tag._id} value={tag.name}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <span className="text-sm text-muted-foreground">within</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !tagTimeframeStart && "text-muted-foreground"
                    )}
                    disabled={isLoading || !filters.tagInTimeframe?.tagName}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tagTimeframeStart
                      ? format(tagTimeframeStart, "MMM d, yyyy")
                      : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tagTimeframeStart}
                    onSelect={(date) => {
                      setTagTimeframeStart(date);
                      if (date && filters.tagInTimeframe) {
                        updateFilter("tagInTimeframe", {
                          ...filters.tagInTimeframe,
                          startDate: date,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <span className="text-sm text-muted-foreground">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-[140px] justify-start text-left font-normal",
                      !tagTimeframeEnd && "text-muted-foreground"
                    )}
                    disabled={isLoading || !filters.tagInTimeframe?.tagName}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {tagTimeframeEnd
                      ? format(tagTimeframeEnd, "MMM d, yyyy")
                      : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={tagTimeframeEnd}
                    onSelect={(date) => {
                      setTagTimeframeEnd(date);
                      if (date && filters.tagInTimeframe) {
                        updateFilter("tagInTimeframe", {
                          ...filters.tagInTimeframe,
                          endDate: date,
                        });
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Active filters:</span>
          {filters.timeframe !== "12months" && (
            <Badge variant="secondary">
              Timeframe: {
                filters.timeframe === "7days" ? "7 days" :
                  filters.timeframe === "14days" ? "14 days" :
                    filters.timeframe === "30days" ? "30 days" :
                      filters.timeframe === "3months" ? "3 months" :
                        filters.timeframe === "6months" ? "6 months" :
                          filters.timeframe === "custom" ? "Custom" :
                            "All time"
              }
            </Badge>
          )}
          {filters.objectType !== "contacts" && (
            <Badge variant="secondary">Type: {filters.objectType}</Badge>
          )}
          {filters.conversionTag && (
            <Badge variant="secondary">
              Conversion: {filters.conversionTag}
            </Badge>
          )}
          {filters.minTransitions !== 1 && (
            <Badge variant="secondary">
              Min: {filters.minTransitions} records
            </Badge>
          )}
          {filters.includeOnlyTags.length > 0 && (
            <Badge variant="secondary">
              {filters.includeOnlyTags.length} tags selected
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
