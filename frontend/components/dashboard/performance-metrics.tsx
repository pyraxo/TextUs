import { FC } from "react";

interface PerformanceMetricsProps {
  metrics: {
    comprehension: number;
    tone: number;
    accuracy: number;
    averageScore: number;
    chat_handling: number;
  };
}

const CircleProgress: FC<{ value: number; label: string }> = ({
  value,
  label,
}) => {
  const percentageValue = (value / 5) * 100;
  const size = 144; // w-36 = 9rem = 144px
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (percentageValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="hsl(var(--cpf-teal))"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">
            {percentageValue.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="mt-3 text-base font-medium">{label}</span>
    </div>
  );
};

export const PerformanceMetrics: FC<PerformanceMetricsProps> = ({
  metrics,
}) => {
  return (
    <div className="bg-card text-card-foreground rounded-lg shadow-sm p-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-24">
          <CircleProgress value={metrics.comprehension} label="Comprehension" />
          <CircleProgress value={metrics.tone} label="Tone" />
          <CircleProgress value={metrics.accuracy} label="Accuracy" />
          <CircleProgress value={metrics.chat_handling} label="Chat Handling" />
        </div>
        <div className="border-l pl-12">
          <div className="text-cpf-teal text-[56px] font-bold leading-tight">
            {(metrics.averageScore / 5) * 100}%
          </div>
          <div className="text-muted-foreground text-lg">Average Score</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
