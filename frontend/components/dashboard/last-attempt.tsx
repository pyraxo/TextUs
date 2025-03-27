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
    <div className="bg-card text-card-foreground p-6 rounded">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[20px] font-semibold">Last Attempt</h3>
        {/* <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Completion</div>
          <div className="w-32 h-2 bg-muted rounded-full">
            <div
              className="h-full bg-primary rounded-full"
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
              <div className="text-sm text-muted-foreground mb-1">
                Time Taken
              </div>
              <div className="text-[15px] font-medium">{timeTaken}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Scenario</div>
              <div className="text-[15px]">{scenario}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Feedback</div>
              <div className="text-[15px]">{feedback}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-[15px] font-medium">{score}%</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">
                Customer Profile
              </div>
              <div className="text-[15px]">{customerProfile}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Scheme</div>
              <div className="text-[15px]">{scheme}</div>
            </div>
          </div>
        </div>
      </div>

      <button className="mt-6 w-full bg-primary text-primary-foreground py-2.5 rounded font-medium hover:opacity-90 transition-colors">
        Continue Training
      </button>
    </div>
  );
};

export default LastAttempt;
