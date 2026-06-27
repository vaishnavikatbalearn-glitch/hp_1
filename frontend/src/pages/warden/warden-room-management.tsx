import { useNavigate } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export function WardenRoomManagement() {
  const navigate = useNavigate();
  const rooms = [
    { number: 'A-101', capacity: 4, occupied: 4, status: 'Full' },
    { number: 'A-102', capacity: 4, occupied: 3, status: 'Available' },
    { number: 'A-103', capacity: 4, occupied: 4, status: 'Full' },
    { number: 'A-104', capacity: 4, occupied: 2, status: 'Available' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Room Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {rooms.map((r, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Home className="text-blue-600" size={20} /></div>
                      <div><p className="text-sm mb-1">Room {r.number}</p><p className="text-xs text-muted-foreground">Capacity: {r.capacity}</p></div>
                    </div>
                    <Badge className={r.status === 'Full' ? 'bg-red-500' : 'bg-green-500'}>{r.status}</Badge>
                  </div>
                  <Progress value={(r.occupied / r.capacity) * 100} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">{r.occupied} / {r.capacity} occupied</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
