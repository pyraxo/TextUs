import { getRubrics, updateRubric } from "@/lib/api/rubrics";
import { useCallback, useEffect, useState } from "react";

export function useRubrics() {
  const [rubrics, setRubrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [updated, setUpdated] = useState(false);

  const fetchRubrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getRubrics();
      setRubrics(data);
    } catch (e: any) {
      setError(e.message || "Failed to fetch rubrics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  const saveRubricPrompt = async (metricKey: string, rubric_prompt: string) => {
    setSaving(true);
    setError(null);
    setUpdated(false);
    try {
      await updateRubric(metricKey, { rubric_prompt });
      setRubrics((prev) =>
        prev.map((r) =>
          r.id === metricKey ? { ...r, rubric_prompt } : r
        )
      );
      setUpdated(true);
    } catch (e: any) {
      setError(e.message || "Failed to update rubric");
    } finally {
      setSaving(false);
    }
  };

  return { rubrics, loading, error, saving, updated, fetchRubrics, saveRubricPrompt };
} 