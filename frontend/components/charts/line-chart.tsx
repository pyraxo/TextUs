interface MetricData {
  date: string;
  comprehension: number;
  tone: number;
  accuracy: number;
}

type MetricKey = "comprehension" | "tone" | "accuracy";

const data: MetricData[] = [
  {
    date: "Jan 5",
    comprehension: 65,
    tone: 72,
    accuracy: 68,
  },
  {
    date: "Jan 12",
    comprehension: 68,
    tone: 75,
    accuracy: 70,
  },
  {
    date: "Jan 19",
    comprehension: 72,
    tone: 78,
    accuracy: 75,
  },
  {
    date: "Jan 26",
    comprehension: 75,
    tone: 80,
    accuracy: 79,
  },
  {
    date: "Feb 2",
    comprehension: 80,
    tone: 83,
    accuracy: 85,
  },
  {
    date: "Feb 9",
    comprehension: 85,
    tone: 88,
    accuracy: 87,
  },
];

export function LineChart() {
  const maxValue = 100; // Performance metrics are percentages (0-100)
  const minValue = 0;

  // SVG dimensions
  const width = 600;
  const height = 300;
  const padding = 40;

  // Scales
  const xScale = (width - padding * 2) / (data.length - 1);
  const yScale = (height - padding * 2) / (maxValue - minValue);

  // Generate paths for each metric
  const generatePath = (metric: MetricKey) => {
    const points = data.map((d, i) => {
      const x = padding + i * xScale;
      const y = height - padding - (d[metric] - minValue) * yScale;
      return `${x},${y}`;
    });
    return `M ${points.join(" L ")}`;
  };

  const comprehensionPath = generatePath("comprehension");
  const tonePath = generatePath("tone");
  const accuracyPath = generatePath("accuracy");

  // Calculate y-axis ticks
  const yTicks = [0, 25, 50, 75, 100];

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        {/* Y-axis line */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={height - padding}
          stroke="#1a3333"
          strokeWidth="1"
        />

        {/* X-axis line */}
        <line
          x1={padding}
          y1={height - padding}
          x2={width - padding}
          y2={height - padding}
          stroke="#1a3333"
          strokeWidth="1"
        />

        {/* Grid lines */}
        {yTicks.map((tick) => {
          const y = height - padding - (tick - minValue) * yScale;
          return (
            <g key={tick}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#1a3333"
                strokeWidth="1"
              />
              <text
                x={padding - 10}
                y={y}
                textAnchor="end"
                alignmentBaseline="middle"
                className="text-xs fill-emerald-100/50"
              >
                {tick}%
              </text>
            </g>
          );
        })}

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={d.date}
            x={padding + i * xScale}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-emerald-100/50"
          >
            {d.date}
          </text>
        ))}

        {/* Lines for each metric */}
        <path
          d={comprehensionPath}
          fill="none"
          stroke="hsl(var(--cpf-teal))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        <path
          d={tonePath}
          fill="none"
          stroke="#4ade80"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="5,5"
        />

        <path
          d={accuracyPath}
          fill="none"
          stroke="#60a5fa"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points for each metric */}
        {data.map((d, i) => (
          <g key={`comprehension-${i}`}>
            <circle
              cx={padding + i * xScale}
              cy={height - padding - (d.comprehension - minValue) * yScale}
              r="4"
              fill="hsl(var(--cpf-teal))"
            />
            <circle
              cx={padding + i * xScale}
              cy={height - padding - (d.tone - minValue) * yScale}
              r="4"
              fill="#4ade80"
            />
            <circle
              cx={padding + i * xScale}
              cy={height - padding - (d.accuracy - minValue) * yScale}
              r="4"
              fill="#60a5fa"
            />
          </g>
        ))}

        {/* Legend */}
        <g transform={`translate(${width - padding - 150}, ${padding + 10})`}>
          <rect width="150" height="70" fill="rgba(0,0,0,0.2)" rx="4" />

          <line
            x1="10"
            y1="15"
            x2="30"
            y2="15"
            stroke="hsl(var(--cpf-teal))"
            strokeWidth="2"
          />
          <circle cx="20" cy="15" r="3" fill="hsl(var(--cpf-teal))" />
          <text x="40" y="19" className="text-xs fill-emerald-100">
            Comprehension
          </text>

          <line
            x1="10"
            y1="35"
            x2="30"
            y2="35"
            stroke="#4ade80"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          <circle cx="20" cy="35" r="3" fill="#4ade80" />
          <text x="40" y="39" className="text-xs fill-emerald-100">
            Tone
          </text>

          <line
            x1="10"
            y1="55"
            x2="30"
            y2="55"
            stroke="#60a5fa"
            strokeWidth="2"
          />
          <circle cx="20" cy="55" r="3" fill="#60a5fa" />
          <text x="40" y="59" className="text-xs fill-emerald-100">
            Accuracy
          </text>
        </g>

        {/* Title */}
        <text
          x={width / 2}
          y={padding / 2}
          textAnchor="middle"
          className="text-sm font-medium fill-emerald-100"
        >
          Performance Metrics Progress
        </text>
      </svg>
    </div>
  );
}
