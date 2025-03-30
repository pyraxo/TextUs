"use client";

import { useUpdateScenario } from "@/hooks/use-scenarios";
import { cn } from "@/lib/utils";
import { Scenario, ScenarioUpdate } from "@/types/scenario";
import { Bot, Loader2 } from "lucide-react";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

interface EditScenarioDialogProps {
  scenario: Scenario;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScenarioEdit?: (scenarioId: string, updates: ScenarioUpdate) => void;
}

export const EditScenarioDialog: FC<EditScenarioDialogProps> = ({
  scenario,
  open,
  onOpenChange,
  onScenarioEdit,
}) => {
  const [title, setTitle] = useState(scenario.name);
  const [description, setDescription] = useState(scenario.description || "");
  const [systemPrompt, setSystemPrompt] = useState<string | null>(
    scenario.system_prompt
  );
  const [temperature, setTemperature] = useState(
    scenario.temperature?.toString() || "0.7"
  );
  const [isPausable, setIsPausable] = useState(scenario.is_pausable);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Track unsaved changes
  useEffect(() => {
    const hasChanges =
      title !== scenario.name ||
      description !== (scenario.description || "") ||
      systemPrompt !== scenario.system_prompt ||
      temperature !== (scenario.temperature?.toString() || "0.7") ||
      isPausable !== scenario.is_pausable;

    setHasUnsavedChanges(hasChanges);
  }, [title, description, systemPrompt, temperature, isPausable, scenario]);

  const { mutate: updateScenario, isPending } = useUpdateScenario();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      const updates: ScenarioUpdate = {
        name: title,
        description,
        system_prompt: systemPrompt || undefined,
        temperature: parseFloat(temperature),
        is_pausable: isPausable,
      };

      updateScenario(
        { scenarioId: scenario.id, updates },
        {
          onSuccess: () => {
            setHasUnsavedChanges(false);
            onOpenChange(false);
          },
        }
      );
    }
  };

  const handleClose = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      // Let the dialog stay open if there are unsaved changes
      return;
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "sm:max-w-[500px]",
          hasUnsavedChanges && "border-red-500 border-2"
        )}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Edit Scenario</DialogTitle>
          <DialogDescription>
            Update the details of this training scenario.
            {hasUnsavedChanges && (
              <p className="text-red-500 mt-2 font-medium">
                You have unsaved changes
              </p>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Scenario Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter scenario title"
              required
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the scenario"
              required
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="systemPrompt">System Prompt</Label>
            <Textarea
              id="systemPrompt"
              value={systemPrompt || ""}
              onChange={(e) => setSystemPrompt(e.target.value || null)}
              placeholder="Enter system prompt for the AI"
              rows={4}
              disabled={isPending}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature</Label>
              <Input
                id="temperature"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="0.7"
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>Settings</Label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPausable}
                  onChange={(e) => setIsPausable(e.target.checked)}
                  className="form-checkbox h-4 w-4"
                  disabled={isPending}
                />
                <span className="text-sm">Allow Pausing</span>
              </label>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 bg-cpf-teal text-white"
            disabled={isPending || hasUnsavedChanges}
            onClick={() => {}}
          >
            <Bot size={20} />
            Manage Agents
          </Button>

          <DialogFooter className="pt-4">
            {hasUnsavedChanges ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-red-500 hover:text-red-600"
                disabled={isPending}
              >
                Discard Changes
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              className="bg-[#0B6160] hover:bg-[#094a49] text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
