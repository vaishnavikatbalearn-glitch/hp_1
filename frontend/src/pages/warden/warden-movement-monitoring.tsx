import { useNavigate } from 'react-router';
import { ArrowLeft, LogIn, LogOut, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WardenMovementMonitoring() {
  const navigate = useNavigate();
  const movements = [
    { student: 'Rahul Sharma', room: 'A-204', exitTime: '8:30 AM', entryTime: 'In Progress', duration: '2h 30m', status: 'Outside' },
    { student: 'Priya Singh', room: 'B-105', exitTime: '9:00 AM', entryTime: '6:30 PM', duration: '9h 30m', status: 'Returned' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm">
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Movement Monitoring</h1>
          </div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {movements.map((m, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm mb-1">{m.student}</p>
                      <p className="text-xs text-muted-foreground">Room {m.room}</p>
                    </div>
                    <Badge className={m.status === 'Outside' ? 'bg-orange-500' : 'bg-green-500'}>{m.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2">
                      <LogOut className="text-orange-600" size={16} />
                      <span>{m.exitTime}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <LogIn className="text-green-600" size={16} />
                      <span>{m.entryTime}</span>
                    </div>
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
