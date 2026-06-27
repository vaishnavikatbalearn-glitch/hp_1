import { useNavigate } from 'react-router';
import { ArrowLeft, Phone, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenAbsenteeList() {
  const navigate = useNavigate();
  const absentees = [
    { name: 'Amit Kumar', room: 'A-301', lastExit: 'Jun 18, 10:00 AM', expectedReturn: 'Jun 20, 6:00 PM', reason: 'Home Visit', leaveStatus: 'Approved' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button>
            <h1 className="text-white text-lg">Absentee List</h1>
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
