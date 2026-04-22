import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useCategories } from "@/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ChevronRight, ChevronDown, Plus, Edit, Trash2, FolderTree, Save } from "lucide-react";
import { Tag } from "@/types/tag";

interface TagCategoryManagerProps {
  tags: Tag[];
}

const categoryColors = [
  "#3b82f6", // blue
  "#10b981", // green
  "#f59e0b", // orange
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange-600
  "#14b8a6", // teal
];

export function TagCategoryManager({ tags }: TagCategoryManagerProps) {
  const { toast } = useToast();
  const { categories, createCategory, updateCategory, deleteCategory } = useCategories();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string; color: string; description?: string; tagIds: string[] } | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#3b82f6");
  const [newCategoryDescription, setNewCategoryDescription] = useState("");
  const [newCategoryTagIds, setNewCategoryTagIds] = useState<string[]>([]);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false);
  const [selectedCategoryForTag, setSelectedCategoryForTag] = useState<string | null>(null);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleAddCategory = async () => {
    if (newCategoryName.trim()) {
      try {
        await createCategory({
          name: newCategoryName,
          color: newCategoryColor,
          description: newCategoryDescription,
          tagIds: newCategoryTagIds,
        });
        toast({
          title: "Category created",
          description: `"${newCategoryName}" has been created with ${newCategoryTagIds.length} tag(s).`,
        });
        setNewCategoryName("");
        setNewCategoryColor("#3b82f6");
        setNewCategoryDescription("");
        setNewCategoryTagIds([]);
        setIsAddCategoryOpen(false);
      } catch (error) {
        toast({
          title: "Failed to create category",
          description: "There was an error creating the category.",
          variant: "destructive",
        });
      }
    }
  };

  const handleEditCategory = async () => {
    if (selectedCategory && newCategoryName.trim()) {
      try {
        await updateCategory(selectedCategory.id, {
          name: newCategoryName,
          color: newCategoryColor,
          description: newCategoryDescription,
        });
        toast({
          title: "Category updated",
          description: `"${newCategoryName}" has been updated.`,
        });
        setIsEditCategoryOpen(false);
        setSelectedCategory(null);
      } catch (error) {
        toast({
          title: "Failed to update category",
          description: "There was an error updating the category.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory(categoryToDelete);
        toast({
          title: "Category deleted",
          description: "The category has been removed.",
        });
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      } catch (error) {
        toast({
          title: "Failed to delete category",
          description: "There was an error deleting the category.",
          variant: "destructive",
        });
      }
    }
  };

  const handleAddTagsToCategory = async () => {
    if (selectedCategoryForTag) {
      const category = categories.find(c => c.id === selectedCategoryForTag);
      if (category) {
        // Replace the category's tagIds with only the selected ones
        // This allows both adding AND removing tags
        try {
          await updateCategory(selectedCategoryForTag, { tagIds: selectedTagIds });

          const addedCount = selectedTagIds.filter(id => !category.tagIds.includes(id)).length;
          const removedCount = category.tagIds.filter(id => !selectedTagIds.includes(id)).length;

          let message = "";
          if (addedCount > 0 && removedCount > 0) {
            message = `Added ${addedCount} and removed ${removedCount} tag(s).`;
          } else if (addedCount > 0) {
            message = `${addedCount} tag(s) added to ${category.name}.`;
          } else if (removedCount > 0) {
            message = `${removedCount} tag(s) removed from ${category.name}.`;
          } else {
            message = `Tags updated for ${category.name}.`;
          }

          toast({
            title: "Category updated",
            description: message,
          });
          setIsAddTagDialogOpen(false);
          setSelectedCategoryForTag(null);
          setSelectedTagIds([]);
        } catch (error) {
          toast({
            title: "Failed to update tags",
            description: "There was an error updating the category tags.",
            variant: "destructive",
          });
        }
      }
    }
  };

  const handleRemoveTagFromCategory = async (categoryId: string, tagId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (category) {
      try {
        await updateCategory(categoryId, {
          tagIds: category.tagIds.filter(id => id !== tagId),
        });
      } catch (error) {
        toast({
          title: "Failed to remove tag",
          description: "There was an error removing the tag.",
          variant: "destructive",
        });
      }
    }
  };

  const openEditDialog = (category: typeof categories[0]) => {
    setSelectedCategory(category);
    setNewCategoryName(category.name);
    setNewCategoryColor(category.color);
    setNewCategoryDescription(category.description || "");
    setIsEditCategoryOpen(true);
  };

  const openDeleteDialog = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setIsDeleteDialogOpen(true);
  };

  const openAddTagDialog = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    setSelectedCategoryForTag(categoryId);
    setSelectedTagIds(category?.tagIds || []);
    setIsAddTagDialogOpen(true);
  };

  const toggleTagSelection = (tagId: string) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const toggleNewCategoryTagSelection = (tagId: string) => {
    setNewCategoryTagIds(prev =>
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getCategoryStats = (category: typeof categories[0]) => {
    const categoryTags = tags.filter(tag => category.tagIds.includes(tag.id));
    const totalTags = categoryTags.length;
    const totalRecords = categoryTags.reduce(
      (sum, tag) => sum + tag.contactCount + tag.companyCount + tag.dealCount + (tag.ticketCount || 0),
      0
    );
    return { totalTags, totalRecords };
  };

  const uncategorizedTags = tags.filter(tag =>
    !categories.some(cat => cat.tagIds.includes(tag.id))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tag Categories & Hierarchies</h2>
          <p className="text-muted-foreground">
            Organize tags into groups with nested subtags
          </p>
        </div>
        <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
              <DialogDescription>
                Add a new category to organize your tags
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 px-1">
              <div className="space-y-2">
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Product Interest"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description (Optional)</Label>
                <Textarea
                  id="category-description"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Describe this category..."
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-color">Color</Label>
                <div className="flex gap-2 w-full">
                  <Input
                    id="category-color"
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    className="w-20 h-10 flex-shrink-0"
                  />
                  <Input
                    value={newCategoryColor}
                    className="flex-1"
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>

              {/* Tag Selection Section */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Select Tags (Optional)</Label>
                  <Badge variant="secondary">
                    {newCategoryTagIds.length} selected
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  Choose tags to add to this category
                </p>
                {tags.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No tags available. Create tags first.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {tags.map((tag) => (
                      <div
                        key={tag.id}
                        onClick={() => toggleNewCategoryTagSelection(tag.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${newCategoryTagIds.includes(tag.id)
                          ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                          : 'border-border hover:border-primary/50 hover:bg-accent/50'
                          }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: tag.color }}
                          />
                          <span className="text-sm font-medium truncate">{tag.name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {tag.contactCount + tag.companyCount + tag.dealCount} records
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter className="border-t pt-4">
              <Button variant="outline" onClick={() => {
                setIsAddCategoryOpen(false);
                setNewCategoryName("");
                setNewCategoryColor("#3b82f6");
                setNewCategoryDescription("");
                setNewCategoryTagIds([]);
              }}>
                Cancel
              </Button>
              <Button onClick={handleAddCategory} disabled={!newCategoryName.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Create Category
                {newCategoryTagIds.length > 0 && ` with ${newCategoryTagIds.length} tag(s)`}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Categorized Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + cat.tagIds.length, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Uncategorized</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {uncategorizedTags.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tagged Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + getCategoryStats(cat).totalRecords, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Tree View */}
      <Card>
        <CardHeader>
          <CardTitle>Category Hierarchy</CardTitle>
          <CardDescription>Expandable tree view of all categories and tags</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {categories.map((category) => {
              const stats = getCategoryStats(category);
              const isExpanded = expandedCategories.has(category.id);

              return (
                <div key={category.id} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCategory(category.id)}
                        className="p-0 h-6 w-6"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      <FolderTree
                        className="h-5 w-5"
                        style={{ color: category.color }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{category.name}</span>
                          <Badge
                            variant="outline"
                            style={{
                              borderColor: category.color,
                              color: category.color,
                            }}
                          >
                            {stats.totalTags} tags
                          </Badge>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openAddTagDialog(category.id)}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Tags in Category */}
                  {isExpanded && (
                    <div className="mt-3 ml-9 space-y-2">
                      {category.tagIds.length === 0 ? (
                        <p className="text-sm text-muted-foreground py-2">
                          No tags in this category. Click <Plus className="h-3 w-3 inline" /> to add tags.
                        </p>
                      ) : (
                        tags.filter(tag => category.tagIds.includes(tag.id)).map((tag) => (
                          <div key={tag.id} className="border-l-2 pl-4" style={{ borderColor: category.color }}>
                            <div className="flex items-center gap-2">
                              <Badge style={{ backgroundColor: tag.color, color: 'white' }}>
                                {tag.name}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {tag.contactCount + tag.companyCount + tag.dealCount + (tag.ticketCount || 0)} records
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uncategorized Tags */}
      {uncategorizedTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uncategorized Tags</CardTitle>
            <CardDescription>Tags that haven't been assigned to a category yet</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {uncategorizedTags.map((tag) => (
                <Badge key={tag.id} style={{ backgroundColor: tag.color, color: 'white' }}>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Color-Coded Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Category Color Legend</CardTitle>
          <CardDescription>Quick reference for category colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="p-4 rounded-lg border-2"
                style={{ borderColor: category.color }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-semibold">{category.name}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {category.tagIds.length} tags
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Dialog */}
      <Dialog open={isEditCategoryOpen} onOpenChange={setIsEditCategoryOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update category details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-category-name">Category Name</Label>
              <Input
                id="edit-category-name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-description">Description</Label>
              <Textarea
                id="edit-category-description"
                value={newCategoryDescription}
                onChange={(e) => setNewCategoryDescription(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-category-color">Color</Label>
              <div className="flex gap-2 w-full">
                <Input
                  id="edit-category-color"
                  type="color"
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="w-20 h-10 flex-shrink-0"
                />
                <Input
                  value={newCategoryColor}
                  onChange={(e) => setNewCategoryColor(e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEditCategory}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Tags to Category Dialog */}
      <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Category Tags</DialogTitle>
            <DialogDescription>
              Select or deselect tags to include in this category. Click a tag to toggle its selection.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between py-2 px-1 border-b">
            <span className="text-sm text-muted-foreground">
              {selectedTagIds.length} of {tags.length} tags selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTagIds(tags.map(t => t.id))}
              >
                Select All
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTagIds([])}
              >
                Clear All
              </Button>
            </div>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            <div className="grid grid-cols-2 gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTagIds.includes(tag.id);
                return (
                  <div
                    key={tag.id}
                    onClick={() => toggleTagSelection(tag.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                        : 'border-border hover:border-primary/50 hover:bg-accent/50'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/30'
                          }`}
                      >
                        {isSelected && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: tag.color }} />
                      <span className="text-sm font-medium truncate">{tag.name}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 ml-7">
                      {tag.contactCount + tag.companyCount + tag.dealCount + (tag.ticketCount || 0)} records
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <DialogFooter className="border-t pt-4">
            <Button variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTagsToCategory}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the category but keep the tags. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteCategory}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
