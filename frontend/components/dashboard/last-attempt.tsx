import { FC } from "react";

interface LastAttemptProps {
  scheme: string;
  timeTaken: string;
  score: number;
  scenario: string;
  customerProfile: string;
  feedback: string;
  completion: number;
}

export const LastAttempt: FC<LastAttemptProps> = ({
  scheme,
  timeTaken,
  score,
  scenario,
  customerProfile,
  feedback,
  completion,
}) => {
  return (
    <div className="bg-white p-6 rounded">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[20px] font-semibold">Last Attempt</h3>
        {/* <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">Completion</div>
          <div className="w-32 h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-[#0B6160] rounded-full"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="text-sm font-medium">{completion}%</div>
        </div> */}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Time Taken</div>
              <div className="text-[15px] font-medium">{timeTaken}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Scenario</div>
              <div className="text-[15px]">{scenario}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Feedback</div>
              <div className="text-[15px]">{feedback}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Score</div>
              <div className="text-[15px] font-medium">{score}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Customer Profile</div>
              <div className="text-[15px]">{customerProfile}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Scheme</div>
              <div className="text-[15px]">{scheme}</div>
            </div>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full bg-[#0B6160] text-white py-2.5 rounded font-medium hover:bg-[#095453] transition-colors">
        Continue Training
      </button>
    </div>
  );
};

export default LastAttempt;
