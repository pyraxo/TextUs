"use client";

import { Button } from "@/components/ui/button";
import { useUpdateScenario } from "@/hooks/use-scenarios";
import { Scenario, ScenarioUpdate } from "@/types/scenario";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Bot, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditScenarioDialog } from "./edit-scenario-dialog";

export type ScenarioTableItem = Scenario;

export const getScenarioColumns = (): ColumnDef<ScenarioTableItem>[] => {
  const [editingScenario, setEditingScenario] =
    useState<ScenarioTableItem | null>(null);

  const { mutate: updateScenario, isPending } = useUpdateScenario();

  const handleScenarioEdit = (scenarioId: string, updates: ScenarioUpdate) => {
    updateScenario(
      { scenarioId, updates },
      {
        onSuccess: () => {
          toast.success("Scenario updated successfully");
          setEditingScenario(null);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to update scenario"
          );
        },
      }
    );
  };

  return [
    {
      accessorKey: "name",
      header: "Scenario Title",
      cell: ({ row }) => (
        <div>
          <div>{row.original.name}</div>
          {row.original.description && (
            <div className="text-sm text-muted-foreground">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created Date",
      cell: ({ row }) => format(new Date(row.original.created_at), "PPP"),
    },
    {
      id: "completion_rate",
      header: "Completion Rate",
      cell: () => <div className="text-center">-</div>,
    },
    {
      id: "avg_score",
      header: "Avg. Score",
      cell: () => <div className="text-center">-</div>,
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => (
        <>
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              className="mb-[-4px] mt-[-4px]"
              onClick={() => setEditingScenario(row.original)}
              disabled={isPending}
            >
              <Pencil size={20} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="mb-[-4px] mt-[-4px]"
              onClick={() => {}}
              disabled={isPending}
            >
              <Bot size={20} />
              Bots
            </Button>
            <Button variant="outline" className="mb-[-4px] mt-[-4px]">
              <Trash size={20} />
            </Button>
          </div>

          {editingScenario && (
            <EditScenarioDialog
              scenario={editingScenario}
              open={true}
              onOpenChange={(open) => !open && setEditingScenario(null)}
              onScenarioEdit={handleScenarioEdit}
            />
          )}
        </>
      ),
    },
  ];
};
