import { useNavigate } from 'react-router';
import { ArrowLeft, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenCapacityManagement() {
  const navigate = useNavigate();
  const rooms = [
    { number: 'A-101', capacity: 4, occupied: 4, vacant: 0 },
    { number: 'A-102', capacity: 4, occupied: 3, vacant: 1 },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Capacity Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {rooms.map((r, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4 flex items-center justify-between">
                  <div><p className="text-sm mb-2">Room {r.number}</p><div className="flex space-x-4 text-xs"><span>Capacity: {r.capacity}</span><span>Occupied: {r.occupied}</span><span>Vacant: {r.vacant}</span></div></div>
                  <Button size="sm" variant="outline"><Edit size={14} /></Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
