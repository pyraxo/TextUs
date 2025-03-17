import { Medal } from "lucide-react";
import { FC } from "react";

interface LeaderboardEntry {
  name: string;
  schemes: number;
  score: number;
}

export const Leaderboard: FC<{ entries: LeaderboardEntry[] }> = ({
  entries,
}) => {
  return (
    <div className="bg-white p-6 rounded">
      <h3 className="text-[20px] font-semibold mb-4">Leaderboard</h3>

      <div className="flex justify-between mb-6">
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-yellow-500" />
          <span className="text-sm">Top Performer</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-blue-500" />
          <span className="text-sm">Rising Star</span>
        </div>
        <div className="flex items-center gap-2">
          <Medal className="w-6 h-6 text-green-500" />
          <span className="text-sm">Most Improved</span>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                Name
              </th>
              <th className="text-left py-2 px-4 text-sm font-medium text-gray-600">
                Schemes
              </th>
              <th className="text-right py-2 px-4 text-sm font-medium text-gray-600">
                Score
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry, index) => (
              <tr
                key={index}
                className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
              >
                <td className="py-2 px-4 text-[15px]">{entry.name}</td>
                <td className="py-2 px-4 text-[15px]">{entry.schemes}</td>
                <td className="py-2 px-4 text-[15px] text-right font-medium">
                  {entry.score}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
