interface MetricGaugeProps {
  title: string;
  value: number;
  color: "emerald" | "teal" | "cyan";
}

const colorMap = {
  emerald: "stroke-emerald-500",
  teal: "stroke-teal-500",
  cyan: "stroke-cyan-500",
};

export function MetricGauge({ title, value, color }: MetricGaugeProps) {
  const circumference = 2 * Math.PI * 45; // r = 45
  const strokeDasharray = `${(value / 100) * circumference} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        {/* Background circle */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full transform -rotate-90"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            className="stroke-gray-800"
            strokeWidth="8"
          />
          {/* Progress circle */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="transparent"
            className={colorMap[color]}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">{value}%</span>
        </div>
      </div>
      <span className="mt-3 text-sm font-medium text-emerald-100/80">
        {title}
      </span>
    </div>
  );
}
