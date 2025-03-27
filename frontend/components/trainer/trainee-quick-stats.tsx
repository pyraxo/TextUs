import Link from "next/link";
import { FC } from "react";

interface TraineeQuickStatsProps {
  trainee: {
    name: string;
    chatsCompleted: number;
    chatsTrend: string;
    averageScore: string;
    scoreTrend: string;
    schemesCompleted: number;
    schemesTrend: string;
    feedback: string;
  };
}

export const TraineeQuickStats: FC<TraineeQuickStatsProps> = ({ trainee }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow overflow-hidden h-full">
      <div className="p-4">
        <h2 className="text-xl font-bold text-[#0B6160] text-center mb-3">
          {trainee.name}
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-2xl font-bold text-[#0B6160]">
              {trainee.chatsCompleted}
            </p>
            <p className="text-sm font-semibold text-black">Chats Completed</p>
            <p className="text-[10px] text-gray-500">{trainee.chatsTrend}</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-[#0B6160]">
              {trainee.averageScore}
            </p>
            <p className="text-sm font-semibold text-black">Average Score</p>
            <p className="text-[10px] text-gray-500">{trainee.scoreTrend}</p>
          </div>

          <div>
            <p className="text-2xl font-bold text-[#0B6160]">
              {trainee.schemesCompleted}
            </p>
            <p className="text-sm font-semibold text-black">
              Schemes Completed
            </p>
            <p className="text-[10px] text-gray-500">{trainee.schemesTrend}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="text-sm font-semibold mb-1">General Feedback</h3>
          <p className="text-xs text-gray-600 line-clamp-3">
            {trainee.feedback}
          </p>
        </div>

        <div className="mt-4">
          <Link
            href={`/trainer/trainees/${trainee.name.toLowerCase()}`}
            className="w-full block bg-[#0B6160] text-white py-2 px-2 rounded text-xs font-bold text-center hover:bg-[#094a49] transition-colors"
          >
            Manage Trainee
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TraineeQuickStats;
