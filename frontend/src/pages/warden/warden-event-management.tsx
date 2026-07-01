import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// TODO: Replace with live API when /v1/events endpoint is available
// Ready for integration with getEvents() and createEvent() from services/api

export function WardenEventManagement() {
  const navigate = useNavigate();
  const events = [
    { title: 'Cultural Night 2026', date: 'Jun 15, 2026', photos: 45, videos: 8 },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Event Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-4"><Plus size={18} className="mr-2" />Create Event</Button>
          <div className="space-y-3">
            {events.map((e, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center"><Calendar className="text-purple-600" size={20} /></div>
                    <div><p className="text-sm mb-1">{e.title}</p><p className="text-xs text-muted-foreground">{e.date}</p></div>
                  </div>
                  <p className="text-xs text-muted-foreground">{e.photos} photos • {e.videos} videos</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
