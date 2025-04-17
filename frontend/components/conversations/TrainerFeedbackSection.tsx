import { useUpdateTrainerFeedback } from "@/hooks/use-scenario-sessions";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrainerFeedbackInput } from "./TrainerFeedbackInput";

interface TrainerFeedbackSectionProps {
  conversationId: string;
  sessionId: string;
  user: { id: string } | null;
  initialFeedback: string;
  onFeedbackSaved?: (feedback: string) => void;
}

export function TrainerFeedbackSection({
  conversationId,
  sessionId,
  user,
  initialFeedback,
  onFeedbackSaved,
}: TrainerFeedbackSectionProps) {
  const [feedback, setFeedback] = useState(initialFeedback || "");
  const { mutate: saveFeedback, isPending: isSavingFeedback } =
    useUpdateTrainerFeedback();

  // Keep local state in sync if initialFeedback changes (e.g., conversation switch)
  useEffect(() => {
    setFeedback(initialFeedback || "");
  }, [initialFeedback, conversationId]);

  const handleSaveFeedback = () => {
    if (!user?.id || !sessionId || !conversationId) return;
    saveFeedback(
      {
        conversationId,
        content: feedback,
      },
      {
        onSuccess: () => {
          toast.success("Feedback saved");
          if (onFeedbackSaved) onFeedbackSaved(feedback);
        },
        onError: () => {
          toast.error("Failed to save feedback");
        },
      }
    );
  };

  return (
    <TrainerFeedbackInput
      isSaving={isSavingFeedback}
      feedback={feedback}
      setFeedback={setFeedback}
      onSave={handleSaveFeedback}
      disabled={isSavingFeedback}
      canEdit={true}
      initialFeedback={initialFeedback}
    />
  );
}
