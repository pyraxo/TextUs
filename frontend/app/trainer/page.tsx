"use client";

import GraphAnalysis from "@/components/trainer/graph-analysis";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/hooks/use-auth";
import { useToast } from "@/lib/hooks/use-toast";
import { User, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { Welcome } from "../../components/dashboard/welcome";
import { RecentActivity } from "../../components/trainer/recent-activity";
import { TrainerLeaderboard } from "../../components/trainer/trainer-leaderboard";

// Mock data for demonstration
const traineesData = [
  {
    name: "Bton",
    chatsCompleted: 67,
    chatsTrend: "+10% from last week",
    averageScore: "78%",
    scoreTrend: "+15% from last week",
    schemesCompleted: 215,
    schemesTrend: "+5% from last week",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis.",
  },
  {
    name: "Aron",
    chatsCompleted: 70,
    chatsTrend: "+10% from last week",
    averageScore: "68%",
    scoreTrend: "+15% from last week",
    schemesCompleted: 412,
    schemesTrend: "+5% from last week",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis.",
  },
  {
    name: "Halle",
    chatsCompleted: 20,
    chatsTrend: "+10% from last week",
    averageScore: "65%",
    scoreTrend: "+15% from last week",
    schemesCompleted: 201,
    schemesTrend: "+5% from last week",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis.",
  },
  {
    name: "Matt",
    chatsCompleted: 115,
    chatsTrend: "+10% from last week",
    averageScore: "80%",
    scoreTrend: "+15% from last week",
    schemesCompleted: 502,
    schemesTrend: "+5% from last week",
    feedback:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis.",
  },
];

const graphData = {
  title: "Questions Completed by Scheme",
  schemes: [
    "Housing",
    "Nomination",
    "Investments",
    "Retirement",
    "Eldershield",
    "Education",
  ],
  values: [25, 50, 62, 50, 100, 0],
};

const activityData = [
  {
    trainee: "Bton",
    activity: "completed [Question] from the Housing scheme",
    time: "4:45pm",
  },
  {
    trainee: "Bton",
    activity: "completed [Question] from the Housing scheme",
    time: "3:15pm",
  },
  {
    trainee: "Bton",
    activity: "completed [Question] from the Housing scheme",
    time: "5h ago",
  },
  {
    trainee: "Bton",
    activity: "completed [Question] from the Housing scheme",
    time: "7h ago",
  },
  {
    trainee: "Bton",
    activity: "completed [Question] from the Housing scheme",
    time: "19/3/25",
  },
];

const leaderboardData = [
  { name: "Aaron", schemes: "321/600", score: "92%" },
  { name: "Jahnvi", schemes: "465/600", score: "85%" },
  { name: "Wanwei", schemes: "205/600", score: "83%" },
  { name: "Yihe", schemes: "466/600", score: "79%" },
  { name: "Sun ZY", schemes: "512/600", score: "75%" },
  { name: "Nora", schemes: "165/600", score: "72%" },
  { name: "Brighton", schemes: "171/600", score: "72%" },
  { name: "Agatha", schemes: "303/600", score: "68%" },
  { name: "Lance", schemes: "255/600", score: "65%" },
  { name: "Lorelei", schemes: "56/600", score: "61%" },
];

export default function TrainerDashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto p-6">
        <Welcome
          userName={user?.name}
          lastLoginDate="16 Mar 2025"
          lastLoginTime="12:00pm"
          isLoading={!user}
        />

        {/* 4 trainee cards in a single row */}
        {/* <div className="grid grid-cols-4 gap-4 mb-6 mt-6">
          {traineesData.map((trainee, index) => (
            <TraineeQuickStats key={index} trainee={trainee} />
          ))}
        </div> */}

        <div className="grid grid-cols-2 gap-6 mt-8">
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="bg-cpf-teal text-primary-foreground flex items-center gap-2"
                onClick={() => router.push("/trainer/trainees")}
              >
                <Users size={18} />
                View Trainees
              </Button>
              <Button
                variant="outline"
                className="bg-cpf-teal text-primary-foreground flex items-center gap-2"
                onClick={() => {}}
              >
                <User size={18} />
                Customer Profiles
              </Button>
            </div>
            <RecentActivity activities={activityData} />
          </div>

          <div className="flex flex-col gap-6">
            <GraphAnalysis data={graphData} />
            <TrainerLeaderboard entries={leaderboardData} />
          </div>
        </div>
      </main>
    </div>
  );
}
