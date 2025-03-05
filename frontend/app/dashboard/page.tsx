"use client";

import CircularProgress from "@/components/circular-progress";
import PracticeTable from "@/components/practice-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useSidebar } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// Define valid tab values
const VALID_TABS = ["overview", "practice", "schemes"];

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(
    tabParam && VALID_TABS.includes(tabParam) ? tabParam : "overview"
  );
  const { state, setOpen } = useSidebar();

  // Update the URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    const params = new URLSearchParams(searchParams);
    params.set("tab", value);
    router.push(`/dashboard?${params.toString()}`, { scroll: false });
  };

  // Sync tab state with URL on initial load and URL changes
  // Also handle invalid tab parameters
  useEffect(() => {
    if (tabParam) {
      if (VALID_TABS.includes(tabParam)) {
        // Valid tab parameter
        if (tabParam !== activeTab) {
          setActiveTab(tabParam);
        }
      } else {
        // Invalid tab parameter, redirect to overview
        const params = new URLSearchParams(searchParams);
        params.set("tab", "overview");
        router.replace(`/dashboard?${params.toString()}`, { scroll: false });
      }
    } else if (activeTab !== "overview") {
      // No tab parameter, set to overview
      setActiveTab("overview");
    }
  }, [tabParam, activeTab, router, searchParams]);

  return (
    <div className="container mx-auto py-6 space-y-8 pl-4 pr-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Welcome, Brighton</h1>
        <Button variant="outline">View Profile</Button>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="schemes">Schemes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Practice Sessions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last week
                </p>
                <Progress value={75} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Average Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">72%</div>
                <p className="text-xs text-muted-foreground">
                  +4% from last week
                </p>
                <Progress value={72} className="h-1 mt-2" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Schemes Mastered
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3/5</div>
                <p className="text-xs text-muted-foreground">60% complete</p>
                <Progress value={60} className="h-1 mt-2" />
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      Average Scores
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">
                        All
                      </span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <CircularProgress value={25} label="Comprehension" />
                  <CircularProgress value={60} label="Tone" />
                  <CircularProgress value={90} label="Accuracy" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Recent Practice</CardTitle>
                <Link href="/practice" className="text-sm text-primary">
                  View all
                </Link>
              </CardHeader>
              <CardContent>
                <PracticeTable />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="practice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Practice Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-4">
                  <CircularProgress value={25} label="Comprehension" />
                  <CircularProgress value={60} label="Tone" />
                  <CircularProgress value={90} label="Accuracy" />
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Recent Practice Sessions</h3>
                  <PracticeTable showRecommended={true} />
                </div>

                <div className="flex justify-center">
                  <Button className="bg-primary hover:bg-primary/90">
                    Start New Practice
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schemes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheme Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: "Account Information", progress: 65 },
                  { title: "Dependent Protection Scheme", progress: 40 },
                  { title: "Education", progress: 75 },
                  { title: "ElderShield & CareShield Life", progress: 90 },
                  { title: "Employer Services & Agencies", progress: 50 },
                ].map((scheme) => (
                  <Card key={scheme.title} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="bg-muted h-32 flex items-center justify-center">
                        <div className="text-primary text-lg font-medium">
                          {scheme.title.split(" ")[0]}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-medium text-sm mb-2">
                          {scheme.title}
                        </h3>
                        <div className="flex items-center justify-between text-xs">
                          <span>Core Scenarios: 8</span>
                          <span className="text-primary">
                            {scheme.progress}%
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
