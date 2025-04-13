import { Skeleton } from "@/components/ui/skeleton";
import { FC } from "react";
interface WelcomeProps {
  userName: string | null | undefined;
  lastLoginDate: string;
  lastLoginTime: string;
  isLoading?: boolean;
}

export const Welcome: FC<WelcomeProps> = ({
  userName,
  // lastLoginDate,
  // lastLoginTime,
  isLoading = false,
}) => {
  return (
    <div className={`py-4 rounded-lg`}>
      {isLoading || !userName ? (
        <Skeleton className="h-8 w-2/5" />
      ) : (
        <h1 className="text-[28px] leading-tight font-bold">
          Welcome back, {userName}!
        </h1>
      )}
    </div>
  );
};

export default Welcome;
