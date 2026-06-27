import { useNavigate } from 'react-router';
import { ArrowLeft, AlertCircle, Award, TrendingDown, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function ParentFinesRewards() {
  const navigate = useNavigate();

  const fines = [
    { id: 1, amount: 200, reason: "Late night entry", date: "Jun 15, 2026", status: "Paid" },
    { id: 2, amount: 100, reason: "Missed curfew by 30 minutes", date: "May 20, 2026", status: "Paid" },
  ];

  const rewards = [
    { id: 1, name: "Academic Excellence", points: 100, achievement: "Scored 95% in semester exams", date: "Jun 10, 2026" },
    { id: 2, name: "Sports Champion", points: 75, achievement: "Won inter-hostel cricket tournament", date: "May 25, 2026" },
    { id: 3, name: "Perfect Attendance", points: 50, achievement: "100% attendance in May", date: "May 31, 2026" },
    { id: 4, name: "Community Service", points: 40, achievement: "Volunteered in campus cleanup", date: "Apr 15, 2026" },
  ];

  const totalFines = fines.reduce((sum, fine) => sum + fine.amount, 0);
  const totalRewards = rewards.reduce((sum, reward) => sum + reward.points, 0);

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
