import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, LogOut, LogIn, Search, Filter, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '../../services/api';

interface MovementRecordState {
  date: string;
  exitTime: string;
  entryTime: string;
  duration: string;
  status: string;
}

export function ParentMovementHistory() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [movementHistory, setMovementHistory] = useState<MovementRecordState[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadMovementHistory = async () => {
      try {
        const profile = await api.get<any>('v1/auth/me');
        const studentId = profile?.studentProfile?.id ?? profile?.studentId ?? profile?.id;
        const records = studentId ? await api.get<any[]>(`v1/attendance/student/${studentId}`) : [];
        const attendanceRecords = Array.isArray(records) ? records : [];
        const mapped = attendanceRecords.map((record: any) => {
          const statusRaw = String(record?.status || 'PRESENT');
          const normalized = statusRaw.toLowerCase();

          const toTime = (v: unknown) => {
            if (!v) return '—';
            const d = new Date(v as any);
            if (!Number.isNaN(d.getTime())) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            return String(v);
          };

          return {
            date: record?.date
              ? new Date(record?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—',
            exitTime: toTime(record?.exitTime ?? record?.exit ?? record?.outTime),
            entryTime: toTime(record?.entryTime ?? record?.entry ?? record?.inTime),
            duration: record?.duration ? String(record.duration) : '—',
            status: normalized === 'present' ? 'Completed' : normalized === 'absent' ? 'Absent' : 'Leave',
          };
        });

        if (isMounted) {
          setMovementHistory(mapped);
        }
      } catch {
        if (isMounted) {
          setMovementHistory([]);
        }
      }
    };

    void loadMovementHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHistory = useMemo(() => movementHistory.filter((record) => record.date.toLowerCase().includes(searchQuery.toLowerCase())), [movementHistory, searchQuery]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3 mb-4">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Movement History</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60" size={18} />
            <Input
              placeholder="Search by date..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/60 backdrop-blur-sm"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-3 gap-3 mb-6">
              <Card className="bg-blue-50 border-blue-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1">{movementHistory.length}</p>
                  <p className="text-xs text-muted-foreground">Total Days</p>
                </div>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1">{movementHistory.filter((record) => record.status === 'Completed').length}</p>
                  <p className="text-xs text-muted-foreground">Regular</p>
                </div>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1">{movementHistory.filter((record) => record.status === 'Leave').length}</p>
                  <p className="text-xs text-muted-foreground">Leave</p>
                </div>
              </Card>
            </div>

            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base">Recent Movements</h3>
              <button className="flex items-center space-x-2 text-primary text-sm">
                <Filter size={16} />
                <span>Filter</span>
              </button>
            </div>

            <div className="space-y-3">
              {filteredHistory.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No movement records found.</div>
              ) : filteredHistory.map((record, index) => (
                <Card key={index} className="bg-card border-border">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm">{record.date}</p>
                      <Badge className={`text-xs ${
                        record.status === 'Completed' ? 'bg-green-500' : 'bg-amber-500'
                      } text-white`}>
                        {record.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                            <LogOut className="text-orange-600" size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Exit Time</p>
                            <p className="text-sm">{record.exitTime}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <LogIn className="text-green-600" size={16} />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Entry Time</p>
                            <p className="text-sm">{record.entryTime}</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Clock className="text-muted-foreground" size={14} />
                          <p className="text-xs text-muted-foreground">Duration</p>
                        </div>
                        <p className="text-sm">{record.duration}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
