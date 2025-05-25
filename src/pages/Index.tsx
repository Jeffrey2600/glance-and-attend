
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Clock, Users, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface AttendanceRecord {
  id: string;
  name: string;
  time: string;
  confidence: number;
}

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Mock data - replace with actual API calls
  const { data: todaysAttendance = [] } = useQuery({
    queryKey: ['todays-attendance'],
    queryFn: async (): Promise<AttendanceRecord[]> => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/attendance/today');
      // return response.json();
      
      // Mock data for demo
      return [
        { id: '1', name: 'Alice Johnson', time: '08:15:30', confidence: 0.95 },
        { id: '2', name: 'Bob Smith', time: '08:22:45', confidence: 0.92 },
        { id: '3', name: 'Carol Williams', time: '08:28:12', confidence: 0.88 },
        { id: '4', name: 'David Brown', time: '08:35:07', confidence: 0.96 },
        { id: '5', name: 'Emma Davis', time: '08:41:23', confidence: 0.94 },
      ];
    },
    refetchInterval: 5000, // Refetch every 5 seconds for live updates
  });

  const { data: latestRecognition } = useQuery({
    queryKey: ['latest-recognition'],
    queryFn: async (): Promise<AttendanceRecord | null> => {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/attendance/latest');
      // return response.json();
      
      // Mock data for demo
      return todaysAttendance[todaysAttendance.length - 1] || null;
    },
    refetchInterval: 2000, // Check for updates every 2 seconds
  });

  const todayDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const currentTimeString = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Live Dashboard</h1>
            <p className="text-gray-600">{todayDate}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-blue-600">
            {currentTimeString}
          </div>
          <p className="text-sm text-gray-500">Current Time</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">
              Total Present Today
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{todaysAttendance.length}</div>
            <p className="text-xs text-blue-600">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">
              Recognition Accuracy
            </CardTitle>
            <Calendar className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">94.2%</div>
            <p className="text-xs text-green-600">
              Average confidence
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">
              Last Check-in
            </CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {latestRecognition ? latestRecognition.time : '--:--:--'}
            </div>
            <p className="text-xs text-purple-600">
              {latestRecognition ? latestRecognition.name : 'No recent activity'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Live Recognition */}
      {latestRecognition && (
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-900">
              <User className="w-5 h-5" />
              Latest Recognition
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="bg-emerald-100 text-emerald-700 text-lg">
                  {latestRecognition.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {latestRecognition.name}
                </h3>
                <p className="text-gray-600">Recognized at {latestRecognition.time}</p>
              </div>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {Math.round(latestRecognition.confidence * 100)}% confidence
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Attendance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Today's Attendance ({todaysAttendance.length} students)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {todaysAttendance.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No attendance records yet today</p>
              </div>
            ) : (
              todaysAttendance
                .sort((a, b) => b.time.localeCompare(a.time))
                .map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {record.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-gray-900">{record.name}</p>
                        <p className="text-sm text-gray-500">Check-in time: {record.time}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(record.confidence * 100)}%
                    </Badge>
                  </div>
                ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;
