import { useNavigate } from 'react-router';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenCurfewExtensions() {
  const navigate = useNavigate();
  const requests = [
    { student: 'Rahul Sharma', currentCurfew: '10:00 PM', requestedTime: '11:30 PM', reason: 'Project work in library' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Curfew Extensions</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          {requests.map((r, i) => (
            <Card key={i} className="bg-card border-border">
              <div className="p-4">
                <p className="text-sm mb-2">{r.student}</p>
                <p className="text-xs text-muted-foreground mb-3">Requested: {r.requestedTime} • Reason: {r.reason}</p>
                <div className="flex space-x-2">
                  <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600 text-white"><CheckCircle size={14} className="mr-1" />Approve</Button>
                  <Button size="sm" variant="outline" className="flex-1 text-red-600"><XCircle size={14} className="mr-1" />Reject</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
