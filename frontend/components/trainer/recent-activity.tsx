import { FC } from "react";

interface RecentActivityProps {
  activities: Array<{
    trainee: string;
    activity: string;
    time: string;
  }>;
}

export const RecentActivity: FC<RecentActivityProps> = ({ activities }) => {
  // Function to get the appropriate icon based on the time
  const getTimeIcon = (time: string) => {
    if (time.includes("pm") || time.includes("am")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    } else if (time.includes("ago")) {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
          />
        </svg>
      );
    } else {
      // Calendar icon for dates
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5 text-gray-700"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
          />
        </svg>
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-md p-6">
      <div className="flex items-center mb-4">
        <h3 className="text-xl font-bold">Recent Activity</h3>
      </div>

      <div className="space-y-6">
        {activities.map((activity, index) => (
          <div key={index} className="space-y-1">
            <div className="text-gray-500 text-xs">{activity.time}</div>
            <div className="flex items-start">
              <div className="mr-3 mt-0.5">{getTimeIcon(activity.time)}</div>
              <p>
                <span className="font-medium">{activity.trainee}</span> just
                completed [Question] from the{" "}
                <span className="text-[#0B6160]">Housing scheme</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;
