import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, MessageSquare, Download } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { apiClient } from '../../auth-integration/src/api/axiosInstance';
import { downloadCSV } from '../../utils/download';
import { absenteesRecordsToCsv } from './attendance.utils';

export function WardenAbsenteeList() {
  const navigate = useNavigate();
  const [absentees, setAbsentees] = useState<Array<{ name: string; room: string; lastExit: string; expectedReturn: string; reason: string; leaveStatus: string }>>([]);

  useEffect(() => {
    let isMounted = true;

    const loadAbsentStudents = async () => {
      try {
        const { data } = await apiClient.get('/v1/attendance/today');
        const payload = data?.data ?? data ?? [];
        const records = Array.isArray(payload) ? payload : [];

        const mapped = records
          .filter((record: any) => ['ABSENT', 'ON_LEAVE'].includes(String(record?.status ?? '').toUpperCase()))
          .map((record: any) => {
            const student = record?.student ?? {};
            const firstName = student?.firstName ?? '';
            const lastName = student?.lastName ?? '';
            const name = [firstName, lastName].filter(Boolean).join(' ').trim() || 'Student';
            const status = String(record?.status ?? '').toUpperCase();

            return {
              name,
              room: student?.roomNumber || student?.room || 'N/A',
              lastExit: record?.date ? new Date(record.date).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'N/A',
              expectedReturn: record?.remarks ? record.remarks : 'Pending',
              reason: status === 'ON_LEAVE' ? 'On Leave' : 'Absent',
              leaveStatus: status === 'ON_LEAVE' ? 'Leave' : 'Absent',
            };
          });

        if (isMounted) {
          setAbsentees(mapped);
        }
      } catch {
        if (isMounted) {
          setAbsentees([]);
        }
      }
    };

    loadAbsentStudents();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button>
              <h1 className="text-white text-lg">Absentee List</h1>
            </div>
            <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-white/30" onClick={async () => {
              try {
                const { data } = await apiClient.get('/v1/attendance/today');
                const payload = data?.data ?? data ?? [];
                const records = Array.isArray(payload) ? payload : [];
                const csv = absenteesRecordsToCsv(records);
                downloadCSV(`absentees-${new Date().toISOString().slice(0,10)}.csv`, csv);
              } catch (e) {
                // ignore
              }
            }}>
              <Download size={14} className="mr-1" />
              Export
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {absentees.map((a, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <p className="text-sm mb-2">{a.name} • Room {a.room}</p>
                  <div className="text-xs text-muted-foreground space-y-1 mb-3">
                    <p>Last Exit: {a.lastExit}</p>
                    <p>Expected Return: {a.expectedReturn}</p>
                    <p>Reason: {a.reason}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1"><Phone size={14} className="mr-1" />Call</Button>
                    <Button size="sm" variant="outline" className="flex-1"><MessageSquare size={14} className="mr-1" />Message</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
