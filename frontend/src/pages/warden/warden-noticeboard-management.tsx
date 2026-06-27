import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Pin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export function WardenNoticeBoardManagement() {
  const navigate = useNavigate();
  const notices = [
    { title: 'Parent-Teacher Meeting', category: 'Important', date: 'Jun 18, 2026', pinned: true },
    { title: 'Hostel Maintenance', category: 'Announcement', date: 'Jun 17, 2026', pinned: false },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Notice Board</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-4"><Plus size={18} className="mr-2" />Create Notice</Button>
          <div className="space-y-3">
            {notices.map((n, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {n.pinned && <Pin className="text-amber-600" size={16} />}
                      <p className="text-sm">{n.title}</p>
                    </div>
                    <Badge className="bg-red-500">{n.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{n.date}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
