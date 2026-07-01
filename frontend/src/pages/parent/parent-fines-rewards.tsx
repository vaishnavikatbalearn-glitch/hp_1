import { useEffect, useState } from 'react';

import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, Award, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api, getFines, getRewards } from '../../services/api';


export function ParentFinesRewards() {

  const navigate = useNavigate();

  const [fines, setFines] = useState<Array<{ id: string; amount: number; reason: string; date: string; status: string }>>([]);
  const [rewards, setRewards] = useState<Array<{ id: string; name: string; points: number; achievement: string; date: string }>>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [fineItems, rewardItems] = await Promise.all([
          getFines(),
          getRewards(),
        ]);



        const mappedFines = fineItems.map((f: any) => {
          const issuedAt = f.issuedAt ?? f.issuedDate;
          const dueAt = f.dueDate;
          const displayDate = issuedAt
            ? new Date(issuedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : dueAt
              ? new Date(dueAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—';

          return {
            id: String(f.id),
            amount: Number(f.amount ?? 0),
            reason: f.reason ? String(f.reason) : '—',
            date: displayDate,
            status: f.status ? String(f.status) : '—',
          };
        });

        const mappedRewards = rewardItems.map((r: any) => ({
          id: String(r.id),
          name: r.rewardType ? String(r.rewardType) : '—',
          points: Number(r.points ?? 0),
          achievement: r.reason ? String(r.reason) : '—',
          date: r.awardedDate
            ? new Date(r.awardedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—',
        }));


        setFines(mappedFines);
        setRewards(mappedRewards);
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const totalFines = fines.reduce((sum: number, fine) => sum + (Number(fine.amount) || 0), 0);
  const totalRewards = rewards.reduce((sum: number, reward) => sum + (Number(reward.points) || 0), 0);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/parent')}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <h1 className="text-white text-lg">Fines & Rewards</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-gradient-to-br from-red-500 to-red-600 border-0 text-white">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle size={24} />
                    <TrendingDown size={18} />
                  </div>
                  <p className="text-white/80 text-xs mb-1">Total Fines</p>
                  <p className="text-2xl">₹{totalFines}</p>
                </div>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <Award size={24} />
                    <TrendingUp size={18} />
                  </div>
                  <p className="text-white/80 text-xs mb-1">Reward Points</p>
                  <p className="text-2xl">{totalRewards}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <div className="px-6 mb-6">
            <Tabs defaultValue="rewards" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="rewards">Rewards</TabsTrigger>
                <TabsTrigger value="fines">Fines</TabsTrigger>
              </TabsList>

              {/* Rewards Tab */}
              <TabsContent value="rewards">
                <div className="space-y-3">
                  {rewards.map((reward) => (
                    <Card key={reward.id} className="bg-card border-border">
                      <div className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Award className="text-white" size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm">{reward.name}</h4>
                              <Badge className="bg-green-500 text-white text-xs">
                                +{reward.points} pts
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">{reward.achievement}</p>
                            <p className="text-xs text-muted-foreground">{reward.date}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Fines Tab */}
              <TabsContent value="fines">
                {fines.length > 0 ? (
                  <div className="space-y-3">
                    {fines.map((fine) => (
                      <Card key={fine.id} className="bg-card border-border">
                        <div className="p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                              <AlertCircle className="text-red-600" size={24} />
                            </div>
                      <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-sm">{fine.reason}</h4>
                                <p className="text-base">₹{fine.amount}</p>
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">{fine.date}</p>
                                <Badge className={`text-xs ${
                                  fine.status === 'Paid' ? 'bg-green-500' : 'bg-amber-500'
                                } text-white`}>
                                  {fine.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="bg-green-50 border-green-200">
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Award className="text-white" size={32} />
                      </div>
                      <h4 className="text-base mb-2">No Fines!</h4>
                      <p className="text-sm text-muted-foreground">
                        Great behavior! No fines recorded.
                      </p>
                    </div>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
