import { Tags } from "lucide-react";

export function LoadingScreen() {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-16 w-16 animate-ping rounded-full bg-primary/20"></div>
            </div>
            <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 shadow-lg">
              <Tags className="h-8 w-8 text-primary-foreground animate-pulse" />
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            TagBase
          </h2>
          <p className="text-sm text-muted-foreground">Loading your workspace...</p>
        </div>
      </div>
    </div>
  );
}
