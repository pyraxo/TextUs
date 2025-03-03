interface CircularProgressProps {
  value: number;
  label: string;
}

export default function CircularProgress({
  value,
  label,
}: CircularProgressProps) {
  // Calculate the circumference of the circle
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(value * circumference) / 100} ${circumference}`;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="white"
            stroke="#d9d9d9"
            strokeWidth="10"
          />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="#0b6160"
            strokeWidth="10"
            strokeDasharray={strokeDasharray}
            strokeDashoffset="0"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-sm mt-2">{label}</span>
    </div>
  );
}
