import { useNavigate } from 'react-router';
import { ArrowLeft, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// TODO: Replace with live API when /v1/fines endpoint is available
// Ready for integration with getFines() and createFine() from services/api

export function WardenFineManagement() {
  const navigate = useNavigate();
  const fines = [
    { student: 'Rahul Sharma', amount: 200, reason: 'Late night entry', date: 'Jun 15, 2026', status: 'Paid' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Fine Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-4"><Plus size={18} className="mr-2" />Add Fine</Button>
          <div className="space-y-3">
            {fines.map((f, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm">{f.student}</p>
                    <Badge className="bg-green-500">{f.status}</Badge>
                  </div>
                  <p className="text-lg mb-1">₹{f.amount}</p>
                  <p className="text-xs text-muted-foreground">{f.reason} • {f.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
