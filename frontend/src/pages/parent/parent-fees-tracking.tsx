import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, DollarSign, Download, CheckCircle2, Clock, CreditCard } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { api, getFeeDetails, getPaymentHistory, getPendingFees, type FeeRecord } from '../../services/api';

interface FeeSummaryState {
  totalFees: number;
  paidAmount: number;
  pendingAmount: number;
  nextDueDate: string;
}

interface PaymentHistoryState {
  id: string;
  date: string;
  amount: number;
  description: string;
  status: string;
  receipt: string;
}

interface UpcomingDueState {
  description: string;
  amount: number;
  dueDate: string;
}

export function ParentFeesTracking() {
  const navigate = useNavigate();
  const [feesData, setFeesData] = useState<FeeSummaryState>({
    totalFees: 0,
    paidAmount: 0,
    pendingAmount: 0,
    nextDueDate: '—',
  });
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryState[]>([]);
  const [upcomingDues, setUpcomingDues] = useState<UpcomingDueState[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadFees = async () => {
      try {
        const profile = await api.get<any>('v1/auth/me');
        const studentId = profile?.studentProfile?.id ?? profile?.studentId ?? profile?.id;

        if (!studentId) {
          throw new Error('Student id unavailable');
        }

        const [feeRecords, paymentRecords, pendingRecords] = await Promise.all([
          getFeeDetails(studentId),
          getPaymentHistory(studentId),
          getPendingFees(),
        ]);

        const totalFees = feeRecords.reduce((sum: number, fee: FeeRecord) => sum + Number(fee.amount ?? 0), 0);
        const paidAmount = feeRecords.reduce((sum: number, fee: FeeRecord) => sum + Number(fee.paidAmount ?? 0), 0);
        const pendingAmount = Math.max(totalFees - paidAmount, 0);
        const nextDueDate = feeRecords
          .filter((fee: FeeRecord) => Number(fee.paidAmount ?? 0) < Number(fee.amount ?? 0))
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0]?.dueDate;

        const mappedPayments = (paymentRecords || []).map((record: any) => ({
          id: record.id,
          date: new Date(record?.paidAt || record?.createdAt || record?.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
          amount: Number(record?.amount ?? 0),
          description: record?.description || record?.type || 'Fee payment',
          status: 'Paid',
          receipt: record?.receiptNumber || '—',
        }));

        const mappedDues = (pendingRecords || []).map((record: any) => ({
          description: record?.description || 'Pending fee',
          amount: Number(record?.amount ?? 0) - Number(record?.paidAmount ?? 0),
          dueDate: new Date(record?.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        }));

        if (isMounted) {
          setFeesData({
            totalFees,
            paidAmount,
            pendingAmount,
            nextDueDate: nextDueDate ? new Date(nextDueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—',
          });
          setPaymentHistory(mappedPayments);
          setUpcomingDues(mappedDues);
        }
      } catch {
        if (isMounted) {
          setFeesData({ totalFees: 0, paidAmount: 0, pendingAmount: 0, nextDueDate: '—' });
          setPaymentHistory([]);
          setUpcomingDues([]);
        }
      }
    };

    void loadFees();

    return () => {
      isMounted = false;
    };
  }, []);

  const paidPercentage = feesData.totalFees > 0 ? (feesData.paidAmount / feesData.totalFees) * 100 : 0;

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
            {upcomingDues.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground bg-card border border-border rounded-lg">No upcoming dues found.</div>
            ) : upcomingDues.map((due, index) => (
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
              {paymentHistory.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground bg-card border border-border rounded-lg">No payment history found.</div>
              ) : paymentHistory.map((payment) => (
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
