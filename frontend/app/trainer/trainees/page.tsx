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
import { useState } from "react";

// Mock data
const traineeData = {
  name: "Bton",
  lastActive: "23 Mar 2023",
  chartsCompleted: 67,
  averageScore: 78,
  schemasCompleted: 215,
  metrics: {
    comprehension: 55,
    tone: 25,
    accuracy: 95,
    chatHandling: 85,
  },
  generalFeedback: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis. Curabitur luctus nisi, porttitor et finibus sit amet, ullamcorper et mauris. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed eget ultrices magna, vel semper nunc. Morbi eu lorem eu tortor tempor facilisis. Curabitur luctus nisi, porttitor et finibus sit amet, ullamcorper et mauris.`,
  completedScenarios: [
    {
      scenario: "Hello, can you hear me?",
      dateCompleted: "17 March 2025",
      score: 71,
      feedback: "No Feedback Available",
      action: "Retry",
    },
    {
      scenario: "I'm in California dreaming about who we used to be",
      dateCompleted: "17 March 2025",
      score: 85,
      feedback: "No Feedback Available",
      action: "Retry",
    },
    {
      scenario: "When we were younger and free",
      dateCompleted: "10 March 2025",
      score: 74,
      feedback: "No Feedback Available",
      action: "Retry",
    },
    {
      scenario: "I've forgotten how it felt before the world fell at our feet",
      dateCompleted: "9 March 2025",
      score: 69,
      feedback: "View Trainer Feedback",
      action: "Retry",
    },
    {
      scenario: "There's such a difference between us",
      dateCompleted: "8 March 2025",
      score: 65,
      feedback: "View Trainer Feedback",
      action: "Retry",
    },
    {
      scenario: "And a million miles",
      dateCompleted: "7 March 2025",
      score: 66,
      feedback: "View Trainer Feedback",
      action: "Retry",
    },
    {
      scenario: "Hello from the other side",
      dateCompleted: "6 March 2025",
      score: 67,
      feedback: "View Trainer Feedback",
      action: "Retry",
    },
  ],
};

// Mock list of trainees
const trainees = [
  { id: "bton", name: "Bton" },
  { id: "alice", name: "Alice" },
  { id: "john", name: "John" },
  { id: "sara", name: "Sara" },
];

// Mock data per trainee (in real app, fetch by id)
const traineeDataMap: Record<string, typeof traineeData> = {
  bton: traineeData,
  alice: {
    ...traineeData,
    name: "Alice",
    averageScore: 82,
    chartsCompleted: 70,
  },
  john: { ...traineeData, name: "John", averageScore: 75, chartsCompleted: 60 },
  sara: { ...traineeData, name: "Sara", averageScore: 90, chartsCompleted: 80 },
};

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
  // Default to first trainee
  const [selectedTrainee, setSelectedTrainee] = useState(trainees[0].id);
  const trainee =
    traineeDataMap[selectedTrainee] || traineeDataMap[trainees[0].id];

  const handleTraineeChange = (value: string) => {
    setSelectedTrainee(value);
    // In the future, fetch trainee data here if needed
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
                    {trainee.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Last Active: {trainee.lastActive}
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold">
                      {trainee.chartsCompleted}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Chats Completed
                    </div>
                  </div>

                  <div>
                    <div className="text-4xl font-bold text-teal-700">
                      {trainee.averageScore}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Average Score
                    </div>
                  </div>

                  <div>
                    <div className="text-4xl font-bold">
                      {trainee.schemasCompleted}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Schemes Completed
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
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {trainees.map((t) => (
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
                <div className="text-xl font-semibold mb-2">
                  Performance Metrics
                </div>
                {/* <div className="text-3xl font-bold text-teal-700">
                  {trainee.averageScore}%
                </div> */}
              </div>

              <div className="flex justify-between mb-8 px-8">
                <SemiCircleGauge
                  value={trainee.metrics.comprehension}
                  label="Comprehension"
                  color="#4F46E5"
                />
                <SemiCircleGauge
                  value={trainee.metrics.tone}
                  label="Tone"
                  color="#0D9488"
                />
                <SemiCircleGauge
                  value={trainee.metrics.accuracy}
                  label="Accuracy"
                  color="#0D9488"
                />
                <SemiCircleGauge
                  value={trainee.metrics.chatHandling}
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
                      {trainee.averageScore}%
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
                    Completed Scenarios
                  </h3>
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Scenario</TableHead>
                          <TableHead>Date Completed</TableHead>
                          <TableHead className="text-center">Score</TableHead>
                          <TableHead>Feedback</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trainee.completedScenarios.map((scenario, index) => (
                          <TableRow key={index}>
                            <TableCell className="pr-4">
                              {scenario.scenario}
                            </TableCell>
                            <TableCell>{scenario.dateCompleted}</TableCell>
                            <TableCell className="text-center">
                              {scenario.score}%
                            </TableCell>
                            <TableCell>
                              <Button variant="link" className="p-0">
                                Create/Edit
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
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
