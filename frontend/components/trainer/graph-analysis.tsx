import { FC } from "react";

interface GraphAnalysisProps {
  data: {
    title: string;
    schemes: string[];
    values: number[];
  };
}

export const GraphAnalysis: FC<GraphAnalysisProps> = ({ data }) => {
  const maxValue = Math.max(...data.values);
  const normalizedValues = data.values.map((value) =>
    maxValue > 0 ? (value / maxValue) * 100 : 0
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4">{data.title}</h3>

      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Scheme</span>
        <span className="text-sm font-medium">Questions</span>
      </div>

      <div className="space-y-6 mt-4">
        {data.schemes.map((scheme, index) => (
          <div key={index} className="relative">
            <div className="flex justify-between mb-1">
              <span className="text-xs text-gray-600">{scheme}</span>
              <span className="text-xs font-medium bg-[#0B6160] text-white px-2 py-0.5 rounded">
                {data.values[index]}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-[#0B6160] h-2 rounded-full"
                style={{ width: `${normalizedValues[index]}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-4 text-xs text-gray-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
};

export default GraphAnalysis;
