import { getDashboardSummary } from '@/lib/api/users';
import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';

export function useDashboardSummary() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setData(null);
      return;
    }
    setIsLoading(true);
    getDashboardSummary(user.id)
      .then((res) => {
        setData(res);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard summary');
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id]);

  return { data, isLoading, error };
} 