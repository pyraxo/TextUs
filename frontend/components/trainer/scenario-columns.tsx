"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteScenario,
  useScenario,
  useUpdateScenario,
} from "@/hooks/use-scenarios";
import { Scenario, ScenarioUpdate } from "@/types/scenario";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Bot, Pencil, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { EditScenarioDialog } from "./edit-scenario-dialog";
import { ManageScenarioCustomersDialog } from "./manage-scenario-customers-dialog";

export type ScenarioTableItem = Scenario;

// Wrapper component to fetch full scenario data before rendering the dialog
const EditScenarioLoader: React.FC<{
  scenarioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenarioEdit: (scenarioId: string, updates: ScenarioUpdate) => void;
}> = ({ scenarioId, open, onOpenChange, onScenarioEdit }) => {
  const { data: scenario, isLoading, error } = useScenario(scenarioId);

  // Log hook state on every render
  console.log(
    `[EditScenarioLoader] ID: ${scenarioId}, isLoading: ${isLoading}, error: ${error}`
  );
  console.log(`[EditScenarioLoader] Scenario data from hook:`, scenario);

  if (isLoading) {
    console.log(
      "[EditScenarioLoader] Returning null because isLoading is true"
    );
    // Optional: Render a loading indicator within a Dialog structure
    // Or return null if the parent handles loading appearance
    return null;
  }

  if (error || !scenario) {
    // Handle error, maybe show a toast and close
    console.error("Failed to load scenario for editing:", error);
    toast.error("Failed to load scenario data.");
    onOpenChange(false); // Close if loading failed
    return null;
  }

  // Log the final scenario data before passing to dialog
  console.log(
    "[EditScenarioLoader] Rendering EditScenarioDialog with scenario:",
    scenario
  );

  return (
    <EditScenarioDialog
      scenario={scenario} // Pass the fully loaded scenario
      open={open}
      onOpenChange={onOpenChange}
      onScenarioEdit={onScenarioEdit}
    />
  );
};

export const getScenarioColumns = (): ColumnDef<ScenarioTableItem>[] => {
  const [editingScenarioId, setEditingScenarioId] = useState<string | null>(
    null
  );
  const [managingCustomersScenario, setManagingCustomersScenario] =
    useState<Scenario | null>(null);
  const [deletingScenario, setDeletingScenario] = useState<Scenario | null>(
    null
  );
  const { mutate: updateScenario, isPending: isUpdating } = useUpdateScenario();
  const { mutate: deleteScenario, isPending: isDeleting } = useDeleteScenario();

  const handleScenarioEdit = (scenarioId: string, updates: ScenarioUpdate) => {
    updateScenario(
      { scenarioId, updates },
      {
        onSuccess: () => {
          toast.success("Scenario updated successfully");
          setEditingScenarioId(null);
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Failed to update scenario"
          );
        },
      }
    );
  };

  const handleScenarioDelete = (scenarioId: string) => {
    deleteScenario(scenarioId, {
      onSuccess: () => {
        toast.success("Scenario deleted successfully");
        setDeletingScenario(null);
      },
      onError: (error) => {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete scenario"
        );
      },
    });
  };

  const isPending = isUpdating || isDeleting;

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
              onClick={() => setEditingScenarioId(row.original.id)}
              disabled={isPending}
            >
              <Pencil size={20} />
              Edit
            </Button>
            <Button
              variant="outline"
              className="mb-[-4px] mt-[-4px]"
              onClick={() => setManagingCustomersScenario(row.original)}
              disabled={isPending}
            >
              <Bot size={20} />
              AI
            </Button>
            <Button
              variant="outline"
              className="mb-[-4px] mt-[-4px] hover:bg-red-500 dark:hover:bg-red-500 hover:text-white"
              onClick={() => setDeletingScenario(row.original)}
              disabled={isPending}
            >
              <Trash size={20} />
            </Button>
          </div>

          {/* Render the loader component when an ID is set */}
          {editingScenarioId && (
            <EditScenarioLoader
              scenarioId={editingScenarioId}
              open={true}
              onOpenChange={(open) => !open && setEditingScenarioId(null)}
              onScenarioEdit={handleScenarioEdit}
            />
          )}

          {managingCustomersScenario && (
            <ManageScenarioCustomersDialog
              scenario={managingCustomersScenario}
              open={true}
              onOpenChange={(open) =>
                !open && setManagingCustomersScenario(null)
              }
            />
          )}

          <AlertDialog
            open={!!deletingScenario}
            onOpenChange={(open) => !open && setDeletingScenario(null)}
          >
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Scenario</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this scenario? This action
                  cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    deletingScenario &&
                    handleScenarioDelete(deletingScenario.id)
                  }
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      ),
    },
  ];
};
