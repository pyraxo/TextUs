import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
export function TrainerFeedbackInput({
  feedback,
  setFeedback,
  onSave,
  disabled,
  canEdit,
  isSaving,
  initialFeedback,
}: {
  feedback: string;
  setFeedback: (val: string) => void;
  onSave: () => void;
  disabled: boolean;
  canEdit: boolean;
  isSaving: boolean;
  initialFeedback: string;
}) {
  const unchanged = feedback.trim() === initialFeedback.trim();
  return (
    <div className="border-t p-4">
      <div className="flex flex-col gap-2">
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Leave feedback for this conversation..."
          className="min-h-[80px]"
          disabled={!canEdit || disabled}
        />
        <Button
          onClick={onSave}
          disabled={
            !canEdit || disabled || !feedback.trim() || isSaving || unchanged
          }
        >
          {isSaving ? "Saving..." : "Save Feedback"}
        </Button>
      </div>
    </div>
  );
}
