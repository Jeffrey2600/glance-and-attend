
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient, AttendanceRecord } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

export const useAttendance = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const attendanceQuery = useQuery({
    queryKey: ['attendance'],
    queryFn: () => apiClient.getAttendanceRecords(),
  });

  const todayAttendanceQuery = useQuery({
    queryKey: ['attendance', 'today'],
    queryFn: () => apiClient.getTodayAttendance(),
  });

  const deleteAttendanceMutation = useMutation({
    mutationFn: (id: number) => apiClient.deleteAttendanceRecord(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Success",
        description: "Attendance record deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete attendance record",
        variant: "destructive",
      });
    },
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<AttendanceRecord> }) =>
      apiClient.updateAttendanceRecord(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      toast({
        title: "Success",
        description: "Attendance record updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update attendance record",
        variant: "destructive",
      });
    },
  });

  return {
    attendance: attendanceQuery.data || [],
    todayAttendance: todayAttendanceQuery.data || [],
    isLoading: attendanceQuery.isLoading || todayAttendanceQuery.isLoading,
    error: attendanceQuery.error || todayAttendanceQuery.error,
    deleteAttendance: deleteAttendanceMutation.mutate,
    updateAttendance: updateAttendanceMutation.mutate,
    isDeleting: deleteAttendanceMutation.isPending,
    isUpdating: updateAttendanceMutation.isPending,
  };
};
