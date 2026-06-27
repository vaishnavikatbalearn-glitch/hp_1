import { useNavigate } from 'react-router';
import { ArrowLeft, Download, FileText, Calendar, Users, DollarSign, AlertCircle, Home } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function WardenReports() {
  const navigate = useNavigate();
  const reports = [
    { name: 'Attendance Report', icon: Calendar, description: 'Monthly attendance summary', color: 'bg-green-100', iconColor: 'text-green-600' },
    { name: 'Leave Report', icon: FileText, description: 'Leave requests and approvals', color: 'bg-blue-100', iconColor: 'text-blue-600' },
    { name: 'Fee Report', icon: DollarSign, description: 'Fee payment status', color: 'bg-amber-100', iconColor: 'text-amber-600' },
    { name: 'Complaint Report', icon: AlertCircle, description: 'Complaint resolution status', color: 'bg-red-100', iconColor: 'text-red-600' },
    { name: 'Occupancy Report', icon: Home, description: 'Room occupancy details', color: 'bg-purple-100', iconColor: 'text-purple-600' },
  ];
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="max-w-md mx-auto w-full min-h-screen bg-background shadow-2xl flex flex-col">
        <div className="bg-gradient-to-br from-[#14B8A6] to-[#0D9488] px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center space-x-3"><button onClick={() => navigate('/warden')} className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all backdrop-blur-sm"><ArrowLeft className="text-white" size={20} /></button><h1 className="text-white text-lg">Reports</h1></div>
        </div>
        <div className="flex-1 overflow-auto pb-6 px-6 py-6">
          <div className="space-y-3">
            {reports.map((r, i) => {
              const Icon = r.icon;
              return (
                <Card key={i} className="bg-card border-border">
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className={`w-10 h-10 ${r.color} rounded-xl flex items-center justify-center`}><Icon className={r.iconColor} size={20} /></div>
                        <div className="flex-1">
                          <p className="text-sm mb-1">{r.name}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline"><Download size={14} /></Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
