import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, TrendingUp, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { api } from '../../services/api';

interface AttendanceSummaryState {
  todayStatus: string;
  percentage: number;
  monthlyPresent: number;
  monthlyAbsent: number;
  monthlyLateEntries: number;
  trend: string;
}

interface AttendanceRecordState {
  date: string;
  status: string;
  entry: string;
  exit: string;
}

export function ParentAttendance() {
  const navigate = useNavigate();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [attendanceData, setAttendanceData] = useState<AttendanceSummaryState>({
    todayStatus: 'Loading...',
    percentage: 0,
    monthlyPresent: 0,
    monthlyAbsent: 0,
    monthlyLateEntries: 0,
    trend: '0%',
  });
  const [monthlyAttendance, setMonthlyAttendance] = useState<AttendanceRecordState[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAttendance = async () => {
      try {
        const profile = await api.get<any>('v1/auth/me');
        const studentId = profile?.studentProfile?.id ?? profile?.studentId ?? profile?.id;
        const attendanceRecords = studentId
          ? await api.get<any[]>(`v1/attendance/student/${studentId}`)
          : [];
        const records = Array.isArray(attendanceRecords) ? attendanceRecords : [];
        const todayString = new Date().toISOString().slice(0, 10);
        const todayRecord = records.find((record: any) => String(record?.date || '').slice(0, 10) === todayString);
        const latestRecord = records[0] ?? records[records.length - 1];

        const getStatus = (record: any) => {
          if (!record) return 'No data';
          const status = String(record.status || '').toUpperCase();
          if (status === 'PRESENT') return 'Present';
          if (status === 'ABSENT') return 'Absent';
          if (status === 'ON_LEAVE') return 'Leave';
          return 'No data';
        };

        const filteredMonthRecords = records.filter((record: any) => {
          const date = record?.date ? new Date(record.date) : null;
          if (!date || Number.isNaN(date.getTime())) return false;
          const now = new Date();
          return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
        });

        const monthlyPresent = filteredMonthRecords.reduce((sum: number, record: any) => sum + (String(record?.status || '').toUpperCase() === 'PRESENT' ? 1 : 0), 0);
        const monthlyAbsent = filteredMonthRecords.reduce((sum: number, record: any) => sum + (String(record?.status || '').toUpperCase() === 'ABSENT' ? 1 : 0), 0);
        const monthlyLateEntries = filteredMonthRecords.reduce((sum: number, record: any) => sum + (String(record?.status || '').toUpperCase() === 'ON_LEAVE' ? 1 : 0), 0);
        const totalMonth = monthlyPresent + monthlyAbsent + monthlyLateEntries;
        const percentage = totalMonth ? Math.round((monthlyPresent / totalMonth) * 100) : 0;
        const trendValue = percentage ? `${percentage >= 100 ? '+' : ''}${percentage - 100}` : '0%';

        const nextAttendanceData = {
          todayStatus: getStatus(todayRecord ?? latestRecord),
          percentage,
          monthlyPresent,
          monthlyAbsent,
          monthlyLateEntries,
          trend: trendValue,
        };

        const mappedRecords = records.slice(0, 8).map((record: any) => ({
          date: new Date(record?.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
          status: getStatus(record),
          entry: '—',
          exit: '—',
        }));

        if (isMounted) {
          setAttendanceData(nextAttendanceData);
          setMonthlyAttendance(mappedRecords);
        }
      } catch {
        if (isMounted) {
          setAttendanceData({
            todayStatus: 'Unavailable',
            percentage: 0,
            monthlyPresent: 0,
            monthlyAbsent: 0,
            monthlyLateEntries: 0,
            trend: '0%',
          });
          setMonthlyAttendance([]);
        }
      }
    };

    void loadAttendance();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile App Container */}
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/parent')}
                className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
              >
                <ArrowLeft className="text-white" size={20} />
              </button>
              <h1 className="text-white text-lg">Attendance Tracking</h1>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Today's Status */}
          <div className="px-6 py-6 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base">Today's Status</h2>
              <Badge className={attendanceData.todayStatus === 'Present' ? 'bg-green-500 text-white' : attendanceData.todayStatus === 'Absent' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}>
                {attendanceData.todayStatus === 'Present' ? <CheckCircle2 size={12} className="mr-1" /> : attendanceData.todayStatus === 'Absent' ? <XCircle size={12} className="mr-1" /> : <Clock size={12} className="mr-1" />}
                {attendanceData.todayStatus}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {new Date().toLocaleDateString('en-US', { weekday: 'long' })}</p>
          </div>

          {/* Attendance Stats */}
          <div className="px-6 py-6">
            <Card className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] border-0 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Overall Attendance</p>
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl">{attendanceData.percentage}%</span>
                      <Badge className="bg-white/20 text-white text-xs">
                        <TrendingUp size={10} className="mr-1" />
                        {attendanceData.trend}
                      </Badge>
                    </div>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <Calendar className="text-white" size={32} />
                  </div>
                </div>
                <Progress value={attendanceData.percentage} className="h-2 bg-white/20" />
              </div>
            </Card>
          </div>

          {/* Monthly Summary */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">This Month Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-green-50 border-green-200">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="text-white" size={24} />
                  </div>
                  <p className="text-2xl mb-1">{attendanceData.monthlyPresent}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <XCircle className="text-white" size={24} />
                  </div>
                  <p className="text-2xl mb-1">{attendanceData.monthlyAbsent}</p>
                  <p className="text-xs text-muted-foreground">Absent</p>
                </div>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <div className="p-4 text-center">
                  <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-2">
                    <Clock className="text-white" size={24} />
                  </div>
                  <p className="text-2xl mb-1">{attendanceData.monthlyLateEntries}</p>
                  <p className="text-xs text-muted-foreground">Late</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Attendance Calendar */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Attendance Calendar</h3>
            <Card className="bg-card border-border">
              <div className="p-4">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-xl"
                />
              </div>
            </Card>
          </div>

          {/* Recent Attendance */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Recent Attendance</h3>
            <Card className="bg-card border-border">
              <div className="divide-y divide-border">
                {monthlyAttendance.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">No attendance records found.</div>
                ) : monthlyAttendance.map((record, index) => (
                  <div key={index} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          record.status === 'Present' ? 'bg-green-100' :
                          record.status === 'Absent' ? 'bg-red-100' :
                          'bg-amber-100'
                        }`}>
                          {record.status === 'Present' ? (
                            <CheckCircle2 className="text-green-600" size={20} />
                          ) : record.status === 'Absent' ? (
                            <XCircle className="text-red-600" size={20} />
                          ) : (
                            <Clock className="text-amber-600" size={20} />
                          )}
                        </div>
                        <div>
                          <p className="text-sm mb-1">{record.date}</p>
                          <Badge className={`text-xs ${
                            record.status === 'Present' ? 'bg-green-500' :
                            record.status === 'Absent' ? 'bg-red-500' :
                            'bg-amber-500'
                          } text-white`}>
                            {record.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground mb-1">Entry: {record.entry}</p>
                        <p className="text-xs text-muted-foreground">Exit: {record.exit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
