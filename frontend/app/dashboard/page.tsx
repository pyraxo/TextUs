"use client";

import { LastAttempt } from "../../components/dashboard/last-attempt";
import { Leaderboard } from "../../components/dashboard/leaderboard";
import { PerformanceMetrics } from "../../components/dashboard/performance-metrics";
import { Welcome } from "../../components/dashboard/welcome";

// Mock data for demonstration
const performanceData = {
  metrics: {
    comprehension: 85,
    tone: 92,
    accuracy: 78,
    averageScore: 85,
  },
  average: 85,
};

const lastAttemptData = {
  scheme: "Customer Service Excellence",
  timeTaken: "45 minutes",
  score: 85,
  scenario: "Handling a difficult customer complaint",
  customerProfile: "Frustrated Premium Customer",
  feedback: "Good handling of the situation with clear communication",
  completion: 90,
};

const leaderboardEntries = [
  { name: "John Smith", schemes: 12, score: 95 },
  { name: "Sarah Johnson", schemes: 10, score: 92 },
  { name: "Michael Brown", schemes: 8, score: 88 },
  { name: "Emily Davis", schemes: 7, score: 85 },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <main className="container mx-auto px-6 py-8">
        <Welcome
          userName="John"
          lastLoginDate="12 March 2024"
          lastLoginTime="09:30 AM"
        />

        <div className="mt-6">
          <PerformanceMetrics metrics={performanceData.metrics} />
        </div>

        <div className="grid grid-cols-2 gap-6 mt-6">
          <div className="space-y-6">
            {/* <Assignments newAssignments={2} /> */}
            <LastAttempt {...lastAttemptData} />
          </div>
          <Leaderboard entries={leaderboardEntries} />
        </div>

        <div className="grid grid-cols-3 gap-6 mt-6">
          <div className="bg-white p-6 rounded">
            <h3 className="text-[20px] font-semibold mb-2">
              Total Practice Sessions
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#0B6160]">24</span>
              <span className="text-sm text-gray-600 ml-2">sessions</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded">
            <h3 className="text-[20px] font-semibold mb-2">
              Schemes Progression
            </h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#0B6160]">8/12</span>
              <span className="text-sm text-gray-600 ml-2">completed</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded">
            <h3 className="text-[20px] font-semibold mb-2">Average Score</h3>
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-[#0B6160]">85%</span>
              <span className="text-sm text-gray-600 ml-2">overall</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
