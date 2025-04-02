"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ActivitySquare } from "lucide-react";

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
      const scenario = row.original;
      const description = scenario.description;
      return (
        <div className="flex items-start gap-2">
          {scenario.isActiveScenario && (
            <ActivitySquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const scenario = row.original;

      // Determine if button should be disabled
      const hasActiveScenario = scenario.isActiveScenario === true;
      const isDisabled =
        isStarting === scenario.id || // Disable while starting
        (!hasActiveScenario && scenario.activeScenarioExists); // Disable non-active if ANY scenario is active

      const button = (
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => onStart?.(scenario.id)}
          className={hasActiveScenario ? "bg-primary/10" : ""}
        >
          {isStarting === scenario.id
            ? "Starting..."
            : hasActiveScenario
            ? "Resume"
            : "Start Now"}
        </Button>
      );

      if (isDisabled && !hasActiveScenario && scenario.activeScenarioExists) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>Complete your active scenario before starting a new one</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return button;
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
      const scenario = row.original;
      const description = scenario.description;
      return (
        <div className="flex items-start gap-2">
          {scenario.isActiveScenario && (
            <ActivitySquare className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-medium">{row.getValue("name")}</div>
            {description && (
              <div className="text-sm text-muted-foreground">{description}</div>
            )}
          </div>
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
      const isDisabled = scenario.activeScenarioExists;

      const button = (
        <Button
          variant="outline"
          size="sm"
          disabled={isDisabled}
          onClick={() => onRetry?.(scenario.id)}
        >
          Retry
        </Button>
      );

      if (isDisabled) {
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent>
                <p>Complete your active scenario before retrying this one</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      }

      return button;
    },
  },
];
