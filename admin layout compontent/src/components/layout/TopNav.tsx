import { NavLink } from "@/components/NavLink";
import { Tags, CreditCard, Grid3X3, Clock, Database, Users, BarChart3, GitBranch, FolderTree, MousePointerClick, Link2, Sparkles } from "lucide-react";

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-8">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Tags className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">TagFlow</span>
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto">
          <NavLink
            to="/"
            end
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Tags className="w-4 h-4" />
              Tags
            </span>
          </NavLink>
          <NavLink
            to="/tagger"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Tagger Card
            </span>
          </NavLink>
          <NavLink
            to="/bulk"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Bulk Tagging
            </span>
          </NavLink>
          <NavLink
            to="/board"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Grid3X3 className="w-4 h-4" />
              Tag Board
            </span>
          </NavLink>
          <NavLink
            to="/timeline"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Timeline
            </span>
          </NavLink>
          <NavLink
            to="/dataset"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              Dataset
            </span>
          </NavLink>
          <NavLink
            to="/analytics"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </span>
          </NavLink>
          <NavLink
            to="/journey"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              Journey
            </span>
          </NavLink>
          <NavLink
            to="/categories"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <FolderTree className="w-4 h-4" />
              Categories
            </span>
          </NavLink>
          <NavLink
            to="/touchpoints"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4" />
              Touchpoints
            </span>
          </NavLink>
          <NavLink
            to="/associations"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Associations
            </span>
          </NavLink>
          <NavLink
            to="/recommendations"
            className="px-3 py-2 text-sm font-medium rounded-lg transition-colors text-muted-foreground hover:text-foreground hover:bg-accent whitespace-nowrap"
            activeClassName="text-foreground bg-accent"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Recommendations
            </span>
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
