import { useNavigate } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WardenLaundryMonitoring() {
  const navigate = useNavigate();
  const laundry = [
    { student: 'Rahul Sharma', room: 'A-204', status: 'Processing', items: 8, date: 'Jun 20, 2026' },
    { student: 'Priya Singh', room: 'B-105', status: 'Ready', items: 6, date: 'Jun 19, 2026' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Laundry Monitoring</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {laundry.map((l, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">{l.student}</p>
                    <Badge className={l.status === 'Ready' ? 'bg-green-500' : 'bg-blue-500'}>{l.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Room {l.room} • {l.items} items • {l.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
