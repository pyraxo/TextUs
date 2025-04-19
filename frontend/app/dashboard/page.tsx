"use client";

import { LastAttempt } from "@/components/dashboard/last-attempt";
import { Leaderboard } from "@/components/dashboard/leaderboard";
import { PerformanceMetrics } from "@/components/dashboard/performance-metrics";
import { Welcome } from "@/components/dashboard/welcome";
import { useAuth } from "@/hooks/use-auth";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  // Fallbacks for missing data
  const metrics = data?.metrics || {
    comprehension: 0,
    tone: 0,
    accuracy: 0,
    averageScore: 0,
    chat_handling: 0,
  };
  const lastAttempt = data?.latest_attempt || null;
  const totalPracticeSessions = data?.total_practice_sessions || 0;
  const scenarioProgression = data?.scenario_progression || 0;

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-6 py-8">
        <Welcome
          userName={user?.name || null}
          lastLoginDate={
            user?.last_login
              ? new Date(user.last_login).toLocaleDateString()
              : ""
          }
          lastLoginTime={
            user?.last_login
              ? new Date(user.last_login).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""
          }
        />

        <div className="mt-6">
          <PerformanceMetrics metrics={metrics} />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            {/* <Assignments newAssignments={2} /> */}
            {lastAttempt ? (
              <LastAttempt lastAttempt={lastAttempt} />
            ) : (
              <div className="bg-card text-card-foreground p-6 rounded min-h-[260px] flex items-center justify-center">
                No attempts yet.
              </div>
            )}
          </div>
          <Leaderboard />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="bg-card text-card-foreground p-6 rounded">
            <h3 className="text-[20px] font-semibold mb-2">
              Total Practice Sessions
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary">
                {totalPracticeSessions}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                sessions
              </span>
            </div>
          </div>

          <div className="bg-card text-card-foreground p-6 rounded">
            <h3 className="text-[20px] font-semibold mb-2">
              Scenario Progression
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-primary">
                {scenarioProgression}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                completed
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
