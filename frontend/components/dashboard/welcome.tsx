import { FC } from "react";

interface WelcomeProps {
  userName: string;
  lastLoginDate: string;
  lastLoginTime: string;
}

export const Welcome: FC<WelcomeProps> = ({
  userName,
  lastLoginDate,
  lastLoginTime,
}) => {
  return (
    <div className="bg-[#F8F9FA] py-4">
      <h1 className="text-[28px] leading-tight font-bold">
        Welcome back, {userName}!
      </h1>
      <p className="text-[#6B7280] mt-1">
        Last login on {lastLoginDate} at {lastLoginTime}
      </p>
    </div>
  );
};

export default Welcome;
