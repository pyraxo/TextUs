"use client";

import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

// This type is used to define the shape of our data.
export type ScenarioTableItem = {
  id: string;
  name: string;
  description?: string;
  status: "pending" | "completed";
  dateCompleted?: string;
  score?: number;
  metrics?: {
    duration_seconds?: number;
    total_messages: number;
    user_messages: number;
    bot_messages: number;
    conversations: number;
    avg_response_time?: number;
    completion_rate: number;
  };
  isActiveScenario?: boolean;
  activeScenarioExists?: boolean;
};

type ColumnProps = {
  onStart?: (id: string) => void;
  onRetry?: (id: string) => void;
  isStarting?: string | null;
};

export const getPendingColumns = ({
  onStart,
  isStarting,
}: ColumnProps): ColumnDef<ScenarioTableItem>[] => [
  {
    accessorKey: "name",
    header: "Scenario",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const scenario = row.original;

      // Determine if button should be disabled
      // Button is disabled if:
      // 1. This scenario is starting
      // 2. This scenario is not active but there is an active scenario somewhere else
      const hasActiveScenario = scenario.isActiveScenario === true;
      const isDisabled =
        isStarting === scenario.id || // Disable while starting
        (!hasActiveScenario && scenario.activeScenarioExists); // Disable non-active if ANY scenario is active

      return (
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => onStart?.(scenario.id)}
        >
          {isStarting === scenario.id
            ? "Starting..."
            : hasActiveScenario
            ? "Resume"
            : "Start Now"}
        </Button>
      );
    },
  },
];

export const getCompletedColumns = ({
  onRetry,
}: ColumnProps): ColumnDef<ScenarioTableItem>[] => [
  {
    accessorKey: "name",
    header: "Scenario",
    cell: ({ row }) => {
      const description = row.original.description;
      return (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          {description && (
            <div className="text-sm text-muted-foreground">{description}</div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "dateCompleted",
    header: "Completed",
    cell: ({ row }) => {
      const date = row.getValue("dateCompleted") as string;
      return date ? format(new Date(date), "PPP") : "-";
    },
  },
  {
    accessorKey: "metrics",
    header: "Score",
    cell: ({ row }) => {
      const metrics = row.original.metrics;
      if (!metrics) return "-";
      return `${Math.round(metrics.completion_rate * 100)}%`;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const scenario = row.original;
      return (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRetry?.(scenario.id)}
        >
          Retry
        </Button>
      );
    },
  },
];
