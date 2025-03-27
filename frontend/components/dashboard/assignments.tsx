import { ChevronDown } from "lucide-react";
import { FC, useState } from "react";

interface AssignmentsProps {
  newAssignments: number;
}

export const Assignments: FC<AssignmentsProps> = ({ newAssignments }) => {
  const [newExpanded, setNewExpanded] = useState(false);
  const [existingExpanded, setExistingExpanded] = useState(false);

  return (
    <div className="space-y-1">
      {/* New assignments section */}
      <button
        onClick={() => setNewExpanded(!newExpanded)}
        className={`w-full flex items-center justify-between p-4 rounded transition-colors ${
          newAssignments > 0 ? "bg-[#0B6160] text-foreground" : "bg-foreground"
        }`}
      >
        <span className="font-medium text-[15px]">
          {newAssignments > 0
            ? `You have ${newAssignments} new assignment${
                newAssignments > 1 ? "s" : ""
              }!`
            : "View existing assignments"}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            newExpanded ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {newExpanded && (
        <div className="p-4 bg-foreground rounded mt-1 border border-[#E5E7EB]">
          {/* Assignment content would go here */}
        </div>
      )}

      {/* Existing assignments section */}
      <button
        onClick={() => setExistingExpanded(!existingExpanded)}
        className="w-full flex items-center justify-between p-4 bg-foreground rounded"
      >
        <span className="font-medium text-[15px]">
          View existing assignments
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${
            existingExpanded ? "transform rotate-180" : ""
          }`}
        />
      </button>
      {existingExpanded && (
        <div className="p-4 bg-foreground rounded mt-1 border border-[#E5E7EB]">
          {/* Existing assignments content would go here */}
        </div>
      )}
    </div>
  );
};

export default Assignments;
