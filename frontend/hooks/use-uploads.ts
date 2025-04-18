import { getUploads } from "@/lib/api/uploads";
import { useCallback, useEffect, useState } from "react";

export function useUploads() {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUploads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const uploads = await getUploads();
      setData(uploads);
    } catch (e: any) {
      setError(e.message || "Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUploads();
  }, [fetchUploads]);

  return { data, loading, error, refresh: fetchUploads };
} 