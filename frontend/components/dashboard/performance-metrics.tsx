import { FC } from "react";

interface PerformanceMetricsProps {
  metrics: {
    comprehension: number;
    tone: number;
    accuracy: number;
    averageScore: number;
  };
}

const CircleProgress: FC<{ value: number; label: string }> = ({
  value,
  label,
}) => {
  const size = 144; // w-36 = 9rem = 144px
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (value / 100) * circumference;

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
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#0B6160"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold">{value}%</span>
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
    <div className="bg-white rounded-lg shadow-sm p-8">
      <div className="flex items-center justify-between">
        <div className="flex gap-24">
          <CircleProgress value={metrics.comprehension} label="Comprehension" />
          <CircleProgress value={metrics.tone} label="Tone" />
          <CircleProgress value={metrics.accuracy} label="Accuracy" />
        </div>
        <div className="border-l border-[#E5E7EB] pl-12">
          <div className="text-[#0B6160] text-[56px] font-bold leading-tight">
            {metrics.averageScore}%
          </div>
          <div className="text-[#6B7280] text-lg">Average Score</div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;
