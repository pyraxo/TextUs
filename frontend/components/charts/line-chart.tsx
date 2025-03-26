const data = [
  { scheme: "Clarity", value: 45 },
  { scheme: "Relevance", value: 65 },
  { scheme: "Information", value: 75 },
  { scheme: "Elaboration", value: 85 },
  { scheme: "Timeliness", value: 90 },
  { scheme: "Solution", value: 95 },
];

export function LineChart() {
  const maxValue = Math.max(...data.map((d) => d.value));
  const minValue = Math.min(...data.map((d) => d.value));

  // SVG dimensions
  const width = 600;
  const height = 300;
  const padding = 40;

  // Scales
  const xScale = (width - padding * 2) / (data.length - 1);
  const yScale = (height - padding * 2) / (maxValue - minValue);

  // Generate path
  const points = data.map((d, i) => {
    const x = padding + i * xScale;
    const y = height - padding - (d.value - minValue) * yScale;
    return `${x},${y}`;
  });

  const pathData = `M ${points.join(" L ")}`;

  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full"
        style={{ maxHeight: "100%" }}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((tick) => {
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
            key={d.scheme}
            x={padding + i * xScale}
            y={height - padding + 20}
            textAnchor="middle"
            className="text-xs fill-emerald-100/50"
          >
            {d.scheme}
          </text>
        ))}

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={d.scheme}
            cx={padding + i * xScale}
            cy={height - padding - (d.value - minValue) * yScale}
            r="4"
            className="fill-emerald-400"
          />
        ))}

        {/* Gradient definition */}
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#2dd4bf" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
