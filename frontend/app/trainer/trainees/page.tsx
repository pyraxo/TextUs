"use client";

import { Card } from "@/components/ui/card";

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
            <div className="border-r pr-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-teal-700">Bton</h2>
                <p className="text-sm text-muted-foreground">
                  Last Active: {traineeData.lastActive}
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-bold">
                    {traineeData.chartsCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Chats Completed
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-bold text-teal-700">
                    {traineeData.averageScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Score
                  </div>
                </div>

                <div>
                  <div className="text-4xl font-bold">
                    {traineeData.schemasCompleted}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Schemes Completed
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <button className="w-full py-3 bg-teal-700 text-white rounded-md hover:bg-teal-800 transition-colors">
                  Assign Scenarios
                </button>
                <button className="w-full py-3 bg-teal-50 text-teal-700 rounded-md hover:bg-teal-100 transition-colors">
                  Send Reminder
                </button>
                <button className="w-full py-3 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition-colors">
                  Flag for Attention
                </button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-start mb-2">
                <div className="text-xl font-semibold">Performance Metrics</div>
                <div className="text-3xl font-bold text-teal-700">
                  {traineeData.averageScore}%
                </div>
              </div>

              <div className="flex justify-between mb-8 px-8">
                <SemiCircleGauge
                  value={traineeData.metrics.comprehension}
                  label="Comprehension"
                  color="#4F46E5"
                />
                <SemiCircleGauge
                  value={traineeData.metrics.tone}
                  label="Tone"
                  color="#0D9488"
                />
                <SemiCircleGauge
                  value={traineeData.metrics.accuracy}
                  label="Accuracy"
                  color="#0D9488"
                />
              </div>

              <div className="grid grid-cols-1 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    General Feedback
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {traineeData.generalFeedback}
                  </p>
                </div>

                <div className="bg-card rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Completed Scenarios
                  </h3>
                  <div className="overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-muted-foreground">
                          <th className="pb-3 font-medium">Scenario</th>
                          <th className="pb-3 font-medium">Date Completed</th>
                          <th className="pb-3 font-medium text-center">
                            Score
                          </th>
                          <th className="pb-3 font-medium">Feedback</th>
                          <th className="pb-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {traineeData.completedScenarios.map(
                          (scenario, index) => (
                            <tr
                              key={index}
                              className="border-t border-gray-100"
                            >
                              <td className="py-3 pr-4">{scenario.scenario}</td>
                              <td className="py-3">{scenario.dateCompleted}</td>
                              <td className="py-3 text-center">
                                {scenario.score}%
                              </td>
                              <td className="py-3">
                                <span
                                  className={
                                    scenario.feedback ===
                                    "View Trainer Feedback"
                                      ? "text-teal-600"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {scenario.feedback}
                                </span>
                              </td>
                              <td className="py-3">
                                <button className="text-teal-600 hover:text-teal-800">
                                  {scenario.action}
                                </button>
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
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
