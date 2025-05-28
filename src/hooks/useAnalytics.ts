
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/services/api';

export const useAnalytics = () => {
  const statsQuery = useQuery({
    queryKey: ['analytics', 'stats'],
    queryFn: () => apiClient.getAttendanceStats(),
  });

  const trendsQuery = useQuery({
    queryKey: ['analytics', 'trends'],
    queryFn: () => apiClient.getAttendanceTrends(7),
  });

  return {
    stats: statsQuery.data,
    trends: trendsQuery.data,
    isLoading: statsQuery.isLoading || trendsQuery.isLoading,
    error: statsQuery.error || trendsQuery.error,
  };
};
