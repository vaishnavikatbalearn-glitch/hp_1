import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function WardenComplaintManagement() {
  const navigate = useNavigate();
  const complaints = [
    { type: 'Maintenance', student: 'Rahul Sharma', priority: 'High', status: 'Pending', description: 'AC not working in room A-204' },
    { type: 'Cleanliness', student: 'Priya Singh', priority: 'Medium', status: 'In Progress', description: 'Bathroom cleaning required' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Complaint Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {complaints.map((c, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="text-red-600" size={18} />
                      <p className="text-sm">{c.type}</p>
                    </div>
                    <Badge className={c.priority === 'High' ? 'bg-red-500' : 'bg-amber-500'}>{c.priority}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{c.student}</p>
                  <p className="text-sm mb-2">{c.description}</p>
                  <Badge className={c.status === 'Pending' ? 'bg-amber-500' : 'bg-blue-500'} >{c.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
