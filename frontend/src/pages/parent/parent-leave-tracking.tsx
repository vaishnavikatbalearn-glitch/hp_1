import { useNavigate } from 'react-router';
import { ArrowLeft, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function ParentLeaveTracking() {
  const navigate = useNavigate();

  const leaveRequests = [
    {
      id: 1,
      reason: "Family Wedding",
      startDate: "Jun 25, 2026",
      endDate: "Jun 27, 2026",
      days: 3,
      status: "Approved",
      approvedBy: "Dr. Ramesh Kumar",
      approvalTime: "Jun 19, 2026 • 2:30 PM",
      requestedOn: "Jun 18, 2026",
    },
    {
      id: 2,
      reason: "Medical Emergency",
      startDate: "Jun 10, 2026",
      endDate: "Jun 12, 2026",
      days: 3,
      status: "Approved",
      approvedBy: "Dr. Ramesh Kumar",
      approvalTime: "Jun 9, 2026 • 10:15 AM",
      requestedOn: "Jun 8, 2026",
    },
    {
      id: 3,
      reason: "Weekend Home Visit",
      startDate: "Jun 1, 2026",
      endDate: "Jun 2, 2026",
      days: 2,
      status: "Approved",
      approvedBy: "Dr. Ramesh Kumar",
      approvalTime: "May 30, 2026 • 4:00 PM",
      requestedOn: "May 29, 2026",
    },
    {
      id: 4,
      reason: "College Fest Preparation",
      startDate: "May 20, 2026",
      endDate: "May 20, 2026",
      days: 1,
      status: "Rejected",
      approvedBy: "Dr. Ramesh Kumar",
      approvalTime: "May 18, 2026 • 11:00 AM",
      requestedOn: "May 17, 2026",
    },
  ];

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
            <h1 className="text-white text-lg">Leave Tracking</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Summary */}
          <div className="px-6 py-6 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h2 className="text-base mb-4">Leave Summary</h2>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-white border-border">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1">4</p>
                  <p className="text-xs text-muted-foreground">Total Requests</p>
                </div>
              </Card>

              <Card className="bg-white border-border">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1 text-green-600">3</p>
                  <p className="text-xs text-muted-foreground">Approved</p>
                </div>
              </Card>

              <Card className="bg-white border-border">
                <div className="p-4 text-center">
                  <p className="text-2xl mb-1 text-red-600">1</p>
                  <p className="text-xs text-muted-foreground">Rejected</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Current Leave Status */}
          <div className="px-6 py-6">
            <h3 className="text-base mb-4">Current Status</h3>
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 size={24} />
                    <span className="text-lg">No Active Leave</span>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  Your child is currently present in the hostel
                </p>
              </div>
            </Card>
          </div>

          {/* Upcoming Leave */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Upcoming Leave</h3>
            <Card className="bg-amber-50 border-amber-200">
              <div className="p-5">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base mb-1">Family Wedding</h4>
                    <p className="text-sm text-muted-foreground mb-2">Approved • 3 days</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Start</p>
                        <p>Jun 25, 2026</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">End</p>
                        <p>Jun 27, 2026</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Leave History */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Leave History</h3>
            <div className="space-y-3">
              {leaveRequests.map((leave) => (
                <Card key={leave.id} className="bg-card border-border">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm mb-1">{leave.reason}</h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {leave.startDate} - {leave.endDate} ({leave.days} {leave.days === 1 ? 'day' : 'days'})
                        </p>
                      </div>
                      <Badge className={`text-xs flex-shrink-0 ml-2 ${
                        leave.status === 'Approved' ? 'bg-green-500' :
                        leave.status === 'Rejected' ? 'bg-red-500' :
                        'bg-amber-500'
                      } text-white`}>
                        {leave.status === 'Approved' ? (
                          <CheckCircle2 size={12} className="mr-1" />
                        ) : leave.status === 'Rejected' ? (
                          <XCircle size={12} className="mr-1" />
                        ) : (
                          <Clock size={12} className="mr-1" />
                        )}
                        {leave.status}
                      </Badge>
                    </div>

                    {leave.status !== 'Pending' && (
                      <div className="pt-3 border-t border-border space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">
                            {leave.status === 'Approved' ? 'Approved by' : 'Rejected by'}
                          </span>
                          <span>{leave.approvedBy}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Time</span>
                          <span>{leave.approvalTime}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
