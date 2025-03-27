import { FC } from "react";

interface TrainerLeaderboardProps {
  entries: Array<{
    name: string;
    schemes: string;
    score: string;
  }>;
}

export const TrainerLeaderboard: FC<TrainerLeaderboardProps> = ({
  entries,
}) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow p-0 overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-[#0B6160] text-white">
            <th className="py-3 px-4 font-semibold">Name</th>
            <th className="py-3 px-4 font-semibold text-center">Schemes</th>
            <th className="py-3 px-4 font-semibold text-center">Scores</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {entries.map((entry, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="py-3 px-4 font-semibold">{entry.name}</td>
              <td className="py-3 px-4 text-center">{entry.schemes}</td>
              <td className="py-3 px-4 text-center">{entry.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrainerLeaderboard;
