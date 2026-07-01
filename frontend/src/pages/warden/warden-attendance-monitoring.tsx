import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Download, UserCheck, UserX, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';

export function WardenAttendanceMonitoring() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });

  useEffect(() => {
    let isMounted = true;

    const loadAttendanceSummary = async () => {
      try {
        const { data } = await apiClient.get('/v1/attendance/summary');
        const payload = data?.data ?? data ?? {};
        const summary = payload?.monthly ?? payload?.hostel ?? {};
        const present = Number(summary?.present ?? 0);
        const absent = Number(summary?.absent ?? 0);
        const late = Number(summary?.late ?? 0);
        const total = Number(summary?.total ?? present + absent + late);

        if (isMounted) {
          setStats({ present, absent, late, total });
        }
      } catch {
        if (isMounted) {
          setStats({ present: 0, absent: 0, late: 0, total: 0 });
        }
      }
    };

    loadAttendanceSummary();
    return () => {
      isMounted = false;
    };
  }, []);

  const presentRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm">
                <ArrowLeft className="text-white" size={20} />
              </button>
              <h1 className="text-white text-lg">Attendance Monitoring</h1>
            </div>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={async () => {
              try {
                const now = new Date();
                const month = now.getMonth() + 1;
                const year = now.getFullYear();
                const { data } = await apiClient.get('/v1/attendance/summary', { params: { month, year } });
                const payload = data?.data ?? data ?? {};
                const daily = Array.isArray(payload?.daily) ? payload.daily : [];
                const summary = payload?.monthly ?? payload?.hostel ?? {};
                const { attendanceSummaryToCsv } = await import('./attendance.utils');
                const csv = attendanceSummaryToCsv(daily, summary);
                const { downloadCSV } = await import('../../utils/download');
                downloadCSV(`attendance-summary-${year}-${String(month).padStart(2,'0')}.csv`, csv);
              } catch (e) {
                // noop
              }
            }}>
              <Download size={16} className="mr-1" />
              Export
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white mb-6">
            <div className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white/80 text-sm mb-1">Present Rate</p>
                  <p className="text-4xl">{presentRate}%</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <UserCheck className="text-white" size={32} />
                </div>
              </div>
              <Progress value={presentRate} className="h-2 bg-white/20 mb-2" />
              <p className="text-white/80 text-xs">{stats.present} out of {stats.total} students present</p>
            </div>
          </Card>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <Card className="bg-green-50 border-green-200">
              <div className="p-4 text-center">
                <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <UserCheck className="text-white" size={20} />
                </div>
                <p className="text-2xl mb-1">{stats.present}</p>
                <p className="text-xs text-muted-foreground">Present</p>
              </div>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <div className="p-4 text-center">
                <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <UserX className="text-white" size={20} />
                </div>
                <p className="text-2xl mb-1">{stats.absent}</p>
                <p className="text-xs text-muted-foreground">Absent</p>
              </div>
            </Card>
            <Card className="bg-amber-50 border-amber-200">
              <div className="p-4 text-center">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Clock className="text-white" size={20} />
                </div>
                <p className="text-2xl mb-1">{stats.late}</p>
                <p className="text-xs text-muted-foreground">Late</p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
