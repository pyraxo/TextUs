"use client";

import { useUpdateScenario } from "@/hooks/use-scenarios";
import { useUploads } from "@/hooks/use-uploads";
import { cn } from "@/lib/utils";
import { Scenario, ScenarioUpdate } from "@/types/scenario";
import { Bot, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FC, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [fileComboOpen, setFileComboOpen] = useState(false);

  const router = useRouter();
  const { data: uploads, loading: uploadsLoading } = useUploads();
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>(
    scenario.file_uploads?.map((f) => f.id) || []
  );

  useEffect(() => {
    const hasChanges =
      title !== scenario.name ||
      description !== (scenario.description || "") ||
      systemPrompt !== scenario.system_prompt ||
      JSON.stringify(selectedFileIds.sort()) !==
        JSON.stringify(
          (scenario.file_uploads?.map((f: any) => f.id) || []).sort()
        );

    setHasUnsavedChanges(hasChanges);
  }, [title, description, systemPrompt, selectedFileIds, scenario]);

  const { mutate: updateScenario, isPending } = useUpdateScenario();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title && description) {
      const updates: ScenarioUpdate = {
        name: title,
        description,
        system_prompt: systemPrompt || undefined,
        file_upload_ids: selectedFileIds,
      };

      updateScenario(
        { scenarioId: scenario.id, updates },
        {
          onSuccess: () => {
            console.log(`Save successful at ${Date.now()}, closing dialog.`);
            setHasUnsavedChanges(false);
            onOpenChange(false);
          },
          onError: (error) => {
            console.error(`Save failed at ${Date.now()}:`, error);
            toast.error(
              error instanceof Error
                ? error.message
                : "Failed to update scenario"
            );
          },
        }
      );
      console.log(`Save mutation initiated at ${Date.now()}.`);
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

          <div className="space-y-2">
            <Label>Assign Files</Label>
            <Popover open={fileComboOpen} onOpenChange={setFileComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedFileIds.length && "text-muted-foreground"
                  )}
                  disabled={uploadsLoading || isPending}
                >
                  {selectedFileIds.length === 0
                    ? "Select files..."
                    : (() => {
                        console.log("[Dialog Render] Scenario Prop:", scenario);
                        console.log(
                          "[Dialog Render] scenario.file_uploads:",
                          scenario.file_uploads
                        );
                        console.log(
                          "[Dialog Render] selectedFileIds State:",
                          selectedFileIds
                        );

                        // Use scenario.file_uploads for initial display if available
                        const initialFiles = scenario.file_uploads?.filter(
                          (f) => selectedFileIds.includes(f.id)
                        );

                        let names: string[] = [];
                        if (
                          initialFiles &&
                          initialFiles.length === selectedFileIds.length
                        ) {
                          // If initial data covers all selected IDs, use it
                          names = initialFiles.map((f) => f.file_name);
                        } else {
                          // Fallback to using the uploads list (might be empty initially)
                          names =
                            uploads
                              ?.filter((f) => selectedFileIds.includes(f.id))
                              .map((f) => f.file_name) || [];
                        }

                        console.log(
                          "[Dialog Render] Initial Files Used:",
                          initialFiles
                        );
                        console.log("[Dialog Render] Calculated Names:", names);

                        // Display logic remains the same
                        const joined = names.join(", ");
                        return joined.length > 40
                          ? `${joined.slice(0, 40)}... (${names.length} files)`
                          : joined;
                      })()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Search files..." />
                  <CommandList>
                    <CommandEmpty>No files found.</CommandEmpty>
                    <CommandGroup>
                      {uploads?.map((file) => (
                        <CommandItem
                          key={file.id}
                          onSelect={() => {
                            setSelectedFileIds((prev) =>
                              prev.includes(file.id)
                                ? prev.filter((id) => id !== file.id)
                                : [...prev, file.id]
                            );
                          }}
                          className={cn(
                            "cursor-pointer flex items-center justify-between",
                            selectedFileIds.includes(file.id) && "bg-accent"
                          )}
                        >
                          <span>{file.file_name}</span>
                          {selectedFileIds.includes(file.id) && (
                            <span className="ml-2 text-xs text-cpf-teal">
                              Selected
                            </span>
                          )}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <div className="text-xs text-gray-500 mt-1">
              {selectedFileIds.length === 0
                ? "No files assigned."
                : `Assigned: ${uploads
                    ?.filter((f) => selectedFileIds.includes(f.id))
                    .map((f) => f.file_name)
                    .join(", ")}`}
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full mt-2 bg-cpf-teal text-white"
            disabled={isPending || hasUnsavedChanges}
            onClick={() => router.push(`/admin/archetypes}`)}
          >
            <Bot size={20} />
            Manage Archetypes
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
