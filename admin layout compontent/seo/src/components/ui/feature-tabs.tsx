import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Pointer, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TabContent {
  badge: string;
  title: string;
  description: string;
  buttonText: string;
  imageSrc: string;
  imageAlt: string;
}

interface Tab {
  value: string;
  icon: React.ReactNode;
  label: string;
  content: TabContent;
}

interface FeatureTabsProps {
  badge?: string;
  heading?: string;
  description?: string;
  tabs?: Tab[];
}

const FeatureTabs = ({
  badge = "Features",
  heading = "Powerful Tag Management",
  description = "Everything you need to manage tags in HubSpot",
  tabs = [
    {
      value: "tab-1",
      icon: <Zap className="h-auto w-4 shrink-0" />,
      label: "Quick Tagging",
      content: {
        badge: "Efficient Workflow",
        title: "Tag contacts in seconds",
        description:
          "Apply tags to your HubSpot contacts, companies, and deals instantly. Our intuitive interface makes tag management a breeze.",
        buttonText: "Get Started",
        imageSrc: "/feature-quick-tagging.png",
        imageAlt: "Quick tagging interface with colorful tags",
      },
    },
    {
      value: "tab-2",
      icon: <Pointer className="h-auto w-4 shrink-0" />,
      label: "Journey Tracking",
      content: {
        badge: "Visual Insights",
        title: "Visualize customer journeys",
        description:
          "Track and visualize how contacts move through your defined journeys. Get instant insights into your customer lifecycle.",
        buttonText: "Explore Journeys",
        imageSrc: "/feature-journey-visualization.png",
        imageAlt: "Customer journey Sankey diagram visualization",
      },
    },
    {
      value: "tab-3",
      icon: <Layout className="h-auto w-4 shrink-0" />,
      label: "Organized Categories",
      content: {
        badge: "Stay Organized",
        title: "Categorize with ease",
        description:
          "Create custom categories to organize your tags. Keep your HubSpot instance clean and manageable at scale.",
        buttonText: "View Categories",
        imageSrc: "/feature-categories.png",
        imageAlt: "Organized category folders with colorful tags",
      },
    },
  ],
}: FeatureTabsProps) => {
  return (
    <section className="py-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <Badge variant="outline">{badge}</Badge>
          <h2 className="max-w-2xl text-3xl font-semibold md:text-4xl">
            {heading}
          </h2>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Tabs defaultValue={tabs[0].value} className="mt-8">
          <TabsList className="flex flex-col items-center justify-center gap-4 sm:flex-row md:gap-6 bg-transparent h-auto p-0">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-muted-foreground data-[state=active]:bg-muted data-[state=active]:text-primary"
              >
                {tab.icon} {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="mx-auto mt-8 max-w-screen-xl rounded-2xl bg-muted/70 p-6 lg:p-16">
            {tabs.map((tab) => (
              <TabsContent
                key={tab.value}
                value={tab.value}
                className="grid place-items-center gap-20 lg:grid-cols-2 lg:gap-10"
              >
                <div className="flex flex-col gap-5">
                  <Badge variant="outline" className="w-fit bg-background">
                    {tab.content.badge}
                  </Badge>
                  <h3 className="text-3xl font-semibold lg:text-5xl">
                    {tab.content.title}
                  </h3>
                  <p className="text-muted-foreground lg:text-lg">
                    {tab.content.description}
                  </p>
                  <Button className="mt-2.5 w-fit gap-2" size="lg">
                    {tab.content.buttonText}
                  </Button>
                </div>
                <img
                  src={tab.content.imageSrc}
                  alt={tab.content.imageAlt}
                  className="rounded-xl shadow-lg"
                />
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </section>
  );
};

export { FeatureTabs };
