import { useNavigate } from 'react-router';
import { ArrowLeft, DollarSign, Download, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export function ParentFeesTracking() {
  const navigate = useNavigate();

  const feesData = {
    totalFees: 85000,
    paidAmount: 72500,
    pendingAmount: 12500,
    nextDueDate: "Jul 15, 2026",
  };

  const paymentHistory = [
    { id: 1, date: "May 10, 2026", amount: 25000, description: "Semester 2 Fees", status: "Paid", receipt: "RCP-2026-001" },
    { id: 2, date: "Apr 15, 2026", amount: 22500, description: "Semester 1 Fees (Remaining)", status: "Paid", receipt: "RCP-2026-002" },
    { id: 3, date: "Mar 5, 2026", amount: 25000, description: "Semester 1 Fees (Installment)", status: "Paid", receipt: "RCP-2026-003" },
  ];

  const upcomingDues = [
    { description: "Semester 3 Fees", amount: 12500, dueDate: "Jul 15, 2026" },
  ];

  const paidPercentage = (feesData.paidAmount / feesData.totalFees) * 100;

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
            <h1 className="text-white text-lg">Fees Tracking</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto pb-6">
          {/* Fees Overview */}
          <div className="px-6 py-6">
            <Card className="bg-gradient-to-br from-[#2563EB] to-[#1E40AF] border-0 text-white">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white/80 text-sm mb-1">Total Annual Fees</p>
                    <p className="text-3xl">₹{feesData.totalFees.toLocaleString()}</p>
                  </div>
                  <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                    <DollarSign className="text-white" size={28} />
                  </div>
                </div>
                <Progress value={paidPercentage} className="h-2 bg-white/20 mb-2" />
                <p className="text-white/80 text-xs">{paidPercentage.toFixed(0)}% paid</p>
              </div>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Payment Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <Card className="bg-green-50 border-green-200">
                <div className="p-5">
                  <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mb-3">
                    <CheckCircle2 className="text-white" size={20} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Paid Amount</p>
                  <p className="text-xl">₹{feesData.paidAmount.toLocaleString()}</p>
                </div>
              </Card>

              <Card className="bg-amber-50 border-amber-200">
                <div className="p-5">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center mb-3">
                    <Clock className="text-white" size={20} />
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-xl">₹{feesData.pendingAmount.toLocaleString()}</p>
                </div>
              </Card>
            </div>
          </div>

          {/* Upcoming Dues */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Upcoming Dues</h3>
            {upcomingDues.map((due, index) => (
              <Card key={index} className="bg-amber-50 border-amber-200">
                <div className="p-5">
                  <div className="flex items-start space-x-3 mb-4">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                      <CreditCard className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base mb-1">{due.description}</h4>
                      <p className="text-2xl mb-2">₹{due.amount.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        <Clock className="text-muted-foreground" size={14} />
                        <p className="text-sm text-muted-foreground">Due: {due.dueDate}</p>
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                    Pay Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Payment History */}
          <div className="px-6 mb-6">
            <h3 className="text-base mb-4">Payment History</h3>
            <div className="space-y-3">
              {paymentHistory.map((payment) => (
                <Card key={payment.id} className="bg-card border-border">
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="text-green-600" size={20} />
                        </div>
                        <div>
                          <h4 className="text-sm mb-1">{payment.description}</h4>
                          <p className="text-xs text-muted-foreground mb-1">{payment.date}</p>
                          <p className="text-lg">₹{payment.amount.toLocaleString()}</p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white text-xs">
                        {payment.status}
                      </Badge>
                    </div>

                    <div className="pt-3 border-t border-border flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Receipt: {payment.receipt}</p>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Download size={14} className="mr-1" />
                        Download
                      </Button>
                    </div>
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
