
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Search, Edit, Trash2, Filter, Download, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AttendanceRecord {
  id: string;
  name: string;
  date: string;
  time: string;
  confidence: number;
}

const AttendanceManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [editForm, setEditForm] = useState({ name: '', time: '' });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attendance data
  const { data: attendanceRecords = [], isLoading } = useQuery({
    queryKey: ['attendance-records', selectedDate, searchTerm],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      // TODO: Replace with actual API call
      // const params = new URLSearchParams();
      // if (selectedDate) params.append('date', format(selectedDate, 'yyyy-MM-dd'));
      // if (searchTerm) params.append('search', searchTerm);
      // const response = await fetch(`/api/attendance?${params}`);
      // return response.json();
      
      // Mock data for demo
      const mockData: AttendanceRecord[] = [
        { id: '1', name: 'Alice Johnson', date: '2024-01-15', time: '08:15:30', confidence: 0.95 },
        { id: '2', name: 'Bob Smith', date: '2024-01-15', time: '08:22:45', confidence: 0.92 },
        { id: '3', name: 'Carol Williams', date: '2024-01-15', time: '08:28:12', confidence: 0.88 },
        { id: '4', name: 'David Brown', date: '2024-01-14', time: '08:35:07', confidence: 0.96 },
        { id: '5', name: 'Emma Davis', date: '2024-01-14', time: '08:41:23', confidence: 0.94 },
        { id: '6', name: 'Frank Wilson', date: '2024-01-13', time: '08:18:56', confidence: 0.89 },
      ];

      let filteredData = mockData;

      if (selectedDate) {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        filteredData = filteredData.filter(record => record.date === dateStr);
      }

      if (searchTerm) {
        filteredData = filteredData.filter(record => 
          record.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      return filteredData.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
    },
  });

  // Update attendance record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({ id, name, time }: { id: string; name: string; time: string }) => {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/attendance/${id}`, {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name, time })
      // });
      // return response.json();
      
      // Mock success for demo
      return { id, name, time };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      setEditingRecord(null);
      toast({
        title: "Record updated",
        description: "Attendance record has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update attendance record. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete attendance record mutation
  const deleteRecordMutation = useMutation({
    mutationFn: async (id: string) => {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/attendance/${id}`, {
      //   method: 'DELETE'
      // });
      // return response.json();
      
      // Mock success for demo
      return { id };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-records'] });
      toast({
        title: "Record deleted",
        description: "Attendance record has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete attendance record. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (record: AttendanceRecord) => {
    setEditingRecord(record);
    setEditForm({ name: record.name, time: record.time });
  };

  const handleSaveEdit = () => {
    if (editingRecord) {
      updateRecordMutation.mutate({
        id: editingRecord.id,
        name: editForm.name,
        time: editForm.time,
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteRecordMutation.mutate(id);
  };

  const handleExport = () => {
    // TODO: Implement CSV export
    const csvData = attendanceRecords.map(record => 
      `${record.name},${record.date},${record.time},${Math.round(record.confidence * 100)}%`
    ).join('\n');
    
    const header = 'Name,Date,Time,Confidence\n';
    const blob = new Blob([header + csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    
    toast({
      title: "Export successful",
      description: "Attendance data has been exported to CSV.",
    });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDate(undefined);
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="text-gray-600">Manage and review attendance records</p>
          </div>
        </div>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="sm:w-48">
              <Label>Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Attendance Records ({attendanceRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading attendance records...</p>
            </div>
          ) : attendanceRecords.length === 0 ? (
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                No attendance records found for the selected filters.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Confidence</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-mono">{record.time}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={record.confidence >= 0.9 ? "default" : "secondary"}
                          className={record.confidence >= 0.9 ? "bg-green-100 text-green-800" : ""}
                        >
                          {Math.round(record.confidence * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEdit(record)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Attendance Record</DialogTitle>
                                <DialogDescription>
                                  Update the attendance information for this student.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-name" className="text-right">
                                    Name
                                  </Label>
                                  <Input
                                    id="edit-name"
                                    value={editForm.name}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="col-span-3"
                                  />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                  <Label htmlFor="edit-time" className="text-right">
                                    Time
                                  </Label>
                                  <Input
                                    id="edit-time"
                                    value={editForm.time}
                                    onChange={(e) => setEditForm(prev => ({ ...prev, time: e.target.value }))}
                                    className="col-span-3"
                                    placeholder="HH:MM:SS"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button 
                                  type="submit" 
                                  onClick={handleSaveEdit}
                                  disabled={updateRecordMutation.isPending}
                                >
                                  {updateRecordMutation.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Attendance Record</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the attendance record for {record.name} on {format(new Date(record.date), 'MMM dd, yyyy')} at {record.time}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(record.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                  disabled={deleteRecordMutation.isPending}
                                >
                                  {deleteRecordMutation.isPending ? 'Deleting...' : 'Delete'}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceManagement;
