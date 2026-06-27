import { useNavigate } from 'react-router';
import { ArrowLeft, Clock, Edit } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenCurfewManagement() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Curfew Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Card className="bg-card border-border mb-4">
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Clock className="text-blue-600" size={20} /></div>
                <div><p className="text-sm mb-1">Hostel Curfew</p><p className="text-xs text-muted-foreground">10:00 PM</p></div>
              </div>
              <Button size="sm" variant="outline"><Edit size={14} /></Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
