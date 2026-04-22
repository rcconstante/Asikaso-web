import { useState, useEffect } from "react";
import { TagBoard } from "@/components/tags/TagBoard";
import { TaggerCard } from "@/components/tags/TaggerCard";
import { Tag, CRMRecord, ObjectType } from "@/types/tag";
import { useToast } from "@/hooks/use-toast";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw, Loader2, ChevronLeft, ChevronRight, Download } from "lucide-react";

export function TagBoardPage() {
  const {
    tags,
    createTag,
    records: hubspotRecords,
    isLoadingRecords,
    fetchRecords,
    updateRecordTags,
    connectionStatus,
  } = useHubSpot();

  // Default to empty selection so it's not overwhelming
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedObjectTypes, setSelectedObjectTypes] = useState<ObjectType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 12;

  const { toast } = useToast();

  // Fetch records when connected
  useEffect(() => {
    if (connectionStatus.isConnected) {
      fetchRecords();
    }
  }, [connectionStatus.isConnected]);

  const records = hubspotRecords;

  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleObjectType = (type: ObjectType) => {
    setSelectedObjectTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  // Filter tags to show only those that apply to selected object types
  const objectTypeMapping: Record<ObjectType, string> = {
    contact: "contacts",
    company: "companies",
    deal: "deals",
    ticket: "tickets"
  };

  const filteredTags = tags.filter((tag) => {
    // If tag has no objectTypes defined, show it for all types (backward compatibility)
    if (!tag.objectTypes || tag.objectTypes.length === 0) return true;

    // Check if tag applies to any of the selected object types
    return selectedObjectTypes.some(type =>
      tag.objectTypes?.includes(objectTypeMapping[type])
    );
  });

  const filteredRecords = records.filter((record) => {
    if (!selectedObjectTypes.includes(record.type)) return false;
    if (selectedTags.length === 0) return true;
    return record.tags.some((tag) => selectedTags.includes(tag.id));
  });

  const handleTagsChange = async (recordId: string, newTags: Tag[]) => {
    const record = records.find(r => r.id === recordId);
    if (!record) return;

    try {
      await updateRecordTags(recordId, record.type, newTags);
      toast({
        title: "Tags updated",
        description: `Tags for ${record.name} have been updated.`,
      });
    } catch (error) {
      toast({
        title: "Failed to update tags",
        description: "There was an error updating the tags.",
        variant: "destructive",
      });
    }
  };

  const handleCreateTag = async (name: string, color: string) => {
    try {
      await createTag({
        name,
        color,
        objectTypes: ["contacts", "companies", "deals", "tickets"], // Default to all object types
        contactCount: 0,
        companyCount: 0,
        dealCount: 0,
        ticketCount: 0,
      });
      toast({
        title: "Tag created",
        description: `"${name}" has been created.`,
      });
    } catch (error: any) {
      const errorMessage = error?.message || '';

      if (errorMessage.includes('Tag limit reached')) {
        toast({
          title: "Tag Limit Reached",
          description: "Upgrade to create unlimited tags.",
          variant: "destructive",
        });
      } else if (errorMessage.includes('does not support these object types')) {
        toast({
          title: "Upgrade Required",
          description: "Some object types require a paid plan.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to create tag",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    if (connectionStatus.isConnected) {
      fetchRecords();
      toast({
        title: "Refreshing records",
        description: "Fetching latest data from HubSpot...",
      });
    }
  };

  const handleExport = () => {
    try {
      // Create CSV content for filtered records
      const headers = ["Name", "Type", "Email", "Company", "Stage", "Tags"];
      const csvRows = [
        headers.join(","),
        ...filteredRecords.map(record => [
          `"${record.name.replace(/"/g, '""')}"`,
          record.type,
          `"${(record.email || '').replace(/"/g, '""')}"`,
          `"${(record.company || '').replace(/"/g, '""')}"`,
          `"${(record.stage || '').replace(/"/g, '""')}"`,
          `"${record.tags.map(t => t.name).join("; ")}"`,
        ].join(","))
      ];

      const csvContent = csvRows.join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `tag-board-records-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export successful",
        description: `Exported ${filteredRecords.length} records to CSV.`,
      });
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting the records.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold mb-2">Tag Board</h1>
            <p className="text-muted-foreground">
              Filter and browse records across all object types by tags.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {connectionStatus.isConnected && (
              <>
                <Button
                  variant="outline"
                  onClick={handleExport}
                  disabled={filteredRecords.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={isLoadingRecords}
                >
                  {isLoadingRecords ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!connectionStatus.isConnected && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Not connected to HubSpot.{" "}
            <a href="/settings" className="underline font-medium">Connect your account</a>
          </AlertDescription>
        </Alert>
      )}

      <TagBoard
        tags={filteredTags}
        selectedTags={selectedTags}
        onTagToggle={toggleTag}
        selectedObjectTypes={selectedObjectTypes}
        onObjectTypeToggle={toggleObjectType}
      />

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            Filtered Records
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              ({filteredRecords.length} results)
            </span>
          </h3>
          {selectedTags.length > 0 && (
            <button
              onClick={() => {
                setSelectedTags([]);
                setCurrentPage(1);
              }}
              className="text-sm text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecords
            .slice((currentPage - 1) * recordsPerPage, currentPage * recordsPerPage)
            .map((record) => (
              <TaggerCard
                key={record.id}
                record={record}
                availableTags={tags}
                onTagsChange={handleTagsChange}
                onCreateTag={handleCreateTag}
                compact
              />
            ))}
        </div>

        {/* Pagination Controls */}
        {filteredRecords.length > recordsPerPage && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Page</span>
              <span className="font-medium">{currentPage}</span>
              <span className="text-muted-foreground">of</span>
              <span className="font-medium">{Math.ceil(filteredRecords.length / recordsPerPage)}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(Math.ceil(filteredRecords.length / recordsPerPage), p + 1))}
              disabled={currentPage >= Math.ceil(filteredRecords.length / recordsPerPage)}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {filteredRecords.length > 0 && (
          <p className="text-center text-sm text-muted-foreground mt-4">
            Showing {Math.min((currentPage - 1) * recordsPerPage + 1, filteredRecords.length)}-{Math.min(currentPage * recordsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </p>
        )}

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No records match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
