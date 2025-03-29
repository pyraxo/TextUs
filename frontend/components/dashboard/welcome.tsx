import { FC } from "react";

interface WelcomeProps {
  userName: string | null | undefined;
  lastLoginDate: string;
  lastLoginTime: string;
  isLoading?: boolean;
}

export const Welcome: FC<WelcomeProps> = ({
  userName,
  lastLoginDate,
  lastLoginTime,
  isLoading = false,
}) => {
  if (isLoading || !userName) {
    return (
      <div className={`py-4 rounded-lg animate-pulse`}>
        <div className="h-8 bg-muted rounded-md w-2/5 mb-2"></div>
        <div className="h-4 bg-muted rounded-md w-3/5"></div>
      </div>
    );
  }

  return (
    <div className={`py-4 rounded-lg`}>
      <h1 className="text-[28px] leading-tight font-bold">
        Welcome back, {userName}!
      </h1>
    </div>
  );
};

export default Welcome;
