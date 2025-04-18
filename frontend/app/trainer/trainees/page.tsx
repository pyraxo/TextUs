"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUserScenarioSessions } from "@/hooks/use-scenario-sessions";
import { useUsers } from "@/hooks/use-users";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// Session details pages are located at /trainer/trainees/[traineeId]/sessions/[sessionId]/page.tsx

const SemiCircleGauge = ({
  value,
  label,
  color,
}: {
  value: number;
  label: string;
  color: string;
}) => {
  // Calculate the path for a perfect semicircle
  const width = 120;
  const height = 60;
  const strokeWidth = 10;

  // Calculate the arc path
  // Start from the left end, draw a semicircle to the right end
  const radius = (width - strokeWidth) / 2;
  const arcPath = `M ${strokeWidth / 2},${height} A ${radius},${radius} 0 0 1 ${
    width - strokeWidth / 2
  },${height}`;

  // Calculate the length of the path for the progress indicator
  const pathLength = Math.PI * radius;
  const progressLength = pathLength * (value / 100);

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width, height }}>
        <svg width={width} height={height}>
          {/* Background arc */}
          <path
            d={arcPath}
            stroke="#F5F5F5"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={arcPath}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={pathLength - progressLength}
            style={{
              transition: "stroke-dashoffset 0.5s ease",
            }}
          />
        </svg>
        {/* Position text inside the semicircle */}
        <div
          className="absolute inset-0 flex flex-col items-center"
          style={{ paddingTop: "30px" }}
        >
          <span className="text-[28px] font-semibold leading-none">
            {value}%
          </span>
        </div>
      </div>
      <span className="text-sm text-card-foreground mt-1">{label}</span>
    </div>
  );
};

export default function ManageTrainees() {
  const router = useRouter();
  // Fetch trainees
  const { data: users, isLoading: isUsersLoading } = useUsers();

  // Default to first trainee (after data loads)
  const [selectedTrainee, setSelectedTrainee] = useState<string | undefined>(
    undefined
  );

  // Set default selected trainee when data loads
  useEffect(() => {
    if (!selectedTrainee && users && users.length > 0) {
      setSelectedTrainee(users[0].id);
    }
  }, [users, selectedTrainee]);

  // Fetch sessions for selected trainee
  const { data: sessions, isLoading: isSessionsLoading } =
    useUserScenarioSessions(selectedTrainee);

  // Find selected trainee object
  const trainee = useMemo(
    () => users?.find((t) => t.id === selectedTrainee),
    [users, selectedTrainee]
  );

  // Aggregate metrics for sidebar (simple average for demo)
  const metrics = useMemo(() => {
    if (!sessions || sessions.length === 0) return null;
    // Example: average score, chats completed, etc.
    const completedSessions = sessions.filter((s) => s.end_timestamp);
    const averageScore =
      completedSessions.length > 0
        ? Math.round(
            completedSessions.reduce(
              (sum, s) => sum + (s.metrics?.completion_rate || 0) * 100,
              0
            ) / completedSessions.length
          )
        : 0;
    return {
      scenariosAttempted: sessions.length,
      averageScore,
      scenariosCompleted: completedSessions.length, // or another metric if available
      // You can add more metrics here if needed
    };
  }, [sessions]);

  const handleTraineeChange = (value: string) => {
    setSelectedTrainee(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header content area */}
      <div className="bg-cpf-light-teal pt-8 pb-8">
        <div className="container mx-auto">
          {/* Main heading */}
          <h1 className="text-3xl font-bold mb-2">Manage Trainees</h1>
          {/* Subheading */}
          <h2 className="text-sm">
            Monitor, evaluate, and support the progress of your assigned
            trainees
          </h2>
        </div>
      </div>
      <main className="container mx-auto p-6">
        <Card className="p-6 rounded-xl shadow-md border-0">
          <div className="grid grid-cols-[300px,1fr] gap-8">
            <div
              className="border-r pr-8 flex flex-col h-full"
              style={{ minHeight: "500px" }}
            >
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-teal-700">
                    {trainee?.name || "Select a trainee"}
                  </h2>
                  {/* Optionally show last active if available */}
                </div>
                <div className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold">
                      {metrics?.scenariosCompleted ?? "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scenarios Completed
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-teal-700">
                      {metrics?.averageScore ?? "-"}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold">
                      {metrics?.scenariosAttempted ?? "-"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Scenarios Attempted
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-8">
                <div className="mb-2 text-sm font-semibold text-muted-foreground">
                  Select Trainee
                </div>
                <Select
                  value={selectedTrainee}
                  onValueChange={handleTraineeChange}
                  disabled={isUsersLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a trainee" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {users?.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="text-lg font-semibold mb-2">
                  Average Metrics
                </div>
              </div>
              {/* Placeholder metrics gauges - real data to be implemented in backend */}
              <div className="flex justify-between mb-8 px-8">
                <SemiCircleGauge
                  value={0} // Placeholder
                  label="Comprehension"
                  color="#4F46E5"
                />
                <SemiCircleGauge
                  value={0} // Placeholder
                  label="Tone"
                  color="#0D9488"
                />
                <SemiCircleGauge
                  value={0} // Placeholder
                  label="Accuracy"
                  color="#0D9488"
                />
                <SemiCircleGauge
                  value={0} // Placeholder
                  label="Chat Handling"
                  color="#0D9488"
                />
                {/* Divider and Average Score */}
                <div className="flex items-center">
                  {/* Vertical Divider with Avatar */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-1 h-16 bg-cpf-teal rounded-full" />
                  </div>
                  {/* Average Score */}
                  <div className="ml-8 flex flex-col items-start">
                    <span className="text-4xl font-extrabold text-cpf-teal leading-none">
                      {metrics?.averageScore ?? "-"}%
                    </span>
                    <span className="text-md font-medium text-foreground">
                      Average Score
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-8">
                <div className="bg-card rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Completed Sessions
                  </h3>
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Date Completed</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isSessionsLoading ? (
                          <TableRow>
                            <TableCell colSpan={4}>Loading...</TableCell>
                          </TableRow>
                        ) : sessions && sessions.length > 0 ? (
                          sessions
                            .filter((s) => s.end_timestamp)
                            .map((session) => (
                              <TableRow key={session.id}>
                                <TableCell className="pr-4">
                                  {session.scenario?.name ||
                                    session.scenario_id}
                                </TableCell>
                                <TableCell>
                                  {session.end_timestamp
                                    ? new Date(
                                        session.end_timestamp
                                      ).toLocaleString(undefined, {
                                        year: "numeric",
                                        month: "2-digit",
                                        day: "2-digit",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {session.metrics?.score !== undefined
                                    ? `${Math.round(
                                        (session.metrics.score / 5) * 100
                                      )}%`
                                    : "-"}
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="link"
                                    className="p-0"
                                    onClick={() =>
                                      router.push(
                                        `/trainer/trainees/${selectedTrainee}/sessions/${session.id}`
                                      )
                                    }
                                  >
                                    Create/Edit
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4}>
                              No completed sessions found.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
