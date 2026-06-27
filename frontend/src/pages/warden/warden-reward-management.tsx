import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenRewardManagement() {
  const navigate = useNavigate();
  const rewards = [
    { student: 'Rahul Sharma', reward: 'Academic Excellence', points: 100, achievement: 'Scored 95% in exams', date: 'Jun 10, 2026' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Reward Management</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <Button className="w-full bg-primary hover:bg-primary/90 text-white mb-4"><Plus size={18} className="mr-2" />Add Reward</Button>
          <div className="space-y-3">
            {rewards.map((r, i) => (
              <Card key={i} className="bg-card border-border">
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center"><Award className="text-green-600" size={20} /></div>
                    <div className="flex-1">
                      <p className="text-sm mb-1">{r.student}</p>
                      <p className="text-sm mb-1">{r.reward} • +{r.points} pts</p>
                      <p className="text-xs text-muted-foreground">{r.achievement}</p>
                    </div>
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
