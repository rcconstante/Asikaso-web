import { TagCategoryManager } from "@/components/categories/TagCategoryManager";
import { useHubSpot } from "@/contexts/HubSpotContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  FolderTree,
  Sparkles,
  AlertCircle,
  Lightbulb,
  ArrowRight,
  Tag as TagIcon,
  Layers,
  GitBranch,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function CategoriesPage() {
  const { tags, connectionStatus } = useHubSpot();

  const hasNoTags = tags.length === 0;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <FolderTree className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Categories
              </h1>
              <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                <Sparkles className="w-3 h-3 mr-1" />
                Organize
              </Badge>
            </div>
            <p className="text-muted-foreground text-base">
              Group your tags into logical categories for better organization and discoverability
            </p>
          </div>
        </div>
      </div>

      {/* Connection Status Alert */}
      {!connectionStatus.isConnected && (
        <Alert className="rounded-xl border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/50">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-amber-700 dark:text-amber-300">
            Not connected to HubSpot. Connect your account to start creating categories.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty State - No Tags Yet */}
      {hasNoTags && connectionStatus.isConnected && (
        <Card className="rounded-2xl border-dashed border-2 bg-muted/20">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6">
              <TagIcon className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Tags First</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Before you can organize tags into categories, you need to create some tags. Categories help you group related tags for easier management.
            </p>
            <Link
              to="/tags"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all"
            >
              <TagIcon className="w-4 h-4" />
              Create Your First Tag
              <ArrowRight className="w-4 h-4" />
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Getting Started Tips - Show when connected but few categories */}
      {connectionStatus.isConnected && !hasNoTags && (
        <Card className="rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-transparent dark:from-purple-950/30 dark:via-pink-950/20 dark:to-transparent border-purple-200/50 dark:border-purple-800/50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="w-5 h-5 text-purple-500" />
              Why Use Categories?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Organize Tags</h4>
                  <p className="text-xs text-muted-foreground">
                    Group similar tags together for easier browsing
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center flex-shrink-0">
                  <FolderTree className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Create Hierarchy</h4>
                  <p className="text-xs text-muted-foreground">
                    Build a taxonomy that matches your workflow
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                  <GitBranch className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">Track Journeys</h4>
                  <p className="text-xs text-muted-foreground">
                    Categories can represent stages in customer lifecycle
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Manager - Only show when we have tags */}
      {!hasNoTags && <TagCategoryManager tags={tags} />}
    </div>
  );
}
