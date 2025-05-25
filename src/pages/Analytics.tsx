
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  TrendingUp, 
  Users, 
  Clock, 
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  dailyAttendance: Array<{ date: string; count: number; percentage: number }>;
  weeklyTrends: Array<{ week: string; attendance: number; target: number }>;
  timeDistribution: Array<{ timeSlot: string; count: number; percentage: number }>;
  studentStats: Array<{ name: string; totalDays: number; attendanceRate: number }>;
  summary: {
    totalStudents: number;
    averageAttendance: number;
    bestDay: string;
    worstDay: string;
    onTimePercentage: number;
  };
}

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "#3b82f6",
  },
  target: {
    label: "Target",
    color: "#10b981",
  },
  count: {
    label: "Count",
    color: "#8b5cf6",
  },
};

const Analytics = () => {
  const [dateRange, setDateRange] = useState<'week' | 'month' | '3months'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { toast } = useToast();

  // Fetch analytics data
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['analytics', dateRange, selectedDate],
    queryFn: async (): Promise<AnalyticsData> => {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/analytics?range=${dateRange}&date=${format(selectedDate, 'yyyy-MM-dd')}`);
      // return response.json();
      
      // Mock data for demo
      const mockData: AnalyticsData = {
        dailyAttendance: [
          { date: '2024-01-15', count: 28, percentage: 93.3 },
          { date: '2024-01-16', count: 25, percentage: 83.3 },
          { date: '2024-01-17', count: 30, percentage: 100 },
          { date: '2024-01-18', count: 27, percentage: 90 },
          { date: '2024-01-19', count: 29, percentage: 96.7 },
          { date: '2024-01-22', count: 26, percentage: 86.7 },
          { date: '2024-01-23', count: 31, percentage: 103.3 },
        ],
        weeklyTrends: [
          { week: 'Week 1', attendance: 85, target: 90 },
          { week: 'Week 2', attendance: 92, target: 90 },
          { week: 'Week 3', attendance: 88, target: 90 },
          { week: 'Week 4', attendance: 95, target: 90 },
        ],
        timeDistribution: [
          { timeSlot: '8:00-8:15', count: 45, percentage: 35 },
          { timeSlot: '8:15-8:30', count: 38, percentage: 30 },
          { timeSlot: '8:30-8:45', count: 25, percentage: 20 },
          { timeSlot: '8:45-9:00', count: 19, percentage: 15 },
        ],
        studentStats: [
          { name: 'Alice Johnson', totalDays: 23, attendanceRate: 95.8 },
          { name: 'Bob Smith', totalDays: 22, attendanceRate: 91.7 },
          { name: 'Carol Williams', totalDays: 21, attendanceRate: 87.5 },
          { name: 'David Brown', totalDays: 24, attendanceRate: 100 },
          { name: 'Emma Davis', totalDays: 23, attendanceRate: 95.8 },
        ],
        summary: {
          totalStudents: 30,
          averageAttendance: 92.1,
          bestDay: '2024-01-17',
          worstDay: '2024-01-16',
          onTimePercentage: 78.5,
        },
      };

      return mockData;
    },
  });

  const handleExportReport = () => {
    // TODO: Implement report export
    const reportData = {
      dateRange,
      selectedDate: format(selectedDate, 'yyyy-MM-dd'),
      summary: analyticsData?.summary,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    
    toast({
      title: "Report exported",
      description: "Analytics report has been downloaded successfully.",
    });
  };

  const pieColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <SidebarTrigger />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Attendance insights and trends</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2">
                <CalendarIcon className="w-4 h-4" />
                {format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportReport} className="bg-green-600 hover:bg-green-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-900">Total Students</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{analyticsData?.summary.totalStudents}</div>
            <p className="text-xs text-blue-600">Enrolled students</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-900">Avg Attendance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{analyticsData?.summary.averageAttendance}%</div>
            <p className="text-xs text-green-600">This {dateRange}</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-900">On-Time Rate</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{analyticsData?.summary.onTimePercentage}%</div>
            <p className="text-xs text-purple-600">Before 8:30 AM</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-900">Best Day</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {analyticsData?.summary.bestDay && format(new Date(analyticsData.summary.bestDay), 'MMM dd')}
            </div>
            <p className="text-xs text-orange-600">Highest attendance</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="distribution" className="gap-2">
            <PieChartIcon className="w-4 h-4" />
            Time Distribution
          </TabsTrigger>
          <TabsTrigger value="students" className="gap-2">
            <Users className="w-4 h-4" />
            Student Performance
          </TabsTrigger>
          <TabsTrigger value="weekly" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Weekly Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <LineChart data={analyticsData?.dailyAttendance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                  />
                  <YAxis />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="var(--color-attendance)" 
                    strokeWidth={2}
                    dot={{ fill: "var(--color-attendance)" }}
                  />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Arrival Time Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <PieChart>
                  <Pie
                    data={analyticsData?.timeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ timeSlot, percentage }) => `${timeSlot}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData?.timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Student Attendance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData?.studentStats.map((student, index) => (
                  <div key={student.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.totalDays} days attended</p>
                      </div>
                    </div>
                    <Badge 
                      variant={student.attendanceRate >= 95 ? "default" : "secondary"}
                      className={student.attendanceRate >= 95 ? "bg-green-100 text-green-800" : ""}
                    >
                      {student.attendanceRate}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Performance vs Target</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-80">
                <BarChart data={analyticsData?.weeklyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="attendance" fill="var(--color-attendance)" name="Actual" />
                  <Bar dataKey="target" fill="var(--color-target)" name="Target" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Analytics;
