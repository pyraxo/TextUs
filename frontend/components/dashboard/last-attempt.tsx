import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LatestAttemptResponse } from "@/types/user-scenario-session";
import { FC } from "react";

interface LastAttemptProps {
  lastAttempt: LatestAttemptResponse;
}

export const LastAttempt: FC<LastAttemptProps> = ({ lastAttempt }) => {
  const {
    score,
    time_taken: timeTaken,
    scenario_name: scenario,
    scheme_name: scheme,
  } = lastAttempt;
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between mb-0 pb-4">
        <CardTitle className="text-[20px] font-semibold">
          Last Attempt
        </CardTitle>
        {/* 
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">Completion</div>
          <div className="w-32 h-2 bg-muted rounded-full">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: `${completion}%` }}
            />
          </div>
          <div className="text-sm font-medium">{completion}%</div>
        </div> 
        */}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Time Taken
                </div>
                <div className="text-[15px] font-medium">
                  {(() => {
                    const minutes = Math.floor(timeTaken / 60);
                    const seconds = timeTaken % 60;
                    return `${minutes}m ${seconds}s`;
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  Scenario
                </div>
                <div className="text-[15px]">{scenario}</div>
              </div>
            </div>
          </div>
          <div>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Score</div>
                <div className="text-[15px] font-medium">
                  {((score / 5) * 100).toFixed(0)}%
                </div>
              </div>
              {/* <div>
                <div className="text-sm text-muted-foreground mb-1">Scheme</div>
                <div className="text-[15px]">{scheme}</div>
              </div> */}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full mt-0">Continue Training</Button>
      </CardFooter>
    </Card>
  );
};

export default LastAttempt;
